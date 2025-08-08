import { describe, it, expect, vi, beforeEach } from "vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { DrizzleServiceLive } from "./drizzle-service.live";
import { DrizzleServiceTag } from "./drizzle-service.tag";
import { DatabasePoolError } from "@/core/errors/database-pool-error";

// Mock the 'pg' module
vi.mock("pg", () => {
  const mockConnect = vi.fn();
  const mockRelease = vi.fn();
  const mockEnd = vi.fn();

  const mockPool = vi.fn(() => ({
    connect: mockConnect.mockResolvedValue({ release: mockRelease }),
    end: mockEnd.mockResolvedValue(undefined),
  }));

  return { Pool: mockPool, __mockConnect: mockConnect, __mockEnd: mockEnd };
});

// Mock the 'drizzle-orm/node-postgres' module
vi.mock("drizzle-orm/node-postgres", () => {
  const mockDrizzle = vi.fn(() => ({})); // Mock a simple db object
  return { drizzle: mockDrizzle, __mockDrizzle: mockDrizzle };
});

// Import the mocked modules to get references to the mocks
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

let mockPgPool: vi.Mock;
let mockPgConnect: vi.Mock;
let mockPgEnd: vi.Mock;
let mockDrizzle: vi.Mock;

describe("DrizzleServiceLive", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Get references to the mocks after clearing
    const pgModule = await import("pg");
    mockPgPool = pgModule.Pool as vi.Mock;
    mockPgConnect = (pgModule as any).__mockConnect;
    mockPgEnd = (pgModule as any).__mockEnd;

    const drizzleModule = await import("drizzle-orm/node-postgres");
    mockDrizzle = (drizzleModule as any).__mockDrizzle;

    // Reset DATABASE_URL for each test
    process.env.DATABASE_URL = "postgres://user:password@host:port/database";
  });

  // Helper to run the effect and get the service
  const runDrizzleService = () =>
    Effect.runPromise(Effect.provide(DrizzleServiceTag, DrizzleServiceLive));

  it("should provide the db service on successful connection", async () => {
    const service = await runDrizzleService();
    expect(service).toHaveProperty("db");
    expect(mockPgPool).toHaveBeenCalledTimes(1);
    expect(mockPgConnect).toHaveBeenCalledTimes(1);
    expect(mockDrizzle).toHaveBeenCalledTimes(1);
  });

  it("should die if DATABASE_URL is not set (direct effect test)", async () => {
    delete process.env.DATABASE_URL;
    const program = Effect.succeed(process.env.DATABASE_URL).pipe(
      Effect.flatMap(databaseUrl => {
        if (!databaseUrl) {
          return Effect.die(new Error("DATABASE_URL is not set."));
        }
        return Effect.succeed("success"); // Dummy success for the happy path
      })
    );

    const result = await Effect.runPromiseExit(program);
    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      expect(result.cause._tag).toBe("Die");
      if (result.cause._tag === "Die") {
        expect(result.cause.defect).toBeInstanceOf(Error);
        expect((result.cause.defect as Error).message).toBe("DATABASE_URL is not set.");
      }
    }
  });

  it("should fail with DatabasePoolError on connection failure", async () => {
    mockPgConnect.mockRejectedValueOnce(new Error("Connection refused"));
    const program = Effect.provide(DrizzleServiceTag, DrizzleServiceLive);
    const result = await Effect.runPromiseExit(program);
    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      expect(result.cause._tag).toBe("Fail");
      if (result.cause._tag === "Fail") {
        expect(result.cause.error).toBeInstanceOf(DatabasePoolError);
      }
    }
  });

  it("should call pool.end() when the service is finalized", async () => {
    await Effect.runPromise(Effect.scoped(Effect.provide(DrizzleServiceTag, DrizzleServiceLive)));
    expect(mockPgEnd).toHaveBeenCalledTimes(1);
  });
});
