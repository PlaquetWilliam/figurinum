import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

// Readiness : l'application peut-elle réellement servir du trafic, c'est-à-dire
// dispose-t-elle de sa base de données ? Utilisé par `healthCheckPath` dans
// render.yaml, afin qu'une nouvelle version ne reçoive pas de trafic tant que
// MongoDB n'est pas joignable.
//
// force-dynamic est indispensable : sans lui, Next pourrait prérendre cette
// route pendant le build (où aucune base n'est accessible) et servir un 503 figé.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Connexion MongoDB indisponible.");
    }

    // connectDB() met la connexion en cache : un ping confirme qu'elle est
    // toujours réellement établie, et pas seulement mémorisée.
    await db.admin().command({ ping: 1 });

    return NextResponse.json({ status: "ready" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "not_ready" }, { status: 503 });
  }
}
