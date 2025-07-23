import { z } from "zod";
import { personInZObject } from "@/features/onboarding/schemas/person.schema";
import { addressInZObject } from "@/features/onboarding/schemas/address.schema";

export const onboardingFormZObject = z.object({
  person: personInZObject,
  address: addressInZObject,
});

export type OnboardingFormValues = z.infer<typeof onboardingFormZObject>;
