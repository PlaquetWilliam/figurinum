"use client";

import { updateOrderStatus } from "@/app/actions/orders";
import { useTransition } from "react";

const statuses = ["PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      disabled={pending}
      defaultValue={currentStatus}
      onChange={(e) =>
        startTransition(() => {
          void updateOrderStatus(orderId, e.target.value as (typeof statuses)[number]);
        })
      }
      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-slate-50"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
