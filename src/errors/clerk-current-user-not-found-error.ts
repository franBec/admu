import * as Data from "effect/Data";

export class ClerkCurrentUserNotFoundError extends Data.TaggedError(
  "ClerkCurrentUserNotFoundError"
)<{}> {}
