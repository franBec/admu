import { describe, it, expect, vi, beforeEach } from "vitest";
import * as Effect from "effect/Effect";
import { OnboardServiceTag } from "@/features/onboarding/ports/in/onboard-service.tag";
import { OnboardingFormValues } from "@/features/onboarding/adapters/in/schemas/onboarding-form.schema";
import { PersonConstraintViolationError } from "@/errors/person-constraint-violation-error";
import { z } from "zod";
import { PersonIn } from "@/features/onboarding/schemas/person.schema";
import { AddressIn } from "@/features/onboarding/schemas/address.schema";
import { ZodIssue } from "zod";

describe("onboardEffect", () => {
  const handleError = vi.fn((error, status) => {
    return Effect.fail({
      title: error._tag,
      status: status,
      instance: null,
      timestamp: new Date().toISOString(),
      trace: null,
      detail: error.message,
    });
  });
  const defaultError = (self: Effect.Effect<any>) =>
    Effect.catchAll(self, e =>
      Effect.succeed({ handled: true, error: "default", cause: e })
    );
  const mockOnboardPerson = vi.fn();
  const mockOnboardService = {
    onboardPerson: mockOnboardPerson,
  };
  const validValues = {
    person: {} as unknown as PersonIn,
    address: {} as unknown as AddressIn,
  } as unknown as OnboardingFormValues;
  const mockParse = vi.fn();

  async function setup() {
    vi.doMock("@/utils/error-handling", () => ({ handleError, defaultError }));
    vi.doMock(
      "@/features/onboarding/adapters/in/schemas/onboarding-form.schema",
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
        {
          message: "error 1",
        } as unknown as ZodIssue,
        {
          message: "error 2",
        } as unknown as ZodIssue,
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
      error: "default",
      cause: expect.objectContaining({
        title: "ZodValidationError",
        status: 400,
        instance: null,
        timestamp: expect.any(String),
        trace: null,
        detail: "Invalid input: error 1, error 2",
      }),
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
    expect(result).toEqual({
      handled: true,
      error: "default",
      cause: expect.objectContaining({
        title: "PersonConstraintViolationError",
        status: 409,
        instance: null,
        timestamp: expect.any(String),
        trace: null,
        detail: "",
      }),
    });
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
