"use client";

import { useUser } from "@clerk/nextjs";
import { OnboardingForm } from "@/app/onboarding/_components/form";
import { Skeleton } from "@/components/ui/skeleton";

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

function OnboardingFormSkeleton() {
  return (
    <div className="space-y-8 p-4 md:p-8 border rounded-lg shadow-sm w-full max-w-2xl bg-card text-card-foreground animate-pulse">
      <Skeleton className="h-8 w-64 mx-auto mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-6 w-48 mt-8 mb-4" />
      <div className="text-sm text-muted-foreground -mt-3 mb-4">
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full mt-8" />
    </div>
  );
}
