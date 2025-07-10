"use client";

import { useUser } from "@clerk/nextjs";
import { OnboardingForm } from "@/app/onboarding/_components/onboarding-form";
import { OnboardingFormSkeleton } from "@/app/onboarding/_components/onboarding-form-skeleton";

export function OnboardingWrapper() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <OnboardingFormSkeleton />;
  }

  return (
    <OnboardingForm
      initialUserData={{
        givenName: user?.firstName,
        familyName: user?.lastName,
        email: user?.emailAddresses?.[0]?.emailAddress,
        phoneNumber: user?.phoneNumbers?.[0]?.phoneNumber,
      }}
    />
  );
}
