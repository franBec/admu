import { describe, it, expect, vi } from "vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { onboard } from "./onboard.action";
import { OnboardServiceTag } from "@/features/onboarding/ports/in/onboard-service.tag";
import { ZodValidationError } from "@/errors/zod-validation-error";
import { PersonConstraintViolationError } from "@/errors/person-constraint-violation-error";
import { ClerkCurrentUserNotFoundError } from "@/errors/clerk-current-user-not-found-error";
import { ClerkServiceTag } from "@/services/clerk-service.tag";
import { OnboardRepositoryTag } from "@/features/onboarding/ports/out/onboard-repository.tag";
import { DrizzleServiceTag } from "@/services/drizzle-service.tag";

vi.mock("@/features/onboarding/onboard-service.live", () => ({
  OnboardServiceLive: {
    onboardPerson: vi.fn(),
  },
}));

vi.mock("@/services/clerk-service.live", () => ({
  ClerkServiceLive: {
    getCurrentUser: vi.fn(),
    updateUserPublicMetadata: vi.fn(),
  },
}));

vi.mock("@/features/onboarding/adapters/out/repositories/onboard-repository.live", () => ({
  OnboardRepositoryLive: {
    onboardPerson: vi.fn(),
  },
}));

vi.mock("@/services/drizzle-service.live", () => ({
  DrizzleServiceLive: {
    db: vi.fn(),
  },
}));

// Mock headers for next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => ({
    get: vi.fn(key => {
      if (key === "x-trace-id") return "test-trace-id";
      if (key === "x-request-url") return "http://localhost";
      return null;
    }),
  })),
}));

