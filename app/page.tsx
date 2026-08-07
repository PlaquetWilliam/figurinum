import { Navbar } from "@/components/Navbar";
import { HyperspaceHero } from "@/components/HyperspaceHero";
import { ShopSection } from "@/components/ShopSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-green-100 selection:text-green-900">
      <Navbar />
      <HyperspaceHero />
      <ShopSection />
      <footer className="border-t border-slate-100 py-12 text-center text-sm text-slate-400">
        © 2026 Figurinum — Art Toys & Sculptures
      </footer>
    </div>
  );
}
