import Link from "next/link";
import {
  ShoppingCart,
  User,
  Shield,
  LogOut,
} from "lucide-react";
import { getUser } from "@/lib/dal";
import { getCartCount } from "@/app/actions/cart";
import { logout } from "@/app/actions/auth";

export async function Navbar() {
  const user = await getUser();
  const cartCount = await getCartCount(user.id);

  return (
    <nav className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-screen">
      <div className="backdrop-blur-xl bg-white/75 border border-slate-200/50 px-6 md:px-8 py-4 flex items-center justify-between shadow-sm">
        <Link
          href="/"
          className="w-1/3 font-extrabold text-lg tracking-tight text-slate-900 hover:text-green-600 transition-colors"
        >
          FIGURINUM
        </Link>

        <div className="w-1/3 flex justify-center hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Link href="/#shop" className="hover:text-slate-900 transition-colors">
            Accueil
          </Link>
          <Link href="/shop" className="hover:text-slate-900 transition-colors">
            Boutique
          </Link>
          <Link href="/account" className="hover:text-slate-900 transition-colors">
            Mon compte
          </Link>
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-1 hover:text-green-600 transition-colors"
            >
              <Shield size={12} />
              Admin
            </Link>
          )}
        </div>

        <div className="w-1/3 flex justify-end items-center gap-3">
          <Link
            href="/cart"
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 md:px-5 py-2.5 rounded-full font-bold text-xs transition-all duration-300 flex items-center gap-2 shadow-sm"
          >
            <ShoppingCart size={13} />
            PANIER ({cartCount})
          </Link>

          <Link
            href="/account"
            className="p-2.5 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
          >
            <User size={14} />
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="p-2.5 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
              title="Déconnexion"
            >
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