describe("onboard.action", () => {
  const validOnboardingFormValues = {
    person: {
      givenName: "John",
      familyName: "Doe",
      gender: "Male",
      birthDate: "1990-01-01",
      nationality: "US",
      documentType: "Passport",
      documentNumber: "12345",
      email: "john.doe@example.com",
      phoneNumber: "123-456-7890",
    },
    address: {
      street: "123 Main St",
      number: "Apt 1",
      floor: "1",
      apartment: "101",
      city: "Anytown",
      postalCode: "90210",
      province: "CA",
      country: "US",
    },
  };

  const invalidOnboardingFormValues = {
    ...validOnboardingFormValues,
    person: { ...validOnboardingFormValues.person, givenName: "" }, // Invalid person data
  };

  const mockClerkService = {
    getCurrentUser: vi.fn(() => Effect.succeed({ id: "clerk_user_id", imageUrl: "image.png", primaryEmailAddress: { emailAddress: "test@example.com" } })),
    updateUserPublicMetadata: vi.fn(() => Effect.succeed(void 0)),
  };
  const mockOnboardRepository = {
    onboardPerson: vi.fn(() => Effect.succeed(void 0)),
  };
  const mockDrizzleService = {
    db: vi.fn(() => ({})),
  };

  it("should successfully onboard a person with valid data", async () => {
    const mockOnboardService = {
      onboardPerson: vi.fn(() => Effect.succeed(void 0)),
    };

    const program = await onboard(validOnboardingFormValues);
    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(Layer.succeed(OnboardServiceTag, mockOnboardService)),
        Effect.provide(Layer.succeed(ClerkServiceTag, mockClerkService)),
        Effect.provide(Layer.succeed(OnboardRepositoryTag, mockOnboardRepository)),
        Effect.provide(Layer.succeed(DrizzleServiceTag, mockDrizzleService)),
      )
    );

    expect(mockOnboardService.onboardPerson).toHaveBeenCalledTimes(1);
    expect(mockOnboardService.onboardPerson).toHaveBeenCalledWith({
      personIn: validOnboardingFormValues.person,
      addressIn: validOnboardingFormValues.address,
    });
    expect(result).toBeUndefined();
  });

  it("should return ZodValidationError for invalid form data", async () => {
    const mockOnboardService = {
      onboardPerson: vi.fn(() => Effect.succeed(void 0)),
    };

    const program = await onboard(invalidOnboardingFormValues);
    const result = await Effect.runPromiseExit(
      program.pipe(
        Effect.provide(Layer.succeed(OnboardServiceTag, mockOnboardService)),
        Effect.provide(Layer.succeed(ClerkServiceTag, mockClerkService)),
        Effect.provide(Layer.succeed(OnboardRepositoryTag, mockOnboardRepository)),
        Effect.provide(Layer.succeed(DrizzleServiceTag, mockDrizzleService)),
      )
    );

    expect(mockOnboardService.onboardPerson).not.toHaveBeenCalled();
    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      expect(result.cause._tag).toBe("Fail");
      if (result.cause._tag === "Fail") {
        expect(result.cause.value).toBeInstanceOf(ZodValidationError);
        expect(result.cause.value.message).toContain("Invalid input");
      }
    }
  });

  it("should return PersonConstraintViolationError if onboardService fails with it", async () => {
    const mockOnboardService = {
      onboardPerson: vi.fn(() =>
        Effect.fail(new PersonConstraintViolationError({ message: "Duplicate person" }))
      ),
    };

    const program = await onboard(validOnboardingFormValues);
    const result = await Effect.runPromiseExit(
      program.pipe(
        Effect.provide(Layer.succeed(OnboardServiceTag, mockOnboardService)),
        Effect.provide(Layer.succeed(ClerkServiceTag, mockClerkService)),
        Effect.provide(Layer.succeed(OnboardRepositoryTag, mockOnboardRepository)),
        Effect.provide(Layer.succeed(DrizzleServiceTag, mockDrizzleService)),
      )
    );

    expect(mockOnboardService.onboardPerson).toHaveBeenCalledTimes(1);
    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      expect(result.cause._tag).toBe("Fail");
      if (result.cause._tag === "Fail") {
        expect(result.cause.value).toBeInstanceOf(PersonConstraintViolationError);
        expect(result.cause.value.message).toBe("Duplicate person");
      }
    }
  });

  it("should return ClerkCurrentUserNotFoundError if onboardService fails with it", async () => {
    const mockOnboardService = {
      onboardPerson: vi.fn(() =>
        Effect.fail(new ClerkCurrentUserNotFoundError({ message: "Clerk user not found" }))
      ),
    };

    const program = await onboard(validOnboardingFormValues);
    const result = await Effect.runPromiseExit(
      program.pipe(
        Effect.provide(Layer.succeed(OnboardServiceTag, mockOnboardService)),
        Effect.provide(Layer.succeed(ClerkServiceTag, mockClerkService)),
        Effect.provide(Layer.succeed(OnboardRepositoryTag, mockOnboardRepository)),
        Effect.provide(Layer.succeed(DrizzleServiceTag, mockDrizzleService)),
      )
    );

    expect(mockOnboardService.onboardPerson).toHaveBeenCalledTimes(1);
    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      expect(result.cause._tag).toBe("Fail");
      if (result.cause._tag === "Fail") {
        expect(result.cause.value).toBeInstanceOf(ClerkCurrentUserNotFoundError);
        expect(result.cause.value.message).toBe("Clerk user not found");
      }
    }
  });

  it("should return a generic error for unexpected failures", async () => {
    const mockOnboardService = {
      onboardPerson: vi.fn(() => Effect.die(new Error("Something unexpected happened"))),
    };

    const program = await onboard(validOnboardingFormValues);
    const result = await Effect.runPromiseExit(
      program.pipe(
        Effect.provide(Layer.succeed(OnboardServiceTag, mockOnboardService)),
        Effect.provide(Layer.succeed(ClerkServiceTag, mockClerkService)),
        Effect.provide(Layer.succeed(OnboardRepositoryTag, mockOnboardRepository)),
        Effect.provide(Layer.succeed(DrizzleServiceTag, mockDrizzleService)),
      )
    );

    expect(mockOnboardService.onboardPerson).toHaveBeenCalledTimes(1);
    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      expect(result.cause._tag).toBe("Die");
      if (result.cause._tag === "Die") {
        expect(result.cause.value).toBeInstanceOf(Error);
        expect(result.cause.value.message).toBe("Something unexpected happened");
      }
    }
  });
});