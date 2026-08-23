import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks des dépendances (équivalent des mocks IAstreinteProvider/ICongeProvider
// côté MAAF) : on isole la logique métier de cart.ts de Mongo, de l'authentification
// et du cache Next.js, qui ne font pas partie de ce qui est testé ici. ---
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/mongodb", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/dal", () => ({
  verifySession: vi.fn().mockResolvedValue({ userId: "user-1", role: "USER" }),
}));

vi.mock("@/lib/models", () => ({
  CartItem: {
    findOne: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn(),
    find: vi.fn(),
  },
  Product: {
    findById: vi.fn(),
  },
}));

import { CartItem, Product } from "@/lib/models";
import { addToCart, updateCartQuantity, removeFromCart, getCartCount } from "@/app/actions/cart";

const mockedCartItem = vi.mocked(CartItem);
const mockedProduct = vi.mocked(Product);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("addToCart", () => {
  it("refuse d'ajouter un produit en rupture de stock", async () => {
    mockedProduct.findById.mockResolvedValue({ stock: 0 });

    const result = await addToCart("produit-1");

    expect(result).toEqual({ error: "Produit indisponible." });
  });

  it("crée une nouvelle ligne de panier si le produit n'y est pas encore", async () => {
    mockedProduct.findById.mockResolvedValue({ stock: 5 });
    mockedCartItem.findOne.mockResolvedValue(null);

    const result = await addToCart("produit-1");

    expect(result).toEqual({ success: true });
    expect(mockedCartItem.create).toHaveBeenCalledWith({
      userId: "user-1",
      productId: "produit-1",
      quantity: 1,
    });
  });

});

describe("updateCartQuantity", () => {
  it("met à jour la quantité quand elle est valide", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const item = { quantity: 1, product: { stock: 5 }, save };
    mockedCartItem.findOne.mockReturnValue({
      populate: vi.fn().mockResolvedValue(item),
    } as never);

    const result = await updateCartQuantity("cart-item-1", 3);

    expect(result).toEqual({ success: true });
    expect(item.quantity).toBe(3);
    expect(save).toHaveBeenCalled();
  });
});

describe("removeFromCart", () => {
  it("supprime la ligne de panier de l'utilisateur courant", async () => {
    mockedCartItem.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 } as never);

    const result = await removeFromCart("cart-item-1");

    expect(result).toEqual({ success: true });
    expect(mockedCartItem.deleteOne).toHaveBeenCalledWith({
      _id: "cart-item-1",
      userId: "user-1",
    });
  });
});

describe("getCartCount", () => {
  it("additionne les quantités de toutes les lignes du panier", async () => {
    mockedCartItem.find.mockReturnValue({
      select: vi.fn().mockResolvedValue([{ quantity: 2 }, { quantity: 3 }]),
    } as never);

    const count = await getCartCount("user-1");

    expect(count).toBe(5);
  });

});
