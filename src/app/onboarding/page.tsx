import { OnboardingWrapper } from "@/app/onboarding/_components/onboarding-wrapper";
import {
  getCountries,
  getDocumentTypes,
  getGenders,
} from "@/features/person/adapter/out/drizzle/person-repository-impl";

const Page = async () => {
  const [countries, genders, documentTypes] = await Promise.all([
    getCountries(),
    getGenders(),
    getDocumentTypes(),
  ]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <OnboardingWrapper
        countries={countries}
        genders={genders}
        documentTypes={documentTypes}
      />
    </div>
  );
};

export default Page;
