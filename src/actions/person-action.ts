"use server";

import * as Effect from "effect/Effect";
import * as FiberRef from "effect/FiberRef";
import { currentRequestUrl, currentTraceId } from "@/lib/fiber-refs";
import {
  onboardingFormSchema,
  OnboardingFormValues,
} from "@/schemas/onboarding-form-schema";
import { z } from "zod";
import { ZodValidationError } from "@/errors/zod-validation-error";
import { ZodUnknownError } from "@/errors/zod-unknown-error";
import { PersonServiceTag } from "@/services/person-service-tag";
import { PersonServiceLive } from "@/services/person-service-live";
import { PersonRepositoryLive } from "@/repositories/person-repository-live";
import { DrizzleServiceLive } from "@/services/drizzle-service-live";
import { mapToProblemDetails } from "@/utils/problem-details-mapper";
import { Cause } from "effect";
import { headers } from "next/headers";

export async function onboardPerson(values: OnboardingFormValues) {
  const headersList = await headers();
  const traceId = headersList.get("x-trace-id");
  const requestUrl = headersList.get("x-request-url");

  const program = Effect.gen(function* () {
    yield* Effect.log(values);
    const parsedValues = yield* Effect.try({
      try: () => onboardingFormSchema.parse(values),
      catch: e => {
        if (e instanceof z.ZodError) {
          return new ZodValidationError({
            message: `Invalid input: ${e.errors.map(err => err.message).join(", ")}`,
          });
        }
        return new ZodUnknownError({ e });
      },
    });

    const personService = yield* PersonServiceTag;
    yield* personService.onboardPerson(parsedValues);
    yield* Effect.log();
    return;
  }).pipe(
    Effect.catchTag("ZodValidationError", _ZodValidationError =>
      Effect.gen(function* (_) {
        const traceId = yield* _(FiberRef.get(currentTraceId));
        const requestUrl = yield* _(FiberRef.get(currentRequestUrl));
        yield* Effect.logError(Cause.die(_ZodValidationError));

        return mapToProblemDetails(_ZodValidationError, 400, {
          requestUrl,
          traceId,
        });
      })
    ),
    Effect.catchTag(
      "PersonConstraintViolationError",
      _PersonConstraintViolationError =>
        Effect.gen(function* (_) {
          const traceId = yield* _(FiberRef.get(currentTraceId));
          const requestUrl = yield* _(FiberRef.get(currentRequestUrl));
          yield* Effect.logError(Cause.die(_PersonConstraintViolationError));

          return mapToProblemDetails(_PersonConstraintViolationError, 409, {
            requestUrl,
            traceId,
          });
        })
    ),
    Effect.catchAll(e =>
      Effect.gen(function* (_) {
        const traceId = yield* _(FiberRef.get(currentTraceId));
        const requestUrl = yield* _(FiberRef.get(currentRequestUrl));
        yield* Effect.logError(Cause.die(e));
        return mapToProblemDetails(e, 500, {
          requestUrl,
          traceId,
        });
      })
    ),
    Effect.provide(PersonServiceLive),
    Effect.provide(PersonRepositoryLive),
    Effect.provide(DrizzleServiceLive),
    Effect.locally(currentTraceId, traceId),
    Effect.locally(currentRequestUrl, requestUrl),
    Effect.withLogSpan("src/actions/person-actions.ts>onboardPerson()")
  );

  return Effect.runPromise(program);
}
