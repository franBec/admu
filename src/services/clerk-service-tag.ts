import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { User } from "@clerk/nextjs/server";
import { ClerkNextjsServerError } from "@/errors/clerk-nextjs-server-error";
import { ClerkCurrentUserNotFoundError } from "@/errors/clerk-current-user-not-found-error";

export class ClerkServiceTag extends Context.Tag("@services/ClerkService")<
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
