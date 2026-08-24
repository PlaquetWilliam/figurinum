import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { connectDB } from "@/lib/mongodb";
import { CartItem } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import { verifySession } from "@/lib/dal";
import { CartItemActions } from "@/components/CartItemActions";
import { CheckoutButton } from "@/components/CheckoutButton";
import type { CartItem as CartItemType, Product } from "@/lib/types";

export default async function CartPage() {
  const { userId } = await verifySession();
  await connectDB();

  const cartItems = serialize<(CartItemType & { product: Product })[]>(
    await CartItem.find({ userId }).populate("product").sort({ _id: -1 })
  );

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-8 sm:mb-10">Mon panier</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <p className="text-slate-500 mb-6">Votre panier est vide.</p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-2xl border border-slate-100 sm:items-center"
              >
                <div className="flex gap-4 min-w-0 flex-1">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {item.product.price.toFixed(2)} € / unité
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <CartItemActions
                    cartItemId={item.id}
                    quantity={item.quantity}
                    maxStock={item.product.stock}
                  />
                  <p className="font-bold text-slate-900 sm:w-24 text-right shrink-0">
                    {(item.product.price * item.quantity).toFixed(2)} €
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-8 p-5 sm:p-6 bg-white rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-3xl font-black">{total.toFixed(2)} €</p>
              </div>
              <CheckoutButton />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
