import { z } from "zod";

export const addressInZObject = z.object({
  street: z.string().nonempty("Street cannot be empty."),
  number: z.string().nullish(),
  floor: z.string().nullish(),
  apartment: z.string().nullish(),
  city: z.string().nonempty("City cannot be empty."),
  postalCode: z.string().nonempty("Postal code cannot be empty."),
  province: z.string().nonempty("Province cannot be empty."),
  country: z
    .string()
    .length(2, { message: "Country must be a 2-letter code." }),
});

export type AddressIn = z.infer<typeof addressInZObject>;
