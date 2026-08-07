import type { Metadata } from "next";
import { Outfit, Space_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"], // Space Mono nécessite de spécifier les graisses
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Figurinum",
  description:
    "Boutique de figurines d'art et art toys en éditions limitées. Collection céramique minimaliste.",
    icons: {
      icon: "/img/Logo.png", // Le chemin vers ton image dans le dossier public
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${outfit.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}