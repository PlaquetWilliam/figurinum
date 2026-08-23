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
      price: 40,
      image: "/img/The_Knight_Hollow_Knight.png",
      stock: 42,
      category: "Gaming",
      featured: true,
    },
    {
      name: "Malenia — Elden Ring",
      description:
        "Sculpture artisanale de Malenia, Lame de Miquella. Armure finement détaillée avec finition métallique, édition limitée à 300 exemplaires.",
      price: 65,
      image: "/img/Malenia_Elden_Ring.png",
      stock: 18,
      category: "Gaming",
      featured: true,
    },
    {
      name: "Link — The Legend of Zelda",
      description:
        "Figurine artisanale du héros d’Hyrule avec son épée et son bouclier. Finition peinte à la main, édition limitée à 600 exemplaires.",
      price: 50,
      image: "/img/Link_The_Legend_Of_Zelda.png",
      stock: 35,
      category: "Gaming",
      featured: false,
    },
    {
      name: "Geralt — The Witcher",
      description:
        "Sculpture détaillée de Geralt de Riv en tenue de sorceleur. Effet cuir vieilli et lames métalliques, édition limitée à 400 exemplaires.",
      price: 55,
      image: "/img/Geralt_The_Witcher.png",
      stock: 27,
      category: "Gaming",
      featured: true,
    },
    {
      name: "Solaire — Dark Souls",
      description:
        "Figurine artisanale de Solaire d’Astora dans sa célèbre pose. Finition médiévale mate, édition limitée à 500 exemplaires.",
      price: 45,
      image: "/img/Solaire_Dark_Souls.png",
      stock: 31,
      category: "Gaming",
      featured: false,
    },
    {
      name: "Kratos — God of War",
      description:
        "Sculpture imposante du Fantôme de Sparte équipé de la hache Léviathan. Finition réaliste et détails peints à la main, édition limitée à 250 exemplaires.",
      price: 70,
      image: "/img/Kratos_God_Of_War.png",
      stock: 14,
      category: "Gaming",
      featured: true,
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
