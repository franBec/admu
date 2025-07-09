import * as Data from "effect/Data";
import { ZodValidationError } from "@/errors/zod-validation-error";
import { PersonConstraintViolationError } from "@/errors/person-constraint-violation-error";
import { UNEXPECTED_ERROR } from "@/utils/constants";

// @ts-expect-error: This is a generic error handler, and the exact type of 'e' can vary. We are only interested in the '_tag' property.
export const handle = <
  T extends Data.TaggedError<string, { message?: string }>,
>(
  e: T,
  status: number,
  requestContext: { requestUrl: string | null; traceId: string | null }
) => {
  const problemDetails = {
    title: e._tag as string,
    status: status,
    instance: requestContext?.requestUrl,
    timestamp: new Date().toISOString(),
    trace: requestContext?.traceId,
  };

  switch (e._tag) {
    case "PersonConstraintViolationError":
      return {
        ...problemDetails,
        detail: (e as PersonConstraintViolationError).message,
      };
    case "ZodValidationError":
      return {
        ...problemDetails,
        detail: (e as ZodValidationError).message,
      };
    default:
      return {
        ...problemDetails,
        detail: UNEXPECTED_ERROR,
      };
  }
};
