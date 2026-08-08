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
      <main className="h-screen flex justify-center items-center mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start w-2/3 h-[600px]">
          <div className="relative aspect-square w-full h-full rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="w-[500px]">
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">
              {product.category}
            </span>
            <h1 className="text-4xl font-black tracking-tight mt-2 mb-4">
              {product.name}
            </h1>
            <p className="text-3xl font-black text-slate-900 mb-6">
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
