import * as Data from "effect/Data";

export class DatabaseQueryError extends Data.TaggedError("DatabaseQueryError")<{
  e: unknown;
}> {}
