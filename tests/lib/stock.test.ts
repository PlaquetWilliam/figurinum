import { describe, it, expect, beforeEach, vi } from "vitest";

// Faux modèle Product en mémoire. `vi.hoisted` est nécessaire car les factories
// de vi.mock sont évaluées avant les déclarations du fichier de test.
const { db } = vi.hoisted(() => ({
  db: { stocks: new Map<string, number>() },
}));

/** Simule la latence d'un aller-retour réseau vers MongoDB. */
const tick = () => new Promise((resolve) => setImmediate(resolve));

vi.mock("@/lib/models", () => ({
  Product: {
    // Reproduit la sémantique d'un findOneAndUpdate MongoDB sur un seul
    // document : l'attente (latence) a lieu AVANT la section critique, puis la
    // condition et la mutation sont appliquées sans interruption possible —
    // exactement la garantie qu'offre MongoDB par document. Deux appels
    // concurrents peuvent donc s'entrelacer, mais jamais au milieu du couple
    // « vérifie le stock / décrémente ».
    findOneAndUpdate: vi.fn(
      async (
        filter: { _id: string; stock?: { $gte: number } },
        update: { $inc: { stock: number } }
      ) => {
        await tick();

        const current = db.stocks.get(filter._id);
        if (current === undefined) return null;

        const minimum = filter.stock?.$gte;
        if (minimum !== undefined && current < minimum) return null;

        const next = current + update.$inc.stock;
        db.stocks.set(filter._id, next);
        return { _id: filter._id, stock: next };
      }
    ),
    findByIdAndUpdate: vi.fn(
      async (id: string, update: { $inc: { stock: number } }) => {
        await tick();

        const current = db.stocks.get(id);
        if (current === undefined) return null;

        const next = current + update.$inc.stock;
        db.stocks.set(id, next);
        return { _id: id, stock: next };
      }
    ),
  },
}));

import { Product } from "@/lib/models";
import {
  releaseReservedStock,
  reserveStock,
  reserveStockForItems,
  restoreStock,
} from "@/lib/stock";

beforeEach(() => {
  vi.clearAllMocks();
  db.stocks.clear();
});

