"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { createSession, deleteSession } from "@/lib/session";
import {
  LoginFormSchema,
  SignupFormSchema,
  type FormState,
} from "@/lib/definitions";

export async function signup(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, password } = validated.data;

  await connectDB();
  const existing = await User.findOne({ email });
  if (existing) {
    return { message: "Un compte existe déjà avec cet email." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  await createSession(user._id.toString(), user.role);
  redirect("/");
}

export async function login(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;
  await connectDB();
  const user = await User.findOne({ email });

  if (!user) {
    return { message: "Email ou mot de passe incorrect." };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { message: "Email ou mot de passe incorrect." };
  }

  await createSession(user._id.toString(), user.role);

  const callbackUrl = formData.get("callbackUrl");
  if (
    typeof callbackUrl === "string" &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//")
  ) {
    redirect(callbackUrl);
  }

  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/auth/login");
}
