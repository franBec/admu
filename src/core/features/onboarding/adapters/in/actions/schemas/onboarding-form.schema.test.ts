import { describe, it, expect } from "vitest";
import { onboardingFormZObject } from "./onboarding-form.schema";
import { ZodError } from "zod";

describe("onboardingFormZObject", () => {
  const validPersonData = {
    givenName: "John",
    familyName: "Doe",
    gender: "Male",
    birthDate: "1990-01-01",
    nationality: "US",
    documentType: "Passport",
    documentNumber: "12345",
    email: "john.doe@example.com",
    phoneNumber: "123-456-7890",
  };

  const validAddressData = {
    street: "123 Main St",
    number: "Apt 1",
    floor: "1",
    apartment: "101",
    city: "Anytown",
    postalCode: "90210",
    province: "CA",
    country: "US",
  };

  it("should validate a valid onboarding form object", () => {
    const validFormData = {
      person: validPersonData,
      address: validAddressData,
    };
    const result = onboardingFormZObject.safeParse(validFormData);
    expect(result.success).toBe(true);
  });
});
