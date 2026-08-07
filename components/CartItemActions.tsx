"use client";

import { updateCartQuantity, removeFromCart } from "@/app/actions/cart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";

export function CartItemActions({
  cartItemId,
  quantity,
  maxStock,
}: {
  cartItemId: string;
  quantity: number;
  maxStock: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={pending}
        onClick={() =>
          startTransition(() => { void updateCartQuantity(cartItemId, quantity - 1); })
        }
        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center font-bold text-sm">{quantity}</span>
      <button
        disabled={pending || quantity >= maxStock}
        onClick={() =>
          startTransition(() => { void updateCartQuantity(cartItemId, quantity + 1); })
        }
        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
      >
        <Plus size={14} />
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => { void removeFromCart(cartItemId); })}
        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50 ml-1"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
