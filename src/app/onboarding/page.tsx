import { OnboardingWrapper } from "@/app/onboarding/_components/onboarding-wrapper";
import { fetchCountries } from "@/actions/country-action";
import { fetchGenders } from "@/actions/gender-action";
import { fetchDocumentTypes } from "@/actions/document-type-action";
import { ProblemDetailsAlert } from "@/components/alert/problem-details-alert";

const Page = async () => {
  const [countries, genders, documentTypes] = await Promise.all([
    fetchCountries(),
    fetchGenders(),
    fetchDocumentTypes(),
  ]);

  const errors = [];

  if (!Array.isArray(countries)) {
    errors.push(countries as any);
  }

  if (!Array.isArray(genders)) {
    errors.push(genders as any);
  }

  if (!Array.isArray(documentTypes)) {
    errors.push(documentTypes as any);
  }

  if (errors.length) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        {errors.map((error, i) => (
          <ProblemDetailsAlert
            key={i}
            status={error.status as number}
            instance={error.instance as string | null}
            timestamp={error.timestamp as string}
            trace={error.trace as string | null}
            detail={error.detail as string}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <OnboardingWrapper
        countries={countries as any}
        genders={genders as any}
        documentTypes={documentTypes as any}
      />
    </div>
  );
};

export default Page;
