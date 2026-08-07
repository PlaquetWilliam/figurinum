"use client";

import Image from "next/image";
import { useActionState } from "react";
import Link from "next/link";
import { ShieldCheck, Package } from "lucide-react";
import type { FormState } from "@/lib/definitions";
import Logo from "../app/img/Logo.png";

type AuthFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  mode: "login" | "register";
  callbackUrl?: string;
};

export function AuthForm({ action, mode, callbackUrl }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isLogin = mode === "login";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <Image className="absolute top-0 left-0 w-12 m-4" src={Logo} alt="Logo de mon site" />
      
      {/* --- PARTIE DROITE (Nouvelle version) --- */}
      <div className="absolute top-0 right-0 w-3/5 h-screen bg-gradient-to-br from-green-600 to-green-900 flex flex-col justify-center items-center p-12">
        {/* Motif de fond discret (points) */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 max-w-lg w-full flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Donnez vie à votre passion de la collection.
            </h2>
            <p className="text-green-100 text-lg">
              Découvrez des figurines exclusives, des éditions limitées et rejoignez la plus grande communauté de passionnés.
            </p>
          </div>

          {/* Cartes de réassurance façon Glassmorphism */}
          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-left flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-green-500/30 rounded-xl">
                <ShieldCheck className="text-green-300" size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">100% Authentique</h3>
                <p className="text-green-100/80 text-sm">Toutes nos figurines sont certifiées officielles et proviennent directement des fabricants.</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-left flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-green-500/30 rounded-xl">
                <Package className="text-green-300" size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Livraison Ultra-Sécurisée</h3>
                <p className="text-green-100/80 text-sm">Vos pépites sont emballées avec le plus grand soin pour garantir un état "Mint" à l'arrivée.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- PARTIE GAUCHE (Formulaire) --- */}
      <div className="absolute top-0 left-0 h-screen flex flex-col justify-center items-center w-2/5">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-100 text-[11px] font-semibold text-green-600 tracking-wider uppercase mb-6">
            Figurinum
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            {isLogin ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isLogin
              ? "Accédez à votre espace collectionneur"
              : "Rejoignez la communauté Figurinum"}
          </p>
        </div>

        <form
          action={formAction}
          className="w-4/5 space-y-5"
        >
          {callbackUrl && (
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
          )}
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Nom
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all text-slate-900 rounded-lg"
                placeholder="Votre nom"
              />
              {state?.errors?.name && (
                <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all text-slate-900 rounded-lg"
              placeholder="vous@exemple.com"
            />
            {state?.errors?.email && (
              <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all text-slate-900 rounded-lg"
              placeholder="••••••••"
            />
            {state?.errors?.password && (
              <ul className="text-red-500 text-xs mt-1 space-y-0.5">
                {state.errors.password.map((err) => (
                  <li key={err}>- {err}</li>
                ))}
              </ul>
            )}
          </div>

          {state?.message && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-md text-white font-semibold tracking-wider transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] rounded-lg mt-4"
          >
            {pending ? "Chargement..." : isLogin ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          {isLogin ? (
            <>
              Pas encore de compte ?{" "}
              <Link href="/auth/register" className="text-green-600 font-semibold hover:underline">
                S&apos;inscrire
              </Link>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="text-green-600 font-semibold hover:underline">
                Se connecter
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}