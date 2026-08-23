import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import { CartItem, Order, OrderItem } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import { reserveStockForItems } from "@/lib/stock";
import type { OrderItem as OrderItemType } from "@/lib/types";

/**
 * Rembourse le paiement d'une session Checkout. Utilisé quand le paiement est
 * encaissé alors que la commande n'est finalement pas honorable.
 * @returns `true` si le remboursement a été demandé à Stripe.
 */
async function refundCheckoutSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<boolean> {
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  if (!paymentIntentId) {
    return false;
  }

  try {
    await stripe.refunds.create({ payment_intent: paymentIntentId });
    return true;
  } catch {
    // Un remboursement refusé par Stripe ne doit pas empêcher l'annulation de
    // la commande : on annule quand même et le cas se traite depuis le
    // dashboard Stripe.
    return false;
  }
}

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

      // Idempotence : la première réception « revendique » la commande en
      // écrivant l'identifiant de session Stripe, de façon atomique. Stripe
      // pouvant rejouer un même événement, une seconde réception ne trouve
      // plus de commande PENDING sans session et ressort sans rien décrémenter.
      const claimedOrder = await Order.findOneAndUpdate(
        { _id: orderId, status: "PENDING", stripeSessionId: null },
        { stripeSessionId: session.id },
        { new: true }
      );

      if (!claimedOrder) {
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }

      const items = serialize<OrderItemType[]>(
        await OrderItem.find({ orderId })
      );

      // Le stock n'est réservé qu'ici : avant le paiement confirmé, la commande
      // PENDING n'immobilise rien. Décrément conditionnel atomique, donc deux
      // paiements concurrents sur le dernier article ne peuvent pas passer.
      const reservation = await reserveStockForItems(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );

      if (!reservation.ok) {
        // Paiement encaissé mais commande impossible à honorer : on rembourse
        // puis on annule. Les réservations partielles ont déjà été restituées
        // par reserveStockForItems, il n'y a pas d'état intermédiaire à nettoyer.
        await refundCheckoutSession(stripe, session);
        await Order.findByIdAndUpdate(orderId, { status: "CANCELLED" });

        return NextResponse.json({ received: true, outOfStock: true });
      }

      // Statut avant vidage du panier : si le vidage échouait, la commande
      // resterait cohérente avec le stock déjà réservé.
      await Order.findByIdAndUpdate(orderId, { status: "PAID" });
      await CartItem.deleteMany({ userId });
    }
  }

  return NextResponse.json({ received: true });
}
