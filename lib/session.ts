import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "@/lib/definitions";

const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_SECRET_LENGTH = 32;

/**
 * Le secret est lu à chaque appel (et non une fois au chargement du module) :
 * il n'est pas disponible pendant `next build`, et une valeur capturée trop
 * tôt masquerait la variable réellement injectée au démarrage du conteneur.
 * Aucun secret de repli n'est prévu : une configuration incomplète doit
 * échouer bruyamment plutôt que signer des sessions avec une clé connue.
 */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET est obligatoire.");
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `SESSION_SECRET doit contenir au minimum ${MIN_SECRET_LENGTH} caractères.`
    );
  }

  return secret;
}

function getEncodedSessionSecret(): Uint8Array {
  return new TextEncoder().encode(getSessionSecret());
}

/** Émet un JWT de session signé (HS256) — signé, pas chiffré : le payload est lisible. */
export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedSessionSecret());
}

/** Vérifie la signature d'un JWT de session. Retourne `null` si le jeton est invalide. */
export async function verifySessionToken(token: string | undefined = "") {
  // La clé est résolue hors du try : une erreur de configuration doit remonter
  // à l'appelant, et non être confondue avec un jeton simplement invalide.
  const key = getEncodedSessionSecret();

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, role: "USER" | "ADMIN") {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await signSessionToken({ userId, role, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
