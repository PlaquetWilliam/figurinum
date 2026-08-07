import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import { getUser } from "@/lib/dal";
import { Package, User as UserIcon } from "lucide-react";
import type { Order as OrderType, OrderItem, Product } from "@/lib/types";

type OrderWithProducts = Omit<OrderType, "items"> & {
  items: (Omit<OrderItem, "product"> & { product: Product })[];
};

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700",
  SHIPPED: "bg-green-50 text-green-700",
  DELIVERED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export default async function AccountPage() {
  const user = await getUser();
  await connectDB();

  const orders = serialize<OrderWithProducts[]>(
    await Order.find({ userId: user.id })
      .populate({ path: "items", populate: { path: "product" } })
      .sort({ createdAt: -1 })
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-100 p-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
              <UserIcon className="text-green-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black">{user.name}</h1>
              <p className="text-slate-500 text-sm">{user.email}</p>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-xs font-bold text-green-600 hover:underline mt-1 inline-block"
                >
                  Accéder au panel admin →
                </Link>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
          <Package size={20} />
          Mes commandes
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
            <p className="text-slate-500 mb-4">Aucune commande pour le moment.</p>
            <Link
              href="/shop"
              className="text-green-600 font-semibold hover:underline"
            >
              Parcourir la boutique
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-100 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="font-bold text-lg">
                      {order.total.toFixed(2)} €
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>
                <ul className="space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id} className="text-sm text-slate-600">
                      {item.quantity}× {item.product.name} —{" "}
                      {(item.price * item.quantity).toFixed(2)} €
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
