import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { PersonServiceTag } from "@/services/person-service-tag";
import { PersonRepositoryTag } from "@/repositories/person-repository-tag";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { ClerkCurrentUserNotFoundError } from "@/errors/clerk-current-user-not-found-error";
import { ClerkCurrentUserHookError } from "@/errors/clerk-current-user-hook-error";
import { ClerkClientHookError } from "@/errors/clerk-client-hook-error";

export const PersonServiceLive = Layer.effect(
  PersonServiceTag,
  Effect.gen(function* () {
    const personRepository = yield* PersonRepositoryTag;

    return {
      onboardPerson: onboardData =>
        Effect.gen(function* () {
          const user = yield* Effect.tryPromise({
            try: () => currentUser(),
            catch: e => new ClerkCurrentUserHookError({ e }),
          });

          if (!user) {
            return yield* Effect.fail(new ClerkCurrentUserNotFoundError());
          }

          const clerkUserData = {
            clerkId: user.id,
            imageUrl: user.imageUrl,
            email: user.primaryEmailAddress?.emailAddress!,
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

          yield* Effect.tryPromise({
            try: async () => {
              const client = await clerkClient();
              return client.users.updateUser(user.id, {
                publicMetadata: {
                  onboardingComplete: true,
                },
              });
            },
            catch: e => new ClerkClientHookError({ e }),
          });

          return person;
        }),
    };
  })
);
