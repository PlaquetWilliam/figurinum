import { describe, it, expect } from "vitest";
import { LoginFormSchema, SignupFormSchema } from "@/lib/definitions";

describe("LoginFormSchema", () => {
  it("accepte un email et un mot de passe valides", () => {
    const result = LoginFormSchema.safeParse({
      email: "user@figurinum.com",
      password: "whatever",
    });
    expect(result.success).toBe(true);
  });

});

describe("SignupFormSchema", () => {
  it("accepte un nom, un email et un mot de passe valides", () => {
    const result = SignupFormSchema.safeParse({
      name: "William",
      email: "user@figurinum.com",
      password: "abc12345",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un mot de passe trop court (moins de 8 caractères)", () => {
    const result = SignupFormSchema.safeParse({
      name: "William",
      email: "user@figurinum.com",
      password: "abc123",
    });
    expect(result.success).toBe(false);
  });


  it("nettoie les espaces superflus (trim) sur l'email et le nom", () => {
    const result = SignupFormSchema.safeParse({
      name: "  William  ",
      email: "  user@figurinum.com  ",
      password: "abc12345",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("William");
      expect(result.data.email).toBe("user@figurinum.com");
    }
  });
});
