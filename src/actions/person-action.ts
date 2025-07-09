"use server";

import * as Effect from "effect/Effect";

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
import { defaultError, handleError } from "@/utils/error-handling";
import { headers } from "next/headers";
import { ClerkServiceLive } from "@/services/clerk-service-live";

export async function onboardPerson(values: OnboardingFormValues) {
  const headersList = await headers();
  const traceId = headersList.get("x-trace-id");
  const requestUrl = headersList.get("x-request-url");

  const program = Effect.log().pipe(
    Effect.andThen(() =>
      Effect.gen(function* () {
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

        yield* (yield* PersonServiceTag).onboardPerson(parsedValues);
        return;
      })
    ),
    Effect.tap(() => Effect.log()),
    Effect.catchTag("ZodValidationError", _ZodValidationError =>
      handleError(_ZodValidationError, 400)
    ),
    Effect.catchTag(
      "PersonConstraintViolationError",
      _PersonConstraintViolationError =>
        handleError(_PersonConstraintViolationError, 409)
    ),
    defaultError,
    Effect.provide(PersonServiceLive),
    Effect.provide(ClerkServiceLive),
    Effect.provide(PersonRepositoryLive),
    Effect.provide(DrizzleServiceLive),
    Effect.locally(currentTraceId, traceId),
    Effect.locally(currentRequestUrl, requestUrl),
    Effect.annotateLogs("traceId", traceId),
    Effect.annotateLogs("requestUrl", requestUrl),
    Effect.withLogSpan("src/actions/person-action.ts>onboardPerson()")
  );

  return Effect.runPromise(program);
}
