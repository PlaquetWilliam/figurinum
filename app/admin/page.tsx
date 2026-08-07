import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { connectDB } from "@/lib/mongodb";
import { Order, Product, User } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import { verifyAdmin } from "@/lib/dal";
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
} from "lucide-react";
import type { Order as OrderType, User as UserType } from "@/lib/types";

export default async function AdminDashboard() {
  await verifyAdmin();
  await connectDB();

  const [productCount, orderCount, userCount, recentOrderDocs] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: "USER" }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({ path: "user", select: "name email" }),
    ]);

  const recentOrders = serialize<
    (OrderType & { user: Pick<UserType, "name" | "email"> })[]
  >(recentOrderDocs);

  const paidOrders = await Order.find({
    status: { $in: ["PAID", "SHIPPED", "DELIVERED"] },
  }).select("total");

  const revenueTotal = paidOrders.reduce((sum, order) => sum + order.total, 0);

  const stats = [
    { label: "Produits", value: productCount, icon: Package, href: "/admin/products" },
    { label: "Commandes", value: orderCount, icon: ShoppingBag, href: "/admin/orders" },
    { label: "Utilisateurs", value: userCount, icon: Users, href: "/admin" },
    {
      label: "Revenus",
      value: `${revenueTotal.toFixed(0)} €`,
      icon: TrendingUp,
      href: "/admin/orders",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">
              Administration
            </p>
            <h1 className="text-4xl font-black tracking-tight">Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Gérer les produits
            </Link>
            <Link
              href="/admin/orders"
              className="px-5 py-2.5 border border-slate-200 text-sm font-bold rounded-xl hover:bg-white transition-colors"
            >
              Commandes
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-green-500/5 transition-all"
            >
              <stat.icon className="text-green-600 mb-3" size={22} />
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </Link>
          ))}
        </div>

        <h2 className="text-lg font-black mb-4">Commandes récentes</h2>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="p-4">Client</th>
                <th className="p-4">Montant</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-50 last:border-0">
                  <td className="p-4 font-semibold">{order.user.name}</td>
                  <td className="p-4">{order.total.toFixed(2)} €</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
