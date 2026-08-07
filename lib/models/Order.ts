import { Schema, models, model, Types } from "mongoose";
import type { OrderStatus } from "@/lib/types";

export type OrderItemDocument = {
  orderId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  price: number;
};

export type OrderDocument = {
  userId: Types.ObjectId;
  total: number;
  status: OrderStatus;
  stripeSessionId?: string | null;
  createdAt: Date;
};

const OrderItemSchema = new Schema<OrderItemDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

OrderItemSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

const OrderSchema = new Schema<OrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    stripeSessionId: { type: String, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

OrderSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

OrderSchema.virtual("items", {
  ref: "OrderItem",
  localField: "_id",
  foreignField: "orderId",
});

export const OrderItem =
  models.OrderItem || model<OrderItemDocument>("OrderItem", OrderItemSchema);

export const Order =
  models.Order || model<OrderDocument>("Order", OrderSchema);
