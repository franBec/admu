import * as Data from "effect/Data";

export class DatabasePoolError extends Data.TaggedError("DatabasePoolError")<{
  e: unknown;
}> {}
