import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { OnboardServiceTag } from "@/features/onboarding/ports/in/onboard-service-tag";
import { OnboardRepositoryTag } from "@/features/onboarding/ports/out/onboard-repository-tag";
import { ClerkServiceTag } from "@/services/clerk-service-tag";
import { ClerkUserDoesNotHaveEmailAddress } from "@/errors/clerk-user-does-not-have-email-address";

const label =
  "src/core/features/onboarding/onboard-service-live.ts>OnboardServiceLive>onboardPerson()";

export const OnboardServiceLive = Layer.effect(
  OnboardServiceTag,
  Effect.gen(function* () {
    const personRepository = yield* OnboardRepositoryTag;
    const clerkService = yield* ClerkServiceTag;

    return {
      onboardPerson: data =>
        Effect.log(data).pipe(
          Effect.andThen(() =>
            Effect.gen(function* () {
              const user = yield* clerkService.getCurrentUser();

              const email = user.primaryEmailAddress?.emailAddress;
              if (!email) {
                return yield* Effect.fail(
                  new ClerkUserDoesNotHaveEmailAddress({})
                );
              }

              yield* personRepository.onboardPerson({
                personIn: data.personIn,
                clerkUserIn: {
                  clerkId: user.id,
                  imageUrl: user.imageUrl,
                  email: email,
                },
                addressIn: data.addressIn,
              });

              yield* clerkService.updateUserPublicMetadata(user.id, {
                onboardingComplete: true,
              });
            })
          ),
          Effect.tap(response => Effect.log(response)),
          Effect.tapError(e => Effect.logError(e)),
          Effect.withLogSpan(label)
        ),
    };
  })
);
