import Image from "next/image";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { Navbar } from "@/components/Navbar";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { Product as ProductType } from "@/lib/types";

// See app/shop/page.tsx: keeps stock data fresh and avoids needing a
// database connection during `next build`.
export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const productDoc = await Product.findById(id);
  if (!productDoc) notFound();

  const product = serialize<ProductType>(productDoc);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="w-full min-w-0 lg:pt-4">
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">
              {product.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2 mb-4">
              {product.name}
            </h1>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">
              {product.price.toFixed(2)} €
            </p>
            <p className="text-slate-600 leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="flex items-center gap-4 mb-8">
              <span
                className={`text-sm font-semibold ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                {product.stock > 0
                  ? `${product.stock} en stock`
                  : "Épuisé"}
              </span>
            </div>

            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>
        </div>
      </main>
    </div>
  );
}
