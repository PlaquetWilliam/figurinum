import { Navbar } from "@/components/Navbar";
import { HyperspaceHero } from "@/components/HyperspaceHero";
import { ShopSection } from "@/components/ShopSection";

// Renders live stock data (ShopSection) and a personalized navbar (cart
// count, admin link); also avoids requiring a database connection during
// `next build` (see app/shop/page.tsx for the same reasoning).
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-green-100 selection:text-green-900">
      <Navbar />
      <HyperspaceHero />
      <ShopSection />
      <footer className="border-t border-slate-100 py-10 sm:py-12 px-4 text-center text-sm text-slate-400">
        © 2026 Figurinum - Figurines & Sculptures
      </footer>
    </div>
  );
}
