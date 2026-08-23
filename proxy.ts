import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { verifySessionToken } from "@/lib/session";

const publicRoutes = ["/auth/login", "/auth/register"];
const authRoutes = ["/auth/login", "/auth/register"];

function clearSession(res: NextResponse) {
  res.cookies.delete("session");
  return res;
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));
  const isAdminRoute = path.startsWith("/admin");
  const isApiRoute = path.startsWith("/api");

  if (isApiRoute) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("session")?.value;
  const session = await verifySessionToken(sessionCookie);
  const hasValidUserId =
    Boolean(session?.userId) && Types.ObjectId.isValid(session!.userId);
  const isLoggedIn = hasValidUserId;

  if (sessionCookie && !hasValidUserId) {
    if (!isPublicRoute) {
      const loginUrl = new URL("/auth/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", path);
      return clearSession(NextResponse.redirect(loginUrl));
    }
    return clearSession(NextResponse.next());
  }

  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isAdminRoute && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
