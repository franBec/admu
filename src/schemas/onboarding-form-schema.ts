import { z } from "zod";

export const onboardingFormSchema = z.object({
  givenName: z.string().nonempty("First name cannot be empty."),
  familyName: z.string().nonempty("Last name cannot be empty."),
  genderCode: z.string().nonempty("Please select a gender."),
  birthDate: z.coerce
    .date({
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_date) {
          return { message: "Invalid date format. Please use YYYY-MM-DD." };
        }
        return { message: ctx.defaultError };
      },
    })
    .refine(date => date < new Date(), {
      message: "Birth date cannot be in the future.",
    }),
  nationalityAlpha2Code: z
    .string()
    .length(2, { message: "Nationality must be a 2-letter code." }),
  documentTypeCode: z.string().nonempty("Please select a document type."),
  documentNumber: z.string().nonempty("Document number cannot be empty."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().nullish(),
  address: z.object({
    street: z.string().nonempty("Street cannot be empty."),
    number: z.string().nullish(),
    floor: z.string().nullish(),
    apartment: z.string().nullish(),
    city: z.string().nonempty("City cannot be empty."),
    postalCode: z.string().nonempty("Postal code cannot be empty."),
    province: z.string().nonempty("Province cannot be empty."),
    countryAlpha2Code: z
      .string()
      .length(2, { message: "Country must be a 2-letter code." }),
  }),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
