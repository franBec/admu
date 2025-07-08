import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { PersonServiceTag } from "@/services/person-service-tag";
import { PersonRepositoryTag } from "@/repositories/person-repository-tag";
import { ClerkServiceTag } from "@/services/clerk-service-tag";
import { ClerkCurrentUserNotFoundError } from "@/errors/clerk-current-user-not-found-error";
import { ClerkUserDoesNotHaveEmailAddress } from "@/errors/clerk-user-does-not-have-email-address";

export const PersonServiceLive = Layer.effect(
  PersonServiceTag,
  Effect.gen(function* () {
    const personRepository = yield* PersonRepositoryTag;
    const clerkService = yield* ClerkServiceTag;

    return {
      onboardPerson: onboardData =>
        Effect.gen(function* () {
          const user = yield* clerkService.getCurrentUser;

          if (!user) {
            return yield* Effect.fail(new ClerkCurrentUserNotFoundError());
          }

          const email = user.primaryEmailAddress?.emailAddress;
          if (!email) {
            return yield* Effect.fail(new ClerkUserDoesNotHaveEmailAddress());
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
        }),
    };
  })
);
