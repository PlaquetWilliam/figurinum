"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  User,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

type NavbarClientProps = {
  role: "USER" | "ADMIN";
  cartCount: number;
};

export function NavbarClient({ role, cartCount }: NavbarClientProps) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50">
      <div className="backdrop-blur-xl bg-white/75 border-b border-slate-200/50 px-4 sm:px-6 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3 shadow-sm">
        <Link
          href="/"
          onClick={close}
          className="shrink-0 font-extrabold text-base sm:text-lg tracking-tight text-slate-900 hover:text-green-600 transition-colors md:w-1/3"
        >
          FIGURINUM
        </Link>

        <div className="hidden md:flex md:w-1/3 justify-center items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Link href="/#shop" className="hover:text-slate-900 transition-colors">
            Accueil
          </Link>
          <Link href="/shop" className="hover:text-slate-900 transition-colors">
            Boutique
          </Link>
          <Link href="/account" className="hover:text-slate-900 transition-colors">
            Mon compte
          </Link>
          {role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-1 hover:text-green-600 transition-colors"
            >
              <Shield size={12} />
              Admin
            </Link>
          )}
        </div>

        <div className="flex justify-end items-center gap-2 sm:gap-3 md:w-1/3">
          <Link
            href="/cart"
            onClick={close}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 md:px-5 py-2.5 rounded-full font-bold text-xs transition-all duration-300 flex items-center gap-2 shadow-sm"
          >
            <ShoppingCart size={13} />
            <span className="hidden sm:inline">PANIER</span>
            <span>({cartCount})</span>
          </Link>

          <Link
            href="/account"
            onClick={close}
            className="p-2.5 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
            aria-label="Mon compte"
          >
            <User size={14} />
          </Link>

          <form action={logout} className="hidden sm:block">
            <button
              type="submit"
              className="p-2.5 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
              title="Déconnexion"
            >
              <LogOut size={14} />
            </button>
          </form>

          <button
            type="button"
            className="md:hidden p-2.5 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-b border-slate-200/50 bg-white/95 backdrop-blur-xl shadow-sm">
          <div className="flex flex-col px-4 py-3 text-sm font-semibold uppercase tracking-wider text-slate-600">
            <Link
              href="/#shop"
              onClick={close}
              className="py-3 border-b border-slate-100 hover:text-slate-900"
            >
              Accueil
            </Link>
            <Link
              href="/shop"
              onClick={close}
              className="py-3 border-b border-slate-100 hover:text-slate-900"
            >
              Boutique
            </Link>
            <Link
              href="/account"
              onClick={close}
              className="py-3 border-b border-slate-100 hover:text-slate-900"
            >
              Mon compte
            </Link>
            {role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={close}
                className="py-3 border-b border-slate-100 flex items-center gap-2 hover:text-green-600"
              >
                <Shield size={14} />
                Admin
              </Link>
            )}
            <form action={logout} className="sm:hidden">
              <button
                type="submit"
                className="w-full py-3 text-left flex items-center gap-2 text-slate-500 hover:text-slate-900"
              >
                <LogOut size={14} />
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
