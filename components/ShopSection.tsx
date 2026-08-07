import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import { ProductCard } from "@/components/ProductCard";
import type { Product as ProductType } from "@/lib/types";

export async function ShopSection() {
  await connectDB();
  const products = serialize<ProductType[]>(
    await Product.find({ featured: true }).sort({ createdAt: -1 }).limit(6)
  );

  return (
    <section id="shop" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-3">
          Collection vedette
        </p>
        <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
          Pièces sélectionnées
        </h2>
        <p className="text-slate-500 mt-4 max-w-lg mx-auto">
          Des éditions limitées et art toys soigneusement curatés pour les
          collectionneurs exigeants.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, i) => (
          <ProductCard key={product.id} {...product} index={i} />
        ))}
      </div>
    </section>
  );
}
