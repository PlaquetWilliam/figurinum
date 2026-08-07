import * as z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ error: "Email invalide." }).trim(),
  password: z.string().min(1, { error: "Mot de passe requis." }),
});

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Le nom doit contenir au moins 2 caractères." })
    .trim(),
  email: z.email({ error: "Email invalide." }).trim(),
  password: z
    .string()
    .min(8, { error: "Au moins 8 caractères." })
    .regex(/[a-zA-Z]/, { error: "Au moins une lettre." })
    .regex(/[0-9]/, { error: "Au moins un chiffre." })
    .trim(),
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  role: "USER" | "ADMIN";
  expiresAt: Date;
};
