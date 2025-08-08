import { describe, it, expect, vi, beforeEach } from "vitest";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { ClerkServiceLive } from "./clerk-service.live";
import { ClerkServiceTag } from "./clerk-service.tag";
import { ClerkNextjsServerError } from "@/core/errors/clerk-nextjs-server-error";
import { ClerkCurrentUserNotFoundError } from "@/core/errors/clerk-current-user-not-found-error";

vi.mock("@clerk/nextjs/server", () => {
  const mockUpdateUser = vi.fn();
  const mockClerkClient = vi.fn(() => ({
    users: {
      updateUser: mockUpdateUser,
    },
  }));

  return {
    currentUser: vi.fn(),
    clerkClient: mockClerkClient,
    __mockUpdateUser: mockUpdateUser,
    __mockClerkClient: mockClerkClient,
  };
});

let mockUpdateUser: any;
let mockClerkClient: any;

import { currentUser as clerkCurrentUser, User } from "@clerk/nextjs/server";

describe("ClerkServiceLive", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Get references to the mock functions
    const mockModule = await import("@clerk/nextjs/server");
    mockUpdateUser = (mockModule as any).__mockUpdateUser;
    mockClerkClient = (mockModule as any).__mockClerkClient;
  });

  const runEffect = <E, A>(program: Effect.Effect<A, E, ClerkServiceTag>) =>
    Effect.runPromise(Effect.provide(program, ClerkServiceLive));

  const runEffectExit = <E, A>(program: Effect.Effect<A, E, ClerkServiceTag>) =>
    Effect.runPromiseExit(Effect.provide(program, ClerkServiceLive));

  const expectEffectToSucceedWith = async <E, A>(
    program: Effect.Effect<A, E, ClerkServiceTag>,
    expectedValue: A
  ) => {
    const result = await runEffectExit(program);
    if (Exit.isSuccess(result)) {
      expect(result.value).toEqual(expectedValue);
    } else {
      expect.fail(
        `Expected success but got failure: ${JSON.stringify(result.cause)}`
      );
    }
    return result;
  };

  const expectEffectToFailWith = async <E, A>(
    program: Effect.Effect<A, E, ClerkServiceTag>,
    expectedError: new (...args: any[]) => any,
    mockError?: Error
  ) => {
    const result = await runEffectExit(program);
    if (Exit.isFailure(result)) {
      if (result.cause._tag === "Fail") {
        expect(result.cause.error).toBeInstanceOf(expectedError);
        if (mockError) {
          expect((result.cause.error as any).e).toBe(mockError);
        }
      } else {
        expect.fail(
          `Expected cause to be 'Fail' but got '${result.cause._tag}'`
        );
      }
    } else {
      expect.fail(
        `Expected failure but got success: ${JSON.stringify(result.value)}`
      );
    }
    return result;
  };

  describe("getCurrentUser", () => {
    const program = Effect.gen(function* () {
      const service = yield* ClerkServiceTag;
      return yield* service.getCurrentUser();
    });

    it("should return the current user if found", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
      } as unknown as User;
      vi.mocked(clerkCurrentUser).mockResolvedValue(mockUser);

      await expectEffectToSucceedWith(program, mockUser);
      expect(clerkCurrentUser).toHaveBeenCalledTimes(1);
    });

    it("should return ClerkCurrentUserNotFoundError if user is null", async () => {
      vi.mocked(clerkCurrentUser).mockResolvedValue(null);

      await expectEffectToFailWith(program, ClerkCurrentUserNotFoundError);
      expect(clerkCurrentUser).toHaveBeenCalledTimes(1);
    });

    it("should return ClerkCurrentUserNotFoundError only when user is exactly null", async () => {
      const mockUser = undefined as unknown as User;
      vi.mocked(clerkCurrentUser).mockResolvedValue(mockUser);

      const result = await runEffect(program);
      expect(result).toBeUndefined();
      expect(clerkCurrentUser).toHaveBeenCalledTimes(1);
    });

    it("should return user even if falsy but not null", async () => {
      const mockUser = {} as unknown as User;
      vi.mocked(clerkCurrentUser).mockResolvedValue(mockUser);

      await expectEffectToSucceedWith(program, mockUser);
      expect(clerkCurrentUser).toHaveBeenCalledTimes(1);
    });

    it("should return ClerkNextjsServerError on unexpected error", async () => {
      const mockError = new Error("Clerk API error");
      vi.mocked(clerkCurrentUser).mockRejectedValue(mockError);

      await expectEffectToFailWith(program, ClerkNextjsServerError, mockError);
      expect(clerkCurrentUser).toHaveBeenCalledTimes(1);
    });

    it("should distinguish between null and other falsy values", async () => {
      vi.mocked(clerkCurrentUser).mockResolvedValue(null);
      await expectEffectToFailWith(program, ClerkCurrentUserNotFoundError);
      vi.clearAllMocks();
      vi.mocked(clerkCurrentUser).mockResolvedValue(undefined as any);
      const result = await runEffect(program);
      expect(result).toBeUndefined();
      expect(clerkCurrentUser).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateUserPublicMetadata", () => {
    const userId = "user123";
    const metadata = { role: "admin" };
    const program = Effect.gen(function* () {
      const service = yield* ClerkServiceTag;
      return yield* service.updateUserPublicMetadata(userId, metadata);
    });

    it("should update user public metadata successfully", async () => {
      mockUpdateUser.mockResolvedValue(undefined);

      const result = await runEffect(program);
      expect(result).toBeUndefined();
      expect(mockClerkClient).toHaveBeenCalledTimes(1);
      expect(mockUpdateUser).toHaveBeenCalledTimes(1);
      expect(mockUpdateUser).toHaveBeenCalledWith(userId, {
        publicMetadata: metadata,
      });
    });

    it("should return ClerkNextjsServerError on update error", async () => {
      const mockError = new Error("Update failed");
      mockUpdateUser.mockRejectedValue(mockError);

      await expectEffectToFailWith(program, ClerkNextjsServerError, mockError);
      expect(mockClerkClient).toHaveBeenCalledTimes(1);
      expect(mockUpdateUser).toHaveBeenCalledTimes(1);
      expect(mockUpdateUser).toHaveBeenCalledWith(userId, {
        publicMetadata: metadata,
      });
    });

    it("should ensure clerkClient mock has correct structure", () => {
      expect(mockClerkClient).toBeInstanceOf(Function);
      const client = mockClerkClient();
      expect(client).toHaveProperty("users");
      expect(client.users).toHaveProperty("updateUser");
      expect(client.users.updateUser).toBeInstanceOf(Function);
    });
  });
});
