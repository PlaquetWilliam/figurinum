import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import { verifySession } from "@/lib/dal";
import type { Order as OrderType, OrderItem, Product } from "@/lib/types";

type OrderWithProducts = Omit<OrderType, "items"> & {
  items: (Omit<OrderItem, "product"> & { product: Product })[];
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { userId } = await verifySession();
  const { order: orderId } = await searchParams;
  await connectDB();

  const orderDoc = orderId
    ? await Order.findOne({ _id: orderId, userId }).populate({
        path: "items",
        populate: { path: "product" },
      })
    : null;

  const order = orderDoc
    ? serialize<OrderWithProducts>(orderDoc)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-32 pb-24 px-6 max-w-lg mx-auto text-center">
        <div className="bg-white rounded-3xl border border-slate-100 p-10 shadow-sm">
          <CheckCircle className="mx-auto text-emerald-500 mb-6" size={48} />
          <h1 className="text-3xl font-black mb-3">Commande confirmée !</h1>
          <p className="text-slate-500 mb-8">
            Merci pour votre achat. Votre commande a été enregistrée avec succès.
          </p>

          {order && (
            <div className="text-left bg-slate-50 rounded-2xl p-6 mb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Récapitulatif
              </p>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm py-1.5"
                >
                  <span className="text-slate-600">
                    {item.quantity}× {item.product.name}
                  </span>
                  <span className="font-semibold">
                    {(item.price * item.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between font-black">
                <span>Total</span>
                <span>{order.total.toFixed(2)} €</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/account"
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
            >
              Mes commandes
            </Link>
            <Link
              href="/shop"
              className="px-6 py-3 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
