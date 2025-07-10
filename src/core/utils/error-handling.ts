import * as Effect from "effect/Effect";
import * as FiberRef from "effect/FiberRef";
import { currentRequestUrl, currentTraceId } from "@/lib/fiber-refs";
import * as Data from "effect/Data";
import { ZodValidationError } from "@/core/errors/zod-validation-error";
import { PersonConstraintViolationError } from "@/core/errors/person-constraint-violation-error";
import { UNEXPECTED_ERROR } from "@/core/utils/constants";

export const handleError = <
  E extends Data.TaggedError<string, { message?: string }>,
>(
  e: E,
  status: number
) =>
  Effect.gen(function* (_) {
    yield* Effect.logError(e);

    const problemDetails = {
      title: e._tag as string,
      status: status,
      instance: yield* _(FiberRef.get(currentRequestUrl)),
      timestamp: new Date().toISOString(),
      trace: yield* _(FiberRef.get(currentTraceId)),
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
  });

export const defaultError = <
  R,
  E extends Data.TaggedError<string, { message?: string }>,
  A,
>(
  effect: Effect.Effect<A, E, R>
) => effect.pipe(Effect.catchAll(e => handleError(e, 500)));
