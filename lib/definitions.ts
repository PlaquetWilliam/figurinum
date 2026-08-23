import * as z from "zod";

// Remarque : le .trim() doit être appliqué AVANT les vérifications de
// format/longueur, sinon un email ou un nom entouré d'espaces (copié-collé
// depuis un autre champ, par exemple) est rejeté au lieu d'être nettoyé.
// Ce point a été mis en évidence par les tests unitaires (tests/lib/definitions.test.ts)
// puis corrigé ici.
export const LoginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Email invalide." })),
  password: z.string().min(1, { error: "Mot de passe requis." }),
});

export const SignupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Le nom doit contenir au moins 2 caractères." }),
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Email invalide." })),
  password: z
    .string()
    .trim()
    .min(8, { error: "Au moins 8 caractères." })
    .regex(/[a-zA-Z]/, { error: "Au moins une lettre." })
    .regex(/[0-9]/, { error: "Au moins un chiffre." }),
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
