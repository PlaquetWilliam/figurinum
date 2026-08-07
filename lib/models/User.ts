import { Schema, models, model } from "mongoose";
import type { Role } from "@/lib/types";

export type UserDocument = {
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
};

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User =
  models.User || model<UserDocument>("User", UserSchema);
