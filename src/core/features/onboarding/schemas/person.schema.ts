import { Schema } from "effect";
import { nonEmptyString } from "@/utils/schema-effect-utils";

const emailRegex =
  /^(?!\.)(?!.*\.\.)([A-Z0-9_+-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;

export const PersonSchema = Schema.Struct({
  givenName: nonEmptyString("First name"),
  familyName: nonEmptyString("Last name"),
  gender: nonEmptyString("Gender"),
  birthDate: Schema.Date.pipe(
    Schema.filter(date => date < new Date(), {
      message: () => "Birth date cannot be in the future.",
    })
  ),
  nationality: Schema.String.pipe(
    Schema.length(2, { message: () => "Nationality must be a 2-letter code." })
  ),
  documentType: nonEmptyString("Document type"),
  documentNumber: nonEmptyString("Document number"),
  email: Schema.String.pipe(Schema.pattern(emailRegex)),
  phoneNumber: Schema.optional(Schema.String),
});
export type PersonType = Schema.Schema.Type<typeof PersonSchema>;
