import * as Data from "effect/Data";

export class ClerkCurrentUserHookError extends Data.TaggedError(
  "ClerkCurrentUserHookError"
)<{
  e: unknown;
}> {}