describe("reserveStock", () => {
  it("décrémente quand le stock est suffisant", async () => {
    db.stocks.set("prod-1", 5);

    await expect(reserveStock("prod-1", 2)).resolves.toBe(true);
    expect(db.stocks.get("prod-1")).toBe(3);
  });

  it("accepte une demande égale au stock restant et le ramène à 0", async () => {
    db.stocks.set("prod-1", 3);

    await expect(reserveStock("prod-1", 3)).resolves.toBe(true);
    expect(db.stocks.get("prod-1")).toBe(0);
  });

  it("refuse une demande supérieure au stock, sans rien décrémenter", async () => {
    db.stocks.set("prod-1", 2);

    await expect(reserveStock("prod-1", 3)).resolves.toBe(false);
    expect(db.stocks.get("prod-1")).toBe(2);
  });

  it("exprime la condition de stock dans le filtre de la mise à jour", async () => {
    db.stocks.set("prod-1", 5);
    await reserveStock("prod-1", 2);

    // La garantie d'atomicité repose entièrement sur ce filtre : si la
    // condition sortait du filtre, la protection concurrente disparaîtrait.
    expect(vi.mocked(Product.findOneAndUpdate)).toHaveBeenCalledWith(
      { _id: "prod-1", stock: { $gte: 2 } },
      { $inc: { stock: -2 } },
      { new: true }
    );
  });

  it("refuse une quantité nulle ou négative (qui créditerait le stock)", async () => {
    db.stocks.set("prod-1", 5);

    await expect(reserveStock("prod-1", 0)).resolves.toBe(false);
    await expect(reserveStock("prod-1", -3)).resolves.toBe(false);
    expect(db.stocks.get("prod-1")).toBe(5);
    expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("refuse un produit inexistant", async () => {
    await expect(reserveStock("inconnu", 1)).resolves.toBe(false);
  });
});

describe("restauration du stock", () => {
  it("recrédite le stock d'un produit", async () => {
    db.stocks.set("prod-1", 1);

    await restoreStock("prod-1", 2);

    expect(db.stocks.get("prod-1")).toBe(3);
  });

  it("recrédite plusieurs lignes réservées", async () => {
    db.stocks.set("prod-1", 0);
    db.stocks.set("prod-2", 4);

    await releaseReservedStock([
      { productId: "prod-1", quantity: 2 },
      { productId: "prod-2", quantity: 1 },
    ]);

    expect(db.stocks.get("prod-1")).toBe(2);
    expect(db.stocks.get("prod-2")).toBe(5);
  });
});

describe("reserveStockForItems (tout ou rien)", () => {
  it("réserve toutes les lignes quand chaque stock est suffisant", async () => {
    db.stocks.set("prod-1", 5);
    db.stocks.set("prod-2", 2);

    const result = await reserveStockForItems([
      { productId: "prod-1", quantity: 2 },
      { productId: "prod-2", quantity: 2 },
    ]);

    expect(result).toEqual({ ok: true });
    expect(db.stocks.get("prod-1")).toBe(3);
    expect(db.stocks.get("prod-2")).toBe(0);
  });

  it("restitue les réservations déjà faites quand une ligne échoue", async () => {
    db.stocks.set("prod-1", 5);
    db.stocks.set("prod-2", 1);

    const result = await reserveStockForItems([
      { productId: "prod-1", quantity: 2 },
      { productId: "prod-2", quantity: 3 },
    ]);

    expect(result).toEqual({ ok: false, failedProductId: "prod-2" });
    // Aucun état partiellement modifié ne doit subsister.
    expect(db.stocks.get("prod-1")).toBe(5);
    expect(db.stocks.get("prod-2")).toBe(1);
  });

  it("restitue les réservations déjà faites si MongoDB lève une erreur", async () => {
    db.stocks.set("prod-1", 5);

    vi.mocked(Product.findOneAndUpdate).mockImplementationOnce(
      async (
        filter: { _id: string },
        update: { $inc: { stock: number } }
      ) => {
        const current = db.stocks.get(filter._id) ?? 0;
        db.stocks.set(filter._id, current + update.$inc.stock);
        return { _id: filter._id };
      }
    );
    vi.mocked(Product.findOneAndUpdate).mockImplementationOnce(async () => {
      throw new Error("connexion perdue");
    });

    await expect(
      reserveStockForItems([
        { productId: "prod-1", quantity: 2 },
        { productId: "prod-2", quantity: 1 },
      ])
    ).rejects.toThrow("connexion perdue");

    expect(db.stocks.get("prod-1")).toBe(5);
  });
});

describe("concurrence sur le dernier article", () => {
  it("n'accorde le dernier exemplaire qu'à une seule des deux demandes simultanées", async () => {
    db.stocks.set("prod-1", 1);

    const results = await Promise.all([
      reserveStock("prod-1", 1),
      reserveStock("prod-1", 1),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
    expect(db.stocks.get("prod-1")).toBe(0);
  });

  it("ne descend jamais sous zéro même avec dix demandes simultanées pour trois articles", async () => {
    db.stocks.set("prod-1", 3);

    const results = await Promise.all(
      Array.from({ length: 10 }, () => reserveStock("prod-1", 1))
    );

    expect(results.filter(Boolean)).toHaveLength(3);
    expect(db.stocks.get("prod-1")).toBe(0);
  });

  it("ne descend jamais sous zéro sur des commandes successives", async () => {
    db.stocks.set("prod-1", 2);

    await expect(reserveStock("prod-1", 2)).resolves.toBe(true);
    await expect(reserveStock("prod-1", 1)).resolves.toBe(false);
    expect(db.stocks.get("prod-1")).toBe(0);
  });
});
