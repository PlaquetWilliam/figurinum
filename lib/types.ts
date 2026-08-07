import { Types } from "mongoose";

export type Role = "USER" | "ADMIN";
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  featured: boolean;
  createdAt: Date;
};

export type CartItem = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product?: Product;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
};

export type Order = {
  id: string;
  userId: string;
  total: number;
  status: OrderStatus;
  stripeSessionId: string | null;
  createdAt: Date;
  items?: OrderItem[];
  user?: Pick<User, "id" | "name" | "email">;
};

export function toId(value: Types.ObjectId | string | { toString(): string }) {
  return value.toString();
}
