import { describe, it, expect, afterEach, vi } from "vitest";
import { SignJWT } from "jose";

// lib/session.ts importe "server-only", un paquet qui lève une erreur dès
// qu'il est chargé en dehors du bundler Next.js (Client/Server Components).
// On le neutralise ici : c'est un garde-fou propre à Next, sans logique à tester.
vi.mock("server-only", () => ({}));

const VALID_SECRET = "test-session-secret-de-plus-de-32-caracteres";

const PAYLOAD = {
  userId: "64b6f0c2f1a2b3c4d5e6f708",
  role: "USER" as const,
  expiresAt: new Date(Date.now() + 1000 * 60 * 60),
};

// Le secret est relu à chaque appel : il suffit de piloter process.env avant
// l'appel, sans recharger le module.
afterEach(() => {
  process.env.SESSION_SECRET = VALID_SECRET;
});

describe("JWT de session (signature HS256)", () => {
  it("vérifie un jeton qu'elle vient de signer (aller-retour)", async () => {
    process.env.SESSION_SECRET = VALID_SECRET;
    const { signSessionToken, verifySessionToken } = await import("@/lib/session");

    const token = await signSessionToken(PAYLOAD);
    expect(typeof token).toBe("string");

    const payload = await verifySessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(PAYLOAD.userId);
    expect(payload?.role).toBe("USER");
  });

  it("signe bien en HS256 (JWT signé, non chiffré : l'en-tête est lisible)", async () => {
    process.env.SESSION_SECRET = VALID_SECRET;
    const { signSessionToken } = await import("@/lib/session");

    const token = await signSessionToken(PAYLOAD);
    const header = JSON.parse(
      Buffer.from(token.split(".")[0], "base64url").toString()
    );

    expect(header.alg).toBe("HS256");
  });

  it("rejette un jeton signé avec une autre clé (intégrité)", async () => {
    process.env.SESSION_SECRET = VALID_SECRET;
    const { verifySessionToken } = await import("@/lib/session");

    const foreignToken = await new SignJWT({ ...PAYLOAD })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(
        new TextEncoder().encode("une-tout-autre-cle-de-plus-de-32-caracteres")
      );

    expect(await verifySessionToken(foreignToken)).toBeNull();
  });

  it("rejette un jeton malformé sans lever d'exception", async () => {
    process.env.SESSION_SECRET = VALID_SECRET;
    const { verifySessionToken } = await import("@/lib/session");

    expect(await verifySessionToken("pas-un-jwt")).toBeNull();
    expect(await verifySessionToken(undefined)).toBeNull();
  });
});

describe("SESSION_SECRET obligatoire", () => {
  it("échoue explicitement quand SESSION_SECRET est absent", async () => {
    const { signSessionToken, verifySessionToken } = await import("@/lib/session");
    delete process.env.SESSION_SECRET;

    await expect(signSessionToken(PAYLOAD)).rejects.toThrow(
      "SESSION_SECRET est obligatoire."
    );
    // Une erreur de configuration ne doit pas être confondue avec un jeton
    // invalide (qui, lui, retourne null).
    await expect(verifySessionToken("peu-importe")).rejects.toThrow(
      "SESSION_SECRET est obligatoire."
    );
  });

  it("refuse un secret de moins de 32 caractères", async () => {
    const { signSessionToken } = await import("@/lib/session");
    process.env.SESSION_SECRET = "trop-court";

    await expect(signSessionToken(PAYLOAD)).rejects.toThrow(
      "SESSION_SECRET doit contenir au minimum 32 caractères."
    );
  });

  it("accepte un secret de exactement 32 caractères", async () => {
    const { signSessionToken, verifySessionToken } = await import("@/lib/session");
    process.env.SESSION_SECRET = "a".repeat(32);

    const token = await signSessionToken(PAYLOAD);
    expect(await verifySessionToken(token)).not.toBeNull();
  });
});
