import { Skeleton } from "@/components/ui/skeleton";

export function OnboardingFormSkeleton() {
  return (
    <div className="space-y-8 p-4 md:p-8 border rounded-lg shadow-sm w-full max-w-2xl bg-card text-card-foreground animate-pulse">
      <Skeleton className="h-8 w-64 mx-auto mb-6" /> {/* For h2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Skeleton className="h-10 w-full" /> {/* First Name */}
        <Skeleton className="h-10 w-full" /> {/* Last Name */}
        <Skeleton className="h-10 w-full" /> {/* Email */}
        <Skeleton className="h-10 w-full" /> {/* Phone Number */}
        <Skeleton className="h-10 w-full" /> {/* Date of Birth */}
        <Skeleton className="h-10 w-full" /> {/* Gender */}
        <Skeleton className="h-10 w-full" /> {/* Nationality */}
        <Skeleton className="h-10 w-full" /> {/* Document Type */}
        <Skeleton className="h-10 w-full" /> {/* Document Number */}
      </div>
      <Skeleton className="h-6 w-48 mt-8 mb-4" /> {/* For h3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Skeleton className="h-10 w-full" /> {/* Street */}
        <Skeleton className="h-10 w-full" /> {/* Number */}
        <Skeleton className="h-10 w-full" /> {/* Floor */}
        <Skeleton className="h-10 w-full" /> {/* Apartment */}
        <Skeleton className="h-10 w-full" /> {/* City */}
        <Skeleton className="h-10 w-full" /> {/* Postal Code */}
        <Skeleton className="h-10 w-full" /> {/* Province */}
        <Skeleton className="h-10 w-full" /> {/* Country */}
      </div>
      <Skeleton className="h-10 w-full mt-8" /> {/* For submit button */}
    </div>
  );
}
