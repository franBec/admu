import { Schema } from "effect";

export const nonEmptyString = (fieldName: string) =>
  Schema.String.pipe(
    Schema.nonEmptyString({ message: () => `${fieldName} cannot be empty.` })
  );
