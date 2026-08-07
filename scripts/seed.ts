import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/mongodb";
import { Product, User } from "../lib/models";

async function main() {
  await connectDB();

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const userPassword = await bcrypt.hash("User1234!", 10);

  await User.findOneAndUpdate(
    { email: "admin@figurinum.com" },
    {
      name: "Admin Figurinum",
      email: "admin@figurinum.com",
      password: adminPassword,
      role: "ADMIN",
    },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: "user@figurinum.com" },
    {
      name: "Utilisateur Demo",
      email: "user@figurinum.com",
      password: userPassword,
      role: "USER",
    },
    { upsert: true, new: true }
  );

  const products = [
    {
      name: "The Knight — Hollow Knight",
      description:
        "Sculpture artisanale du Chevalier de Hallownest. Finition céramique mate, édition limitée à 500 exemplaires.",
      price: 89.99,
      image: "/img/The_Knight_Hollow_Knight.png",
      stock: 42,
      category: "Gaming",
      featured: true,
    },
    {
      name: "Luna — Art Toy",
      description:
        "Figurine lunaire aux courbes fluides. Design minimaliste en résine premium, teinte indigo profond.",
      price: 64.5,
      image: "/img/The_Knight_Hollow_Knight.png",
      stock: 28,
      category: "Art Toys",
      featured: true,
    },
    {
      name: "Ceramic Bloom",
      description:
        "Sculpture florale abstraite en céramique blanche. Pièce de collection signée par l'atelier Figurinum.",
      price: 120.0,
      image: "/img/The_Knight_Hollow_Knight.png",
      stock: 15,
      category: "Sculptures",
      featured: true,
    },
    {
      name: "Void Walker",
      description:
        "Art toy sombre aux lignes géométriques. Édition noire numérotée, base incluse.",
      price: 75.0,
      image: "/img/The_Knight_Hollow_Knight.png",
      stock: 33,
      category: "Art Toys",
      featured: false,
    },
    {
      name: "Prism Shard",
      description:
        "Fragment cristallin en résine transparente avec reflets indigo. Hauteur 18 cm.",
      price: 55.0,
      image: "/img/The_Knight_Hollow_Knight.png",
      stock: 50,
      category: "Sculptures",
      featured: false,
    },
    {
      name: "Echo Spirit",
      description:
        "Figurine éthérée aux tons pastel. Finition laquée main, collection Studio 2026.",
      price: 98.0,
      image: "/img/The_Knight_Hollow_Knight.png",
      stock: 20,
      category: "Gaming",
      featured: false,
    },
  ];

  for (const product of products) {
    const existing = await Product.findOne({ name: product.name });
    if (!existing) {
      await Product.create(product);
    }
  }

  console.log("Seed terminé !");
  console.log("Admin : admin@figurinum.com / Admin123!");
  console.log("User  : user@figurinum.com / User1234!");
}

main()
  .catch(console.error)
  .finally(() => mongoose.disconnect());
