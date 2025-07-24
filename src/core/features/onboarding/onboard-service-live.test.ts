import { describe, it, expect, vi } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { OnboardServiceLive } from "./onboard-service-live";
import { OnboardServiceTag } from "@/features/onboarding/ports/in/onboard-service-tag";
import { ClerkServiceTag } from "@/services/clerk-service-tag";
import { OnboardRepositoryTag } from "@/features/onboarding/ports/out/onboard-repository-tag";
import { User } from "@clerk/nextjs/server";

describe("OnboardService", () => {
  it.effect("should onboard a person successfully", () =>
    Effect.gen(function* () {
      const mockClerkService = {
        getCurrentUser: vi.fn(() =>
          Effect.succeed({
            id: "clerk_user_id",
            imageUrl: "http://example.com/image.png",
            primaryEmailAddress: {
              emailAddress: "test@example.com",
            },
          } as unknown as User)
        ),
        updateUserPublicMetadata: vi.fn(() => Effect.succeed(void 0)),
      };

      const mockOnboardRepository = {
        onboardPerson: vi.fn(() => Effect.succeed(void 0)),
      };

      yield* OnboardServiceTag.pipe(
        Effect.flatMap(service =>
          service.onboardPerson({
            personIn: {
              givenName: "John",
              familyName: "Doe",
              gender: "Male",
              birthDate: new Date(),
              nationality: "US",
              documentType: "Passport",
              documentNumber: "12345",
              phoneNumber: "123-456-7890",
              email: "test@example.com",
            },
            addressIn: {
              street: "123 Main St",
              city: "Anytown",
              postalCode: "90210",
              province: "CA",
              country: "US",
            },
          })
        ),
        Effect.provide(OnboardServiceLive),
        Effect.provide(Layer.succeed(ClerkServiceTag, mockClerkService)),
        Effect.provide(
          Layer.succeed(OnboardRepositoryTag, mockOnboardRepository)
        )
      );

      expect(mockClerkService.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(mockOnboardRepository.onboardPerson).toHaveBeenCalledTimes(1);
      expect(mockOnboardRepository.onboardPerson).toHaveBeenCalledWith(
        expect.objectContaining({
          personIn: expect.objectContaining({ givenName: "John" }),
          clerkUserIn: expect.objectContaining({ clerkId: "clerk_user_id" }),
          addressIn: expect.objectContaining({ street: "123 Main St" }),
        })
      );
      expect(mockClerkService.updateUserPublicMetadata).toHaveBeenCalledWith(
        "clerk_user_id",
        { onboardingComplete: true }
      );
    })
  );
});
