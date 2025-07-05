"use server";

import * as Effect from "effect/Effect";
import * as FiberRef from "effect/FiberRef";
import {
  currentRequestUrl,
  currentTraceId,
} from "@/lib/fiber-refs";
import {
  onboardingFormSchema,
  OnboardingFormValues,
} from "@/features/person/adapter/in/server-function/schema/onboarding-form-schema";
import { z } from "zod";
import { ZodValidationError } from "@/errors/zod-validation-error";
import { ZodUnknownError } from "@/errors/zod-unknown-error";
import { PersonServiceTag } from "@/services/person-service-tag";
import { PersonServiceLive } from "@/services/person-service-live";
import { PersonRepositoryLive } from "@/repositories/person-repository-live";
import { DrizzleServiceLive } from "@/services/drizzle-service-live";
import { mapToProblemDetails } from "@/types/problem-details";

export async function onboardPerson(values: OnboardingFormValues) {
  return Effect.runPromise(
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

      const personService = yield* PersonServiceTag;
      yield* personService.onboardPerson(parsedValues);
      return;
    }).pipe(
      Effect.catchTag("ZodValidationError", _ZodValidationError =>
        Effect.gen(function* (_) {
          const traceId = yield* _(FiberRef.get(currentTraceId));
          const requestUrl = yield* _(FiberRef.get(currentRequestUrl));

          return mapToProblemDetails(_ZodValidationError, 400, {
            requestUrl,
            traceId,
          });
        })
      ),

      Effect.catchAll(e =>
        Effect.gen(function* (_) {
          const traceId = yield* _(FiberRef.get(currentTraceId));
          const requestUrl = yield* _(FiberRef.get(currentRequestUrl));

          return mapToProblemDetails(e, 500, {
            requestUrl,
            traceId,
          });
        })
      ),
      Effect.provide(PersonServiceLive),
      Effect.provide(PersonRepositoryLive),
      Effect.provide(DrizzleServiceLive)
    )
  );
}
