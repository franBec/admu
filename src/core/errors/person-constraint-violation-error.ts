import * as Data from "effect/Data";

export class PersonConstraintViolationError extends Data.TaggedError(
  "PersonConstraintViolationError"
)<{
  message: string;
}> {}
