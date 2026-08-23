import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/mongodb", () => ({
  connectDB: vi.fn(),
}));

import { connectDB } from "@/lib/mongodb";
import { GET as liveness } from "@/app/api/health/route";
import { GET as readiness } from "@/app/api/ready/route";

const mockedConnectDB = vi.mocked(connectDB);

/** Fausse connexion Mongoose, avec un `admin().command()` pilotable. */
function fakeConnection(options: { db?: boolean; ping?: "ok" | "fail" } = {}) {
  const { db = true, ping = "ok" } = options;

  return {
    connection: {
      db: db
        ? {
            admin: () => ({
              command: vi.fn(async () => {
                if (ping === "fail") throw new Error("connexion perdue");
                return { ok: 1 };
              }),
            }),
          }
        : undefined,
    },
  } as unknown as Awaited<ReturnType<typeof connectDB>>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("/api/health (liveness)", () => {
  it("répond 200 sans jamais solliciter MongoDB", async () => {
    const response = await liveness();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
    // C'est tout l'intérêt du liveness : une base injoignable ne doit pas
    // faire redémarrer un conteneur qui répond correctement.
    expect(mockedConnectDB).not.toHaveBeenCalled();
  });
});

describe("/api/ready (readiness)", () => {
  it("répond 200 quand MongoDB est joignable", async () => {
    mockedConnectDB.mockResolvedValue(fakeConnection());

    const response = await readiness();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ready" });
  });

  it("répond 503 quand la connexion MongoDB échoue", async () => {
    mockedConnectDB.mockRejectedValue(new Error("Missing MONGODB_URI"));

    const response = await readiness();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ status: "not_ready" });
  });

  it("répond 503 quand le ping de la base échoue (connexion en cache mais morte)", async () => {
    mockedConnectDB.mockResolvedValue(fakeConnection({ ping: "fail" }));

    const response = await readiness();

    expect(response.status).toBe(503);
  });

  it("répond 503 quand aucune base n'est attachée à la connexion", async () => {
    mockedConnectDB.mockResolvedValue(fakeConnection({ db: false }));

    const response = await readiness();

    expect(response.status).toBe(503);
  });
});
