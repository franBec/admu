import * as Data from "effect/Data";

export class ZodValidationError extends Data.TaggedError("ZodValidationError")<{
  message: string;
}> {}
