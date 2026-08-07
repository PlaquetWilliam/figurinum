import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import type { Product as ProductType } from "@/lib/types";

export default async function ShopPage() {
  await connectDB();
  const products = serialize<ProductType[]>(
    await Product.find().sort({ createdAt: -1 })
  );

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-3">
            Boutique
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Toute la collection
          </h1>
          <div className="flex flex-wrap gap-2 mt-6">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <ProductCard key={product.id} {...product} index={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
