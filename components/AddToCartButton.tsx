"use client";

import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/app/actions/cart";
import { useTransition } from "react";

export function AddToCartButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => { void addToCart(productId); })}
      disabled={pending || stock === 0}
      className="cursor-pointer flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-base text-white font-semibold tracking-wider transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] rounded-lg"
    >
      <ShoppingCart size={18} />
      {stock === 0 ? "Épuisé" : pending ? "Ajout en cours..." : "Ajouter au panier"}
    </button>
  );
}
