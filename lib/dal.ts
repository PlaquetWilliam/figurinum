import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { verifySessionToken, deleteSession } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { serialize } from "@/lib/serialize";
import type { User as UserType } from "@/lib/types";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await verifySessionToken(cookie);

  // Anciennes sessions Prisma (cuid) ne sont plus valides avec MongoDB
  if (!session?.userId || !Types.ObjectId.isValid(session.userId)) {
    await deleteSession();
    redirect("/auth/login");
  }

  return {
    userId: session.userId,
    role: session.role,
  };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  await connectDB();

  const user = await User.findById(session.userId).select(
    "name email role"
  );

  if (!user) {
    await deleteSession();
    redirect("/auth/login");
  }

  return serialize<Pick<UserType, "id" | "name" | "email" | "role">>(user);
});

export const verifyAdmin = cache(async () => {
  const session = await verifySession();

  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return session;
});
