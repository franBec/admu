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

  const validValues = {} as unknown as OnboardingFormValues;

  const mockParse = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockParse.mockClear();
  });

  it("should succeed on the happy path", async () => {
    mockOnboardPerson.mockReturnValue(Effect.succeed(undefined));
    mockParse.mockReturnValue(validValues);

    vi.doMock("@/utils/error-handling", () => ({ handleError, defaultError }));
    vi.doMock(
      "@/features/onboarding/adapters/in/actions/schemas/onboarding-form.schema",
      () => ({
        onboardingFormZObject: { parse: mockParse },
      })
    );

    const { onboardEffect } = await import("./onboard.effect");

    const program = onboardEffect(validValues).pipe(
      Effect.provideService(OnboardServiceTag, mockOnboardService)
    );

    const result = await Effect.runPromise(program);

    expect(result).toBeUndefined();
    expect(mockParse).toHaveBeenCalledWith(validValues);
    expect(mockOnboardPerson).toHaveBeenCalledWith({
      personIn: validValues.person,
      addressIn: validValues.address,
    });
    expect(handleError).not.toHaveBeenCalled();
  });

  it("should handle Zod validation errors", async () => {
    const zodError = new z.ZodError([]);
    mockParse.mockImplementation(() => {
      throw zodError;
    });

    vi.doMock("@/utils/error-handling", () => ({ handleError, defaultError }));
    vi.doMock(
      "@/features/onboarding/adapters/in/actions/schemas/onboarding-form.schema",
      () => ({
        onboardingFormZObject: { parse: mockParse },
      })
    );

    const { onboardEffect } = await import("./onboard.effect");

    const program = onboardEffect(validValues).pipe(
      Effect.provideService(OnboardServiceTag, mockOnboardService)
    );

    const result = await Effect.runPromise(program);

    expect(handleError).toHaveBeenCalledWith(
      expect.objectContaining({ _tag: "ZodValidationError" }),
      400
    );
    expect(result).toEqual({
      handled: true,
      error: expect.objectContaining({ _tag: "ZodValidationError" }),
      status: 400,
    });
    expect(mockOnboardPerson).not.toHaveBeenCalled();
  });

  it("should handle PersonConstraintViolationError from the service", async () => {
    const error = new PersonConstraintViolationError({ message: "" });
    mockOnboardPerson.mockReturnValue(Effect.fail(error));
    mockParse.mockReturnValue(validValues);

    vi.doMock("@/utils/error-handling", () => ({ handleError, defaultError }));
    vi.doMock(
      "@/features/onboarding/adapters/in/actions/schemas/onboarding-form.schema",
      () => ({
        onboardingFormZObject: { parse: mockParse },
      })
    );

    const { onboardEffect } = await import("./onboard.effect");

    const program = onboardEffect(validValues).pipe(
      Effect.provideService(OnboardServiceTag, mockOnboardService)
    );

    const result = await Effect.runPromise(program);

    expect(handleError).toHaveBeenCalledWith(error, 409);
    expect(result).toEqual({ handled: true, error, status: 409 });
  });

  it("should use defaultError for unhandled errors", async () => {
    const unhandledError = new Error("Something went wrong");
    mockOnboardPerson.mockReturnValue(Effect.fail(unhandledError));
    mockParse.mockReturnValue(validValues);

    vi.doMock("@/utils/error-handling", () => ({ handleError, defaultError }));
    vi.doMock(
      "@/features/onboarding/adapters/in/actions/schemas/onboarding-form.schema",
      () => ({
        onboardingFormZObject: { parse: mockParse },
      })
    );

    const { onboardEffect } = await import("./onboard.effect");

    const program = onboardEffect(validValues).pipe(
      Effect.provideService(OnboardServiceTag, mockOnboardService)
    );

    const result = await Effect.runPromise(program);

    expect(handleError).not.toHaveBeenCalled();
    expect(result).toEqual({
      handled: true,
      error: "default",
      cause: unhandledError,
    });
  });
});
