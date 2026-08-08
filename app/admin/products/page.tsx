import { Navbar } from "@/components/Navbar";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import { verifyAdmin } from "@/lib/dal";
import { createProduct, deleteProduct } from "@/app/actions/orders";
import Link from "next/link";
import type { Product as ProductType } from "@/lib/types";

export default async function AdminProductsPage() {
  await verifyAdmin();
  await connectDB();

  const products = serialize<ProductType[]>(
    await Product.find().sort({ createdAt: -1 })
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/admin" className="text-sm text-green-600 font-semibold hover:underline">
              ← Dashboard
            </Link>
            <h1 className="text-3xl font-black mt-2">Produits</h1>
          </div>
        </div>

        <form
          action={createProduct}
          className="bg-white rounded-2xl border border-slate-100 p-6 mb-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <h2 className="sm:col-span-2 lg:col-span-3 font-bold text-lg mb-2">
            Ajouter un produit
          </h2>
          <input
            name="name"
            placeholder="Nom"
            required
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          />
          <input
            name="category"
            placeholder="Catégorie"
            required
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          />
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="Prix (€)"
            required
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          />
          <input
            name="stock"
            type="number"
            placeholder="Stock"
            required
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          />
          <label className="flex flex-col gap-1.5 text-sm text-slate-600">
            <input
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              required
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-green-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-green-700"
            />
          </label>
          <textarea
            name="description"
            placeholder="Description"
            required
            className="sm:col-span-2 lg:col-span-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm min-h-[80px]"
          />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="featured" className="rounded" />
            Produit vedette
          </label>
          <button
            type="submit"
            className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
          >
            Ajouter
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="p-4">Produit</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-50 last:border-0">
                  <td className="p-4">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.category}</p>
                  </td>
                  <td className="p-4">{product.price.toFixed(2)} €</td>
                  <td className="p-4 font-semibold">{product.stock}</td>
                  <td className="p-4">
                    <form action={deleteProduct.bind(null, product.id)}>
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                      >
                        Supprimer
                      </button>
                    </form>
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
