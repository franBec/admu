import { z } from "zod";

export const personInZObject = z.object({
  givenName: z.string().nonempty("First name cannot be empty."),
  familyName: z.string().nonempty("Last name cannot be empty."),
  gender: z.string().nonempty("Please select a gender."),
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
  nationality: z
    .string()
    .length(2, { message: "Nationality must be a 2-letter code." }),
  documentType: z.string().nonempty("Please select a document type."),
  documentNumber: z.string().nonempty("Document number cannot be empty."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().nullish(),
});

export type PersonIn = z.infer<typeof personInZObject>;
