"use server";

import { currentUser } from "@clerk/nextjs/server";
import {
  OnboardingFormValues,
  onboardingFormSchema,
} from "@/features/person/adapter/in/server-function/schema/onboarding-form-schema";
import { onboardPerson } from "@/features/person/adapter/out/drizzle/person-repository-impl";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function completeOnboarding(values: OnboardingFormValues) {
  const user = await currentUser();
  const client = await clerkClient();

  if (!user) {
    return { success: false, error: "User not authenticated." };
  }

  const validatedFields = onboardingFormSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error(
      "Validation errors:",
      validatedFields.error.flatten().fieldErrors
    );
    return {
      success: false,
      error: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { address, email, birthDate, ...restOfPersonData } =
    validatedFields.data;
  const personDataForPersonTable = {
    ...restOfPersonData,
    birthDate: birthDate.toISOString().split("T")[0],
  };

  const clerkUserData = {
    clerkId: user.id,
    email: user.emailAddresses?.[0]?.emailAddress || email || "",
    imageUrl: user.imageUrl || "",
  };

  try {
    await onboardPerson(personDataForPersonTable, clerkUserData, address);
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        onboardingComplete: true,
      },
    });

    revalidatePath("/");

    return { success: true, message: "Onboarding completed successfully!" };
  } catch (error: any) {
    console.error("Error during onboarding:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during onboarding.",
    };
  }
}
