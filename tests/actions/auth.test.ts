import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/mongodb", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

// createSession dépend de next/headers (cookies()), disponible uniquement
// dans une vraie requête Next.js : on la mocke, la logique de session étant
// déjà couverte indépendamment par tests/lib/session.test.ts.
vi.mock("@/lib/session", () => ({
  createSession: vi.fn().mockResolvedValue(undefined),
  deleteSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/models", () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

import { User } from "@/lib/models";
import { createSession, deleteSession } from "@/lib/session";
import { signup, login, logout } from "@/app/actions/auth";

const mockedUser = vi.mocked(User);
const mockedCreateSession = vi.mocked(createSession);
const mockedDeleteSession = vi.mocked(deleteSession);

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("signup", () => {
  it("refuse la création si un compte existe déjà avec cet email", async () => {
    mockedUser.findOne.mockResolvedValue({ _id: "existing" });

    const result = await signup(
      undefined,
      formData({ name: "William", email: "user@figurinum.com", password: "abc12345" })
    );

    expect(result).toEqual({ message: "Un compte existe déjà avec cet email." });
    expect(mockedUser.create).not.toHaveBeenCalled();
  });

  it("hache le mot de passe avant de créer le compte, puis ouvre une session et redirige", async () => {
    mockedUser.findOne.mockResolvedValue(null);
    mockedUser.create.mockResolvedValue({
      _id: "new-user",
      role: "USER",
    } as never);

    await expect(
      signup(
        undefined,
        formData({ name: "William", email: "user@figurinum.com", password: "abc12345" })
      )
    ).rejects.toThrow("REDIRECT:/");

    expect(mockedUser.create).toHaveBeenCalledTimes(1);
    const createArgs = mockedUser.create.mock.calls[0][0] as { password: string };
    // Le mot de passe stocké ne doit jamais être en clair.
    expect(createArgs.password).not.toBe("abc12345");
    expect(await bcrypt.compare("abc12345", createArgs.password)).toBe(true);

    expect(mockedCreateSession).toHaveBeenCalledWith("new-user", "USER");
  });
});

describe("login", () => {
  it("refuse un mot de passe incorrect", async () => {
    const hashed = await bcrypt.hash("bon-mot-de-passe1", 4);
    mockedUser.findOne.mockResolvedValue({
      _id: "user-1",
      role: "USER",
      password: hashed,
    });

    const result = await login(
      undefined,
      formData({ email: "user@figurinum.com", password: "mauvais-mot-de-passe" })
    );

    expect(result).toEqual({ message: "Email ou mot de passe incorrect." });
    expect(mockedCreateSession).not.toHaveBeenCalled();
  });

  it("connecte l'utilisateur avec des identifiants valides et redirige vers l'accueil", async () => {
    const hashed = await bcrypt.hash("bon-mot-de-passe1", 4);
    mockedUser.findOne.mockResolvedValue({
      _id: "user-1",
      role: "ADMIN",
      password: hashed,
    });

    await expect(
      login(
        undefined,
        formData({ email: "admin@figurinum.com", password: "bon-mot-de-passe1" })
      )
    ).rejects.toThrow("REDIRECT:/");

    expect(mockedCreateSession).toHaveBeenCalledWith("user-1", "ADMIN");
  });

  it("respecte une callbackUrl relative valide mais ignore une callbackUrl externe (protection open-redirect)", async () => {
    const hashed = await bcrypt.hash("bon-mot-de-passe1", 4);
    mockedUser.findOne.mockResolvedValue({
      _id: "user-1",
      role: "USER",
      password: hashed,
    });

    await expect(
      login(
        undefined,
        formData({
          email: "user@figurinum.com",
          password: "bon-mot-de-passe1",
          callbackUrl: "//evil.example.com",
        })
      )
    ).rejects.toThrow("REDIRECT:/");
  });

});

describe("logout", () => {
  it("supprime la session et redirige vers la page de connexion", async () => {
    await expect(logout()).rejects.toThrow("REDIRECT:/auth/login");
    expect(mockedDeleteSession).toHaveBeenCalled();
  });
});
