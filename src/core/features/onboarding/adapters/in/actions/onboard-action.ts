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
import { OnboardServiceTag } from "@/features/onboarding/ports/in/onboard-service-tag";
import { OnboardServiceLive } from "@/features/onboarding/onboard-service-live";
import { OnboardRepositoryLive } from "@/features/onboarding/adapters/out/repositories/onboard-repository-live";
import { DrizzleServiceLive } from "@/services/drizzle-service-live";
import { defaultError, handleError } from "@/utils/error-handling";
import { headers } from "next/headers";
import { ClerkServiceLive } from "@/services/clerk-service-live";
import { HEADER_REQUEST_URL, HEADER_TRACE_ID } from "@/utils/constants";

export async function onboard(values: OnboardingFormValues) {
  const headersList = await headers();
  const traceId = headersList.get(HEADER_TRACE_ID);
  const requestUrl = headersList.get(HEADER_REQUEST_URL);

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

        yield* (yield* OnboardServiceTag).onboardPerson(parsedValues);
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
    Effect.provide(OnboardServiceLive),
    Effect.provide(ClerkServiceLive),
    Effect.provide(OnboardRepositoryLive),
    Effect.provide(DrizzleServiceLive),
    Effect.locally(currentTraceId, traceId),
    Effect.locally(currentRequestUrl, requestUrl),
    Effect.annotateLogs("traceId", traceId),
    Effect.annotateLogs("requestUrl", requestUrl),
    Effect.withLogSpan("src/actions/onboard-action.ts>onboardPerson()")
  );

  return Effect.runPromise(program);
}
