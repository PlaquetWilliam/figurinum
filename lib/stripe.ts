import Stripe from "stripe";
import type { CartItem, Order, Product } from "@/lib/types";

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY non configuré");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

type CartItemWithProduct = CartItem & { product: Product };

export async function createCheckoutSession(
  order: Order,
  cartItems: CartItemWithProduct[]
) {
  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: cartItems.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.product.name,
          description: item.product.description,
          images: item.product.image.startsWith("http")
            ? [item.product.image]
            : [`${baseUrl}${item.product.image}`],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    })),
    metadata: {
      orderId: order.id,
      userId: order.userId,
    },
    success_url: `${baseUrl}/checkout/success?order=${order.id}`,
    cancel_url: `${baseUrl}/cart`,
  });

  return session.url!;
}
