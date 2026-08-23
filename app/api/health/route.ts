import { NextResponse } from "next/server";

// Liveness : le process Next.js répond-il ? Volontairement sans accès à
// MongoDB, pour qu'une base momentanément injoignable ne fasse pas redémarrer
// un conteneur qui, lui, fonctionne. La vérification des dépendances est le
// rôle de /api/ready (readiness).
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
