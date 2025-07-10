"use client";

import React, { createContext, useContext, ReactNode } from "react";

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

interface OnboardingDataContextType {
  countries: readonly Country[];
  genders: readonly Gender[];
  documentTypes: readonly DocumentType[];
}

const OnboardingDataContext = createContext<
  OnboardingDataContextType | undefined
>(undefined);

export const useOnboardingData = () => {
  const context = useContext(OnboardingDataContext);
  if (context === undefined) {
    throw new Error(
      "useOnboardingData must be used within an OnboardingDataProvider"
    );
  }
  return context;
};

interface OnboardingDataProviderProps {
  children: ReactNode;
  countries: readonly Country[];
  genders: readonly Gender[];
  documentTypes: readonly DocumentType[];
}

export const OnboardingDataProvider: React.FC<OnboardingDataProviderProps> = ({
  children,
  countries,
  genders,
  documentTypes,
}) => {
  return (
    <OnboardingDataContext.Provider
      value={{ countries, genders, documentTypes }}
    >
      {children}
    </OnboardingDataContext.Provider>
  );
};
