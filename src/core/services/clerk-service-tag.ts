import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { User } from "@clerk/nextjs/server";
import { ClerkNextjsServerError } from "@/core/errors/clerk-nextjs-server-error";
import { ClerkCurrentUserNotFoundError } from "@/core/errors/clerk-current-user-not-found-error";

export class ClerkServiceTag extends Context.Tag("ClerkServiceTag")<
  ClerkServiceTag,
  {
    readonly getCurrentUser: () => Effect.Effect<
      User,
      ClerkNextjsServerError | ClerkCurrentUserNotFoundError
    >;
    readonly updateUserPublicMetadata: (
      userId: string,
      metadata: Record<string, unknown>
    ) => Effect.Effect<void, ClerkNextjsServerError>;
  }
>() {}
