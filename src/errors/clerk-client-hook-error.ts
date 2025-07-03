import * as Data from "effect/Data";

export class ClerkClientHookError extends Data.TaggedError(
  "ClerkClientHookError"
)<{
  e: unknown;
}> {}
