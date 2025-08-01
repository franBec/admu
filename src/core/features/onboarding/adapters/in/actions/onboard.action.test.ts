import { describe, it, expect, vi } from "vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { onboardProgram } from "./onboard.action";
import { OnboardServiceTag } from "@/features/onboarding/ports/in/onboard-service.tag";
import { ClerkServiceTag } from "@/services/clerk-service.tag";
import { OnboardRepositoryTag } from "@/features/onboarding/ports/out/onboard-repository.tag";
import { DrizzleServiceTag } from "@/services/drizzle-service.tag";
import { User } from "@clerk/nextjs/server";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/core/db/schema";
import * as relations from "@/core/db/relations";

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

vi.mock(
  "@/features/onboarding/adapters/out/repositories/onboard-repository.live",
  () => ({
    OnboardRepositoryLive: {
      onboardPerson: vi.fn(),
    },
  })
);

vi.mock("@/services/drizzle-service.live", () => ({
  DrizzleServiceLive: {
    db: vi.fn(),
  },
}));

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
      birthDate: new Date("1990-01-01"),
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

  const mockClerkService = {
    getCurrentUser: vi.fn(() =>
      Effect.succeed({
        id: "clerk_user_id",
        imageUrl: "image.png",
        primaryEmailAddress: { emailAddress: "test@example.com" },
      } as unknown as User)
    ),
    updateUserPublicMetadata: vi.fn(() => Effect.succeed(void 0)),
  };
  const mockOnboardRepository = {
    onboardPerson: vi.fn(() => Effect.succeed(void 0)),
  };
  const mockDrizzleService = {
    db: {} as unknown as NodePgDatabase<typeof schema & typeof relations>,
  };

  it("should successfully onboard a person with valid data", async () => {
    const mockOnboardService = {
      onboardPerson: vi.fn(() => Effect.succeed(void 0)),
    };

    const program = onboardProgram(validOnboardingFormValues);
    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(Layer.succeed(OnboardServiceTag, mockOnboardService)),
        Effect.provide(Layer.succeed(ClerkServiceTag, mockClerkService)),
        Effect.provide(
          Layer.succeed(OnboardRepositoryTag, mockOnboardRepository)
        ),
        Effect.provide(Layer.succeed(DrizzleServiceTag, mockDrizzleService))
      )
    );

    expect(mockOnboardService.onboardPerson).toHaveBeenCalledTimes(1);
    expect(mockOnboardService.onboardPerson).toHaveBeenCalledWith({
      personIn: validOnboardingFormValues.person,
      addressIn: validOnboardingFormValues.address,
    });
    expect(result).toBeUndefined();
  });
});
