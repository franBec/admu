import { z } from "zod";
import { personInZObject } from "../../../schemas/person.schema";
import { addressInZObject } from "../../../schemas/address.schema";

export const onboardingFormZObject = z.object({
  person: personInZObject,
  address: addressInZObject,
});

export type OnboardingFormValues = z.infer<typeof onboardingFormZObject>;
