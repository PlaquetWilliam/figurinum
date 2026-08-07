import { Schema, models, model, Types } from "mongoose";

export type CartItemDocument = {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
};

const CartItemSchema = new Schema<CartItemDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

CartItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

CartItemSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

export const CartItem =
  models.CartItem || model<CartItemDocument>("CartItem", CartItemSchema);
