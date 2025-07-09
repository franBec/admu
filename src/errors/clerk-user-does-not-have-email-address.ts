import * as Data from "effect/Data";

export class ClerkUserDoesNotHaveEmailAddress extends Data.TaggedError(
  "ClerkUserDoesNotHaveEmailAddress"
)<object> {}
