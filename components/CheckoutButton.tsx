"use client";

import { createOrder } from "@/app/actions/orders";
import { CreditCard } from "lucide-react";
import { useTransition } from "react";

export function CheckoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => { void createOrder(); })}
      disabled={pending}
      className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-bold rounded-2xl transition-all"
    >
      <CreditCard size={18} />
      {pending ? "Traitement..." : "Payer"}
    </button>
  );
}
