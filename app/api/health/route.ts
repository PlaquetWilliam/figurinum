import { NextResponse } from "next/server";

// Lightweight liveness endpoint used by the Docker HEALTHCHECK and Render's
// health check. Intentionally does not touch MongoDB so it stays fast and
// keeps reporting the process as healthy even during transient DB hiccups.
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
