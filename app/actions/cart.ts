"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { CartItem, Product } from "@/lib/models";
import { verifySession } from "@/lib/dal";

export async function addToCart(productId: string) {
  const { userId } = await verifySession();
  await connectDB();

  const product = await Product.findById(productId);
  if (!product || product.stock < 1) {
    return { error: "Produit indisponible." };
  }

  const existing = await CartItem.findOne({ userId, productId });

  if (existing) {
    if (existing.quantity >= product.stock) {
      return { error: "Stock insuffisant." };
    }
    existing.quantity += 1;
    await existing.save();
  } else {
    await CartItem.create({ userId, productId, quantity: 1 });
  }

  revalidatePath("/cart");
  revalidatePath("/");
  return { success: true };
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const { userId } = await verifySession();
  await connectDB();

  const item = await CartItem.findOne({ _id: cartItemId, userId }).populate(
    "product"
  );

  if (!item) return { error: "Article introuvable." };

  const product = item.product as { stock: number } | null;
  if (!product) return { error: "Produit introuvable." };

  if (quantity < 1) {
    await CartItem.deleteOne({ _id: cartItemId });
  } else if (quantity > product.stock) {
    return { error: "Stock insuffisant." };
  } else {
    item.quantity = quantity;
    await item.save();
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(cartItemId: string) {
  const { userId } = await verifySession();
  await connectDB();

  await CartItem.deleteOne({ _id: cartItemId, userId });

  revalidatePath("/cart");
  return { success: true };
}

export async function getCartCount(userId: string) {
  await connectDB();
  const items = await CartItem.find({ userId }).select("quantity");
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
