import { OnboardingWrapper } from "@/app/onboarding/_components/onboarding-wrapper";
import { fetchCountries } from "@/actions/country-action";
import { fetchGenders } from "@/actions/gender-action";
import { fetchDocumentTypes } from "@/actions/document-type-action";
import { ProblemDetailsAlert } from "@/components/alert/problem-details-alert";
import { OnboardingDataProvider } from "@/app/onboarding/_components/onboarding-data-provider";

interface ProblemDetails {
  detail: string;
  title: string;
  status: number;
  instance: string | null;
  timestamp: string;
  trace: string | null;
}

interface Country {
  id: number;
  alpha2Code: string;
  name: string;
}

interface Gender {
  id: number;
  code: string;
  name: string;
}

interface DocumentType {
  id: number;
  code: string;
  name: string;
}

const Page = async () => {
  const [countries, genders, documentTypes] = await Promise.all([
    fetchCountries(),
    fetchGenders(),
    fetchDocumentTypes(),
  ]);

  const errors = [];

  if (!Array.isArray(countries)) {
    errors.push(countries as ProblemDetails);
  }

  if (!Array.isArray(genders)) {
    errors.push(genders as ProblemDetails);
  }

  if (!Array.isArray(documentTypes)) {
    errors.push(documentTypes as ProblemDetails);
  }

  if (errors.length) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        {errors.map((error, i) => (
          <ProblemDetailsAlert
            key={i}
            status={error.status}
            instance={error.instance}
            timestamp={error.timestamp}
            trace={error.trace}
            detail={error.detail}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <OnboardingDataProvider
        countries={countries as readonly Country[]}
        genders={genders as readonly Gender[]}
        documentTypes={documentTypes as readonly DocumentType[]}
      >
        <OnboardingWrapper />
      </OnboardingDataProvider>
    </div>
  );
};

export default Page;
