import { Schema, models, model } from "mongoose";

export type ProductDocument = {
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  featured: boolean;
  createdAt: Date;
};

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    stock: { type: Number, default: 10 },
    category: { type: String, required: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Product =
  models.Product || model<ProductDocument>("Product", ProductSchema);
