import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import { verifyAdmin } from "@/lib/dal";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";
import type {
  Order as OrderType,
  OrderItem,
  Product,
  User,
} from "@/lib/types";

type AdminOrder = Omit<OrderType, "items" | "user"> & {
  user: Pick<User, "name" | "email">;
  items: (Omit<OrderItem, "product"> & { product: Product })[];
};

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default async function AdminOrdersPage() {
  await verifyAdmin();
  await connectDB();

  const orders = serialize<AdminOrder[]>(
    await Order.find()
      .populate({ path: "user", select: "name email" })
      .populate({ path: "items", populate: { path: "product" } })
      .sort({ createdAt: -1 })
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <Link href="/admin" className="text-sm text-green-600 font-semibold hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-3xl font-black mt-2 mb-10">Commandes</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-100 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-bold">{order.user.name}</p>
                  <p className="text-sm text-slate-500">{order.user.email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-black">{order.total.toFixed(2)} €</p>
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
              <ul className="text-sm text-slate-600 space-y-1">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.product.name} —{" "}
                    {(item.price * item.quantity).toFixed(2)} €
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 mt-3">
                Statut actuel : {statusLabels[order.status]}
              </p>
            </div>
          ))}

          {orders.length === 0 && (
            <p className="text-center text-slate-500 py-16">Aucune commande.</p>
          )}
        </div>
      </main>
    </div>
  );
}
