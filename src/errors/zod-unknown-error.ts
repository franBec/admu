import * as Data from "effect/Data";

export class ZodUnknownError extends Data.TaggedError("ZodUnknownError")<{
  e: unknown;
}> {}
