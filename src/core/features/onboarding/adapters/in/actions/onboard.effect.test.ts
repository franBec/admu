import { describe, it, expect, vi, beforeEach } from "vitest";
import * as Effect from "effect/Effect";
import { OnboardServiceTag } from "@/features/onboarding/ports/in/onboard-service.tag";
import { OnboardingFormValues } from "@/features/onboarding/adapters/in/actions/schemas/onboarding-form.schema";
import { PersonConstraintViolationError } from "@/errors/person-constraint-violation-error";
import { z } from "zod";

describe("onboardEffect", () => {
  const handleError = vi.fn((error, status) =>
    Effect.succeed({ handled: true, error, status })
  );
  const defaultError = (self: Effect.Effect<any>) =>
    Effect.catchAll(self, e =>
      Effect.succeed({ handled: true, error: "default", cause: e })
    );
  const mockOnboardPerson = vi.fn();
  const mockOnboardService = {
    onboardPerson: mockOnboardPerson,
  };
  const validValues: OnboardingFormValues = {
    person: {
      givenName: "John",
      familyName: "Doe",
      gender: "Male",
      birthDate: new Date(),
      nationality: "US",
      documentType: "Passport",
      documentNumber: "12345",
      phoneNumber: "123-456-7890",
    },
    address: {
      streetAddress: "123 Main St",
      streetAddress2: "Apt 1",
      city: "Anytown",
      state: "Anystate",
      postalCode: "12345",
      country: "US",
    },
  };
  const mockParse = vi.fn();

  async function setup() {
    vi.doMock("@/utils/error-handling", () => ({ handleError, defaultError }));
    vi.doMock(
      "@/features/onboarding/adapters/in/actions/schemas/onboarding-form.schema",
      () => ({
        onboardingFormZObject: { parse: mockParse },
      })
    );
    
    const { onboardEffect } = await import("./onboard.effect");
    return { onboardEffect };
  }

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockParse.mockClear();
  });

  it("should succeed", async () => {
    mockOnboardPerson.mockReturnValue(Effect.succeed(undefined));
    mockParse.mockReturnValue(validValues);

    const { onboardEffect } = await setup();
    const result = await Effect.runPromise(
      onboardEffect(validValues).pipe(
        Effect.provideService(OnboardServiceTag, mockOnboardService)
      )
    );

    expect(result).toBeUndefined();
    expect(mockParse).toHaveBeenCalledWith(validValues);
    expect(mockOnboardPerson).toHaveBeenCalledWith({
      personIn: validValues.person,
      addressIn: validValues.address,
    });
    expect(handleError).not.toHaveBeenCalled();
  });

  it("should handle Zod validation errors", async () => {
    mockParse.mockImplementation(() => {
      throw new z.ZodError([
        { message: "error 1", path: ["field1"], code: "invalid_type" },
        { message: "error 2", path: ["field2"], code: "invalid_type" },
      ]);
    });

    const { onboardEffect } = await setup();
    const result = await Effect.runPromise(
      onboardEffect(validValues).pipe(
        Effect.provideService(OnboardServiceTag, mockOnboardService)
      )
    );

    expect(handleError).toHaveBeenCalledWith(
      expect.objectContaining({
        _tag: "ZodValidationError",
        message: "Invalid input: error 1, error 2",
      }),
      400
    );
    expect(result).toEqual({
      handled: true,
      error: expect.objectContaining({
        _tag: "ZodValidationError",
        message: "Invalid input: error 1, error 2",
      }),
      status: 400,
    });
    expect(mockOnboardPerson).not.toHaveBeenCalled();
  });

  it("should handle PersonConstraintViolationError", async () => {
    const error = new PersonConstraintViolationError({ message: "" });
    mockOnboardPerson.mockReturnValue(Effect.fail(error));
    mockParse.mockReturnValue(validValues);

    const { onboardEffect } = await setup();
    const result = await Effect.runPromise(
      onboardEffect(validValues).pipe(
        Effect.provideService(OnboardServiceTag, mockOnboardService)
      )
    );

    expect(handleError).toHaveBeenCalledWith(error, 409);
    expect(result).toEqual({ handled: true, error, status: 409 });
  });

  it("should use defaultError for unhandled errors", async () => {
    const unhandledError = new Error("Something went wrong");
    mockOnboardPerson.mockReturnValue(Effect.fail(unhandledError));
    mockParse.mockReturnValue(validValues);

    const { onboardEffect } = await setup();
    const result = await Effect.runPromise(
      onboardEffect(validValues).pipe(
        Effect.provideService(OnboardServiceTag, mockOnboardService)
      )
    );

    expect(handleError).not.toHaveBeenCalled();
    expect(result).toEqual({
      handled: true,
      error: "default",
      cause: unhandledError,
    });
  });

  it("should handle Zod unknown errors", async () => {
    const error = new Error("not a zod error");
    mockParse.mockImplementation(() => {
      throw error;
    });

    const { onboardEffect } = await setup();
    const result = await Effect.runPromise(
      onboardEffect(validValues).pipe(
        Effect.provideService(OnboardServiceTag, mockOnboardService)
      )
    );

    expect(handleError).not.toHaveBeenCalled();
    expect(result).toEqual({
      handled: true,
      error: "default",
      cause: expect.objectContaining({
        _tag: "ZodUnknownError",
        e: error,
      }),
    });
    expect(mockOnboardPerson).not.toHaveBeenCalled();
  });
});