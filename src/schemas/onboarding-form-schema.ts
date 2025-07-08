import { z } from "zod";

export const onboardingFormSchema = z.object({
  givenName: z.string().nonempty(),
  familyName: z.string().nonempty(),
  genderCode: z.string().nonempty(),
  birthDate: z.coerce
    .date({
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_date) {
          return { message: "Invalid date format." };
        }
        return { message: ctx.defaultError };
      },
    })
    .refine(date => date < new Date(), {
      message: "Birth date cannot be in the future.",
    }),
  nationalityAlpha2Code: z
    .string()
    .length(2, { message: "Invalid nationality." }),
  documentTypeCode: z.string(),
  documentNumber: z.string().nonempty(),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().optional(),
  address: z.object({
    street: z.string().nonempty(),
    number: z.string().optional(),
    floor: z.string().optional(),
    apartment: z.string().optional(),
    city: z.string().nonempty(),
    postalCode: z.string().nonempty(),
    province: z.string(),
    countryAlpha2Code: z
      .string()
      .length(2, { message: "Invalid address country." }),
  }),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
