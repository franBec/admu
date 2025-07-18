import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { OnboardServiceTag } from "@/features/onboarding/ports/in/onboard-service-tag";
import { OnboardRepositoryTag } from "@/features/onboarding/ports/out/onboard-repository-tag";
import { ClerkServiceTag } from "@/services/clerk-service-tag";
import { ClerkUserDoesNotHaveEmailAddress } from "@/errors/clerk-user-does-not-have-email-address";

export const OnboardServiceLive = Layer.effect(
  OnboardServiceTag,
  Effect.gen(function* () {
    const personRepository = yield* OnboardRepositoryTag;
    const clerkService = yield* ClerkServiceTag;

    return {
      onboardPerson: onboardData =>
        Effect.log(onboardData).pipe(
          Effect.andThen(() =>
            Effect.gen(function* () {
              const user = yield* clerkService.getCurrentUser();

              const email = user.primaryEmailAddress?.emailAddress;
              if (!email) {
                return yield* Effect.fail(
                  new ClerkUserDoesNotHaveEmailAddress({})
                );
              }

              const clerkUserData = {
                clerkId: user.id,
                imageUrl: user.imageUrl,
                email: email,
              };

              const { address, ...personData } = onboardData;

              const person = yield* personRepository.onboardPerson(
                {
                  ...personData,
                  birthDate: personData.birthDate.toISOString().split("T")[0],
                },
                clerkUserData,
                address
              );

              yield* clerkService.updateUserPublicMetadata(user.id, {
                onboardingComplete: true,
              });

              return person;
            })
          ),
          Effect.tap(response => Effect.log(response)),
          Effect.tapError(e => Effect.logError(e)),
          Effect.withLogSpan(
            "src/services/onboard-service-live.ts>OnboardServiceLive>onboardPerson()"
          )
        ),
    };
  })
);
