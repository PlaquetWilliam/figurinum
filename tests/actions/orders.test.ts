import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  // redirect() interrompt l'exécution dans Next.js (il lève un signal
  // interne). On reproduit ce comportement pour vérifier à la fois QUE la
  // redirection a lieu ET vers quelle URL, comme le ferait Next en réel.
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/mongodb", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/dal", () => ({
  verifySession: vi.fn().mockResolvedValue({ userId: "user-1", role: "USER" }),
  verifyAdmin: vi.fn().mockResolvedValue({ userId: "admin-1", role: "ADMIN" }),
}));

vi.mock("@/lib/stripe", () => ({
  isStripeConfigured: vi.fn().mockReturnValue(false),
  createCheckoutSession: vi.fn(),
}));

vi.mock("@/lib/models", () => ({
  CartItem: { find: vi.fn(), deleteMany: vi.fn() },
  Order: { create: vi.fn(), findByIdAndUpdate: vi.fn(), findById: vi.fn() },
  OrderItem: { insertMany: vi.fn(), deleteMany: vi.fn() },
  Product: {
    // findOneAndUpdate : décrément conditionnel atomique utilisé par lib/stock.
    findOneAndUpdate: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

import { CartItem, Order, OrderItem, Product } from "@/lib/models";
import { isStripeConfigured } from "@/lib/stripe";
import { createOrder, updateOrderStatus } from "@/app/actions/orders";

const mockedCartItem = vi.mocked(CartItem);
const mockedOrder = vi.mocked(Order);
const mockedOrderItem = vi.mocked(OrderItem);
const mockedProduct = vi.mocked(Product);
const mockedIsStripeConfigured = vi.mocked(isStripeConfigured);

beforeEach(() => {
  vi.clearAllMocks();
  mockedIsStripeConfigured.mockReturnValue(false);
  // Par défaut la réservation atomique réussit : MongoDB renvoie le document
  // mis à jour. `null` signifierait « stock insuffisant » (cf. lib/stock.ts).
  mockedProduct.findOneAndUpdate.mockResolvedValue({ _id: "prod-1", stock: 1 } as never);
});

describe("createOrder", () => {
  it("refuse de créer une commande si le panier est vide", async () => {
    mockedCartItem.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue([]),
    } as never);

    const result = await createOrder();

    expect(result).toEqual({ error: "Votre panier est vide." });
    expect(mockedOrder.create).not.toHaveBeenCalled();
  });

  it("calcule le total, décrémente le stock (mode démo sans Stripe) et vide le panier", async () => {
    mockedCartItem.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue([
        {
          _id: "cart-1",
          productId: "prod-1",
          quantity: 2,
          product: { _id: "prod-1", name: "Figurine A", price: 10, stock: 5 },
        },
        {
          _id: "cart-2",
          productId: "prod-2",
          quantity: 1,
          product: { _id: "prod-2", name: "Figurine B", price: 30, stock: 3 },
        },
      ]),
    } as never);
    mockedOrder.create.mockResolvedValue({ _id: "order-1", id: "order-1" } as never);

    await expect(createOrder()).rejects.toThrow("REDIRECT:/checkout/success?order=order-1");

    // Total = 2*10 + 1*30 = 50
    expect(mockedOrder.create).toHaveBeenCalledWith({ userId: "user-1", total: 50 });

    // Toutes les lignes créées en une seule opération groupée
    expect(mockedOrderItem.insertMany).toHaveBeenCalledWith([
      { orderId: "order-1", productId: "prod-1", quantity: 2, price: 10 },
      { orderId: "order-1", productId: "prod-2", quantity: 1, price: 30 },
    ]);

    // Décrément conditionnel ET atomique : la condition de stock fait partie
    // du filtre, donc MongoDB refuse la mise à jour si le stock a baissé
    // entre-temps (protection contre deux commandes concurrentes).
    expect(mockedProduct.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "prod-1", stock: { $gte: 2 } },
      { $inc: { stock: -2 } },
      { new: true }
    );
    expect(mockedProduct.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "prod-2", stock: { $gte: 1 } },
      { $inc: { stock: -1 } },
      { new: true }
    );

    expect(mockedCartItem.deleteMany).toHaveBeenCalledWith({ userId: "user-1" });
    expect(mockedOrder.findByIdAndUpdate).toHaveBeenCalledWith("order-1", { status: "PAID" });
  });

  it("redirige vers Stripe Checkout sans décrémenter le stock localement quand Stripe est configuré", async () => {
    mockedIsStripeConfigured.mockReturnValue(true);
    mockedCartItem.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue([
        {
          _id: "cart-1",
          productId: "prod-1",
          quantity: 1,
          product: { _id: "prod-1", name: "Figurine A", price: 10, stock: 5 },
        },
      ]),
    } as never);
    mockedOrder.create.mockResolvedValue({ _id: "order-1", id: "order-1" } as never);

    const { createCheckoutSession } = await import("@/lib/stripe");
    vi.mocked(createCheckoutSession).mockResolvedValue("https://checkout.stripe.com/session-xyz");

    await expect(createOrder()).rejects.toThrow(
      "REDIRECT:https://checkout.stripe.com/session-xyz"
    );

    // Le paiement (et donc la réservation de stock, gérée par le webhook
    // Stripe) n'est pas déclenché ici : c'est le webhook qui s'en charge après
    // paiement réellement confirmé.
    expect(mockedProduct.findOneAndUpdate).not.toHaveBeenCalled();
    expect(mockedProduct.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(mockedCartItem.deleteMany).not.toHaveBeenCalled();
  });

  it("annule la commande et ne vide pas le panier si le stock est parti entre le contrôle et la réservation", async () => {
    mockedCartItem.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue([
        {
          _id: "cart-1",
          productId: "prod-1",
          quantity: 1,
          product: { _id: "prod-1", name: "Figurine A", price: 10, stock: 1 },
        },
      ]),
    } as never);
    mockedOrder.create.mockResolvedValue({ _id: "order-1", id: "order-1" } as never);

    // Le pré-contrôle voit stock: 1, mais une autre commande a pris l'article
    // entre-temps : le décrément conditionnel ne trouve plus de document.
    mockedProduct.findOneAndUpdate.mockResolvedValue(null as never);

    const result = await createOrder();

    expect(result).toEqual({
      error: "Stock insuffisant : la commande a été annulée.",
    });
    expect(mockedOrder.findByIdAndUpdate).toHaveBeenCalledWith("order-1", {
      status: "CANCELLED",
    });
    expect(mockedCartItem.deleteMany).not.toHaveBeenCalled();
  });
});

describe("updateOrderStatus", () => {
  it("restitue le stock quand une commande PAID est annulée", async () => {
    mockedOrder.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue({
        _id: "order-1",
        status: "PAID",
        items: [
          { productId: "prod-1", quantity: 2 },
          { productId: "prod-2", quantity: 1 },
        ],
      }),
    } as never);

    await updateOrderStatus("order-1", "CANCELLED");

    expect(mockedProduct.findByIdAndUpdate).toHaveBeenCalledWith("prod-1", {
      $inc: { stock: 2 },
    });
    expect(mockedProduct.findByIdAndUpdate).toHaveBeenCalledWith("prod-2", {
      $inc: { stock: 1 },
    });
    expect(mockedOrder.findByIdAndUpdate).toHaveBeenCalledWith("order-1", {
      status: "CANCELLED",
    });
  });

});
