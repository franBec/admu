import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { ClerkServiceTag } from "@/services/clerk-service-tag";
import { ClerkNextjsServerError } from "@/errors/clerk-nextjs-server-error";
import { ClerkCurrentUserNotFoundError } from "@/errors/clerk-current-user-not-found-error";

export const ClerkServiceLive = Layer.effect(
  ClerkServiceTag,
  Effect.gen(function* () {
    return {
      getCurrentUser: () =>
        Effect.gen(function* () {
          const user = yield* Effect.tryPromise({
            try: () => currentUser(),
            catch: e => new ClerkNextjsServerError({ e }),
          });
          if (user === null) {
            return yield* Effect.fail(new ClerkCurrentUserNotFoundError());
          }
          return user;
        }),
      updateUserPublicMetadata: (userId, metadata) =>
        Effect.tryPromise({
          try: async () => {
            const client = await clerkClient();
            await client.users.updateUser(userId, {
              publicMetadata: metadata,
            });
          },
          catch: e => new ClerkNextjsServerError({ e }),
        }),
    };
  })
);
