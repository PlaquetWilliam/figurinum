"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight  } from "lucide-react";
import { motion } from "framer-motion";
import { addToCart } from "@/app/actions/cart";
import { useTransition } from "react";

type ProductCardProps = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  index?: number;
};

export function ProductCard({
  id,
  name,
  description,
  price,
  image,
  category,
  stock,
  index = 0,
}: ProductCardProps) {
  const [pending, startTransition] = useTransition();

  const handleAdd = () => {
    startTransition(async () => {
      await addToCart(id);
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-green-500/5 transition-all duration-500"
    >
      <Link href={`/shop/${id}`} className="block relative aspect-square bg-slate-50 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-green-600">
          {category}
        </div>
        {stock <= 5 && stock > 0 && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-50 text-[10px] font-bold text-amber-700">
            Plus que {stock}
          </div>
        )}
      </Link>

      <div className="p-6">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
          ))}
        </div>
        <Link href={`/shop/${id}`}>
          <h3 className="font-semibold text-lg text-slate-900 mb-1 group-hover:text-green-600 transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-slate-900">
            {price.toFixed(2)} €
          </span>
          <Link href={`/shop/${id}`}
            className="cursor-pointer flex items-center gap-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white text-md tracking-wider font-semibold rounded-xl transition-all duration-300"
          >
            {stock === 0 ? "Épuisé" : "Voir"}
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
