"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { CartItem, Order, OrderItem, Product } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import { verifySession, verifyAdmin } from "@/lib/dal";
import { createCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { releaseReservedStock, reserveStockForItems } from "@/lib/stock";
import type { CartItem as CartItemType, Order as OrderType, Product as ProductType } from "@/lib/types";

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo

async function saveProductImage(file: File): Promise<string> {
  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    throw new Error("Format d'image non supporté. Utilisez PNG, JPEG, WebP ou GIF.");
  }

  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error("L'image doit peser entre 1 octet et 5 Mo.");
  }

  const filename = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "img");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(
    path.join(uploadDir, filename),
    Buffer.from(await file.arrayBuffer())
  );

  return `/img/${filename}`;
}

export async function createOrder() {
  const { userId } = await verifySession();
  await connectDB();

  const cartDocs = await CartItem.find({ userId }).populate("product");
  const cartItems = serialize<(CartItemType & { product: ProductType })[]>(
    cartDocs
  );

  if (cartItems.length === 0) {
    return { error: "Votre panier est vide." };
  }

  // Pré-contrôle de confort : il donne un message d'erreur nommant le produit
  // avant de créer quoi que ce soit. Il ne garantit rien face à la concurrence
  // (le stock peut changer juste après la lecture) — c'est la réservation
  // atomique plus bas, puis celle du webhook Stripe, qui font foi.
  for (const item of cartItems) {
    if (item.quantity > item.product.stock) {
      return { error: `${item.product.name} : stock insuffisant.` };
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const orderDoc = await Order.create({
    userId,
    total,
  });

  await OrderItem.insertMany(
    cartItems.map((item) => ({
      orderId: orderDoc._id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
    }))
  );

  const order = serialize<OrderType>(orderDoc);

  if (isStripeConfigured()) {
    const checkoutUrl = await createCheckoutSession(order, cartItems);
    redirect(checkoutUrl);
  }

  // Mode démo sans Stripe : le paiement est réputé immédiat, donc le stock est
  // réservé ici. Avec Stripe, cette réservation est faite par le webhook une
  // fois le paiement réellement confirmé.
  const reservation = await reserveStockForItems(
    cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }))
  );

  if (!reservation.ok) {
    // Le stock a bougé entre le pré-contrôle et la réservation : la commande
    // ne peut pas être honorée, on l'annule plutôt que de laisser une
    // commande PENDING orpheline en base.
    await Order.findByIdAndUpdate(order.id, { status: "CANCELLED" });
    return { error: "Stock insuffisant : la commande a été annulée." };
  }

  await CartItem.deleteMany({ userId });
  await Order.findByIdAndUpdate(order.id, { status: "PAID" });

  revalidatePath("/account");
  redirect(`/checkout/success?order=${order.id}`);
}

export async function deleteProduct(productId: string) {
  await verifyAdmin();
  await connectDB();
  await CartItem.deleteMany({ productId });
  await OrderItem.deleteMany({ productId });
  await Product.findByIdAndDelete(productId);
  revalidatePath("/admin");
  revalidatePath("/shop");
}

export async function updateProductStock(productId: string, stock: number) {
  await verifyAdmin();
  await connectDB();
  await Product.findByIdAndUpdate(productId, {
    stock: Math.max(0, stock),
  });
  revalidatePath("/admin");
}

export async function createProduct(formData: FormData) {
  await verifyAdmin();
  await connectDB();

  const imageFile = formData.get("image");
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    throw new Error("Veuillez sélectionner une image depuis votre ordinateur.");
  }

  const image = await saveProductImage(imageFile);

  await Product.create({
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string),
    image,
    stock: parseInt(formData.get("stock") as string, 10) || 0,
    category: formData.get("category") as string,
    featured: formData.get("featured") === "on",
  });

  revalidatePath("/admin");
  revalidatePath("/shop");
}

export async function updateOrderStatus(
  orderId: string,
  status: "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED"
) {
  await verifyAdmin();
  await connectDB();

  const orderDoc = await Order.findById(orderId).populate("items");
  if (!orderDoc) {
    return { error: "Commande introuvable." };
  }

  const order = serialize<OrderType & { items: { productId: string; quantity: number }[] }>(
    orderDoc
  );

  const stockWasTaken =
    order.status === "PAID" ||
    order.status === "SHIPPED" ||
    order.status === "DELIVERED";

  if (status === "CANCELLED" && stockWasTaken) {
    await releaseReservedStock(
      (order.items ?? []).map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
    );
  }

  await Order.findByIdAndUpdate(orderId, { status });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/shop");
}
