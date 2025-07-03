import { z } from "zod";

export const onboardingFormSchema = z.object({
  givenName: z.string().min(1, { message: "First name is required." }),
  familyName: z.string().min(1, { message: "Last name is required." }),
  genderId: z.coerce.number(),
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
  nationalityId: z.coerce.number(),
  documentTypeId: z.coerce
    .number()
    .min(1, { message: "Document type is required." }),
  documentNumber: z
    .string()
    .min(1, { message: "Document number is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string(),

  address: z.object({
    street: z.string().min(1, { message: "Street is required." }),
    number: z.string().optional().or(z.literal("")),
    floor: z.string().optional().or(z.literal("")),
    apartment: z.string().optional().or(z.literal("")),
    city: z.string().min(1, { message: "City is required." }),
    postalCode: z.string().optional().or(z.literal("")),
    province: z.string().optional().or(z.literal("")),
    countryId: z.coerce.number().optional(),
  }),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
