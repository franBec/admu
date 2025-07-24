import { describe, it, expect, vi } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { OnboardServiceLive } from "./onboard-service-live";
import { OnboardServiceTag } from "@/features/onboarding/ports/in/onboard-service-tag";
import { ClerkServiceTag } from "@/services/clerk-service-tag";
import { OnboardRepositoryTag } from "@/features/onboarding/ports/out/onboard-repository-tag";
import { User } from "@clerk/nextjs/server";
import { ClerkUserDoesNotHaveEmailAddress } from "@/errors/clerk-user-does-not-have-email-address";
import { PersonIn } from "@/features/onboarding/schemas/person.schema";
import { AddressIn } from "@/features/onboarding/schemas/address.schema";

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
            personIn: {} as unknown as PersonIn,
            addressIn: {} as unknown as AddressIn,
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
          personIn: expect.anything(),
          clerkUserIn: expect.objectContaining({
            clerkId: expect.any(String),
            imageUrl: expect.any(String),
            email: expect.any(String),
          }),
          addressIn: expect.anything(),
        })
      );
      expect(mockClerkService.updateUserPublicMetadata).toHaveBeenCalledWith(
        expect.any(String),
        { onboardingComplete: true }
      );
    })
  );

  it.effect("should fail if clerk user does not have an email address", () =>
    Effect.gen(function* () {
      const mockClerkService = {
        getCurrentUser: vi.fn(() =>
          Effect.succeed({
            id: "clerk_user_id",
            imageUrl: "http://example.com/image.png",
            primaryEmailAddress: undefined,
          } as unknown as User)
        ),
        updateUserPublicMetadata: vi.fn(() => Effect.succeed(void 0)),
      };

      const mockOnboardRepository = {
        onboardPerson: vi.fn(() => Effect.succeed(void 0)),
      };

      const result = yield* OnboardServiceTag.pipe(
        Effect.flatMap(service =>
          service.onboardPerson({
            personIn: {} as unknown as PersonIn,
            addressIn: {} as unknown as AddressIn,
          })
        ),
        Effect.provide(OnboardServiceLive),
        Effect.provide(Layer.succeed(ClerkServiceTag, mockClerkService)),
        Effect.provide(
          Layer.succeed(OnboardRepositoryTag, mockOnboardRepository)
        ),
        Effect.either
      );

      expect(result._tag).toBe("Left");
      expect(result.left).toBeInstanceOf(ClerkUserDoesNotHaveEmailAddress);
      expect(mockClerkService.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(mockOnboardRepository.onboardPerson).not.toHaveBeenCalled();
      expect(mockClerkService.updateUserPublicMetadata).not.toHaveBeenCalled();
    })
  );
});
