import { describe, it, expect, beforeEach, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/mongodb", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/models", () => ({
  CartItem: { deleteMany: vi.fn() },
  Order: { findOneAndUpdate: vi.fn(), findByIdAndUpdate: vi.fn() },
  OrderItem: { find: vi.fn() },
  Product: { findOneAndUpdate: vi.fn(), findByIdAndUpdate: vi.fn() },
}));

const { stripeMock } = vi.hoisted(() => ({
  stripeMock: {
    webhooks: { constructEvent: vi.fn() },
    refunds: { create: vi.fn() },
  },
}));

vi.mock("@/lib/stripe", () => ({
  isStripeConfigured: vi.fn().mockReturnValue(true),
  getStripe: vi.fn(() => stripeMock),
}));

import { CartItem, Order, OrderItem, Product } from "@/lib/models";
import { POST } from "@/app/api/stripe/webhook/route";

const mockedOrder = vi.mocked(Order);
const mockedOrderItem = vi.mocked(OrderItem);
const mockedCartItem = vi.mocked(CartItem);
const mockedProduct = vi.mocked(Product);

// La signature est vérifiée par le SDK Stripe (constructEvent, mocké ici) :
// une requête minimale suffit pour exercer la logique métier de la route.
function stripeRequest(): NextRequest {
  return {
    text: async () => "{}",
    headers: { get: () => "signature-de-test" },
  } as unknown as NextRequest;
}

function checkoutCompletedEvent(paymentIntent: string | null = "pi_123") {
  return {
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_1",
        payment_intent: paymentIntent,
        metadata: { orderId: "order-1", userId: "user-1" },
      },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_placeholder";
  stripeMock.webhooks.constructEvent.mockReturnValue(checkoutCompletedEvent());
  mockedOrderItem.find.mockResolvedValue([
    { _id: "item-1", productId: "prod-1", quantity: 2 },
  ] as never);
});

describe("webhook Stripe — paiement confirmé", () => {
  it("réserve le stock de façon atomique, passe la commande à PAID et vide le panier", async () => {
    mockedOrder.findOneAndUpdate.mockResolvedValue({ _id: "order-1" } as never);
    mockedProduct.findOneAndUpdate.mockResolvedValue({
      _id: "prod-1",
      stock: 1,
    } as never);

    const response = await POST(stripeRequest());

    expect(response.status).toBe(200);
    expect(mockedProduct.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "prod-1", stock: { $gte: 2 } },
      { $inc: { stock: -2 } },
      { new: true }
    );
    expect(mockedOrder.findByIdAndUpdate).toHaveBeenCalledWith("order-1", {
      status: "PAID",
    });
    expect(mockedCartItem.deleteMany).toHaveBeenCalledWith({ userId: "user-1" });
    expect(stripeMock.refunds.create).not.toHaveBeenCalled();
  });

  it("revendique la commande de façon atomique (PENDING et sans session Stripe)", async () => {
    mockedOrder.findOneAndUpdate.mockResolvedValue({ _id: "order-1" } as never);
    mockedProduct.findOneAndUpdate.mockResolvedValue({ _id: "prod-1" } as never);

    await POST(stripeRequest());

    expect(mockedOrder.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "order-1", status: "PENDING", stripeSessionId: null },
      { stripeSessionId: "cs_test_1" },
      { new: true }
    );
  });
});

describe("webhook Stripe — idempotence", () => {
  it("ne décrémente pas une seconde fois quand le même événement est rejoué", async () => {
    // La commande a déjà été revendiquée : le filtre ne correspond plus.
    mockedOrder.findOneAndUpdate.mockResolvedValue(null as never);

    const response = await POST(stripeRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      received: true,
      alreadyProcessed: true,
    });
    expect(mockedProduct.findOneAndUpdate).not.toHaveBeenCalled();
    expect(mockedCartItem.deleteMany).not.toHaveBeenCalled();
  });
});

describe("webhook Stripe — stock devenu indisponible", () => {
  it("rembourse le paiement et annule la commande", async () => {
    mockedOrder.findOneAndUpdate.mockResolvedValue({ _id: "order-1" } as never);
    mockedProduct.findOneAndUpdate.mockResolvedValue(null as never);

    const response = await POST(stripeRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      received: true,
      outOfStock: true,
    });
    expect(stripeMock.refunds.create).toHaveBeenCalledWith({
      payment_intent: "pi_123",
    });
    expect(mockedOrder.findByIdAndUpdate).toHaveBeenCalledWith("order-1", {
      status: "CANCELLED",
    });
    // Le panier est conservé : le client n'a rien payé au final.
    expect(mockedCartItem.deleteMany).not.toHaveBeenCalled();
  });

  it("annule la commande même si le remboursement Stripe échoue", async () => {
    mockedOrder.findOneAndUpdate.mockResolvedValue({ _id: "order-1" } as never);
    mockedProduct.findOneAndUpdate.mockResolvedValue(null as never);
    stripeMock.refunds.create.mockRejectedValue(new Error("refund refusé"));

    const response = await POST(stripeRequest());

    expect(response.status).toBe(200);
    expect(mockedOrder.findByIdAndUpdate).toHaveBeenCalledWith("order-1", {
      status: "CANCELLED",
    });
  });
});

describe("webhook Stripe — sécurité", () => {
  it("rejette une signature invalide sans toucher à la base", async () => {
    stripeMock.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("signature mismatch");
    });

    const response = await POST(stripeRequest());

    expect(response.status).toBe(400);
    expect(mockedOrder.findOneAndUpdate).not.toHaveBeenCalled();
    expect(mockedProduct.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("rejette une requête sans secret de webhook configuré", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const response = await POST(stripeRequest());

    expect(response.status).toBe(400);
    expect(stripeMock.webhooks.constructEvent).not.toHaveBeenCalled();
  });
});
