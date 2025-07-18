import { Schema } from "effect";
import { nonEmptyString } from "@/utils/schema-effect-utils";

export const AddressSchema = Schema.Struct({
  street: nonEmptyString("Street"),
  number: Schema.optional(Schema.String),
  floor: Schema.optional(Schema.String),
  apartment: Schema.optional(Schema.String),
  city: nonEmptyString("City"),
  postalCode: nonEmptyString("Postal code"),
  province: nonEmptyString("Province"),
  country: Schema.String.pipe(
    Schema.length(2, { message: () => "Country must be a 2-letter code." })
  ),
});
export type AddressType = Schema.Schema.Type<typeof AddressSchema>;
