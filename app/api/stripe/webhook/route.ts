import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import { CartItem, Order, Product } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import type { Order as OrderType, OrderItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 400 });
  }

  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;

    if (orderId && userId) {
      await connectDB();
      const orderDoc = await Order.findById(orderId).populate("items");
      const order = orderDoc
        ? serialize<OrderType & { items: OrderItem[] }>(orderDoc)
        : null;

      if (order && order.status === "PENDING") {
        for (const item of order.items ?? []) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }

        await CartItem.deleteMany({ userId });
        await Order.findByIdAndUpdate(orderId, {
          status: "PAID",
          stripeSessionId: session.id,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
