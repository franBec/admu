import * as Data from "effect/Data";
import { ZodValidationError } from "@/errors/zod-validation-error";

// @ts-ignore
export const mapToProblemDetails = <T>(
  e: T extends typeof Data.TaggedError,
  status: number,
  requestContext: { requestUrl?: string; traceId?: string }
) => {
  const problemDetails = {
    title: e._tag,
    status: status,
    instance: requestContext?.requestUrl,
    timestamp: new Date().toISOString(),
    trace: requestContext?.traceId,
  };

  switch (e._tag) {
    case "ZodValidationError":
      return {
        ...problemDetails,
        detail: (e as ZodValidationError).message
      };
    default:
      return {
        ...problemDetails,
        detail: `An unexpected internal error occurred. Please try again later`,
      };
  }
};
