"use server";

import * as Effect from "effect/Effect";
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
      Effect.catchTag("ZodValidationError", _ZodValidationError => {
        return Effect.succeed(
          mapToProblemDetails(_ZodValidationError, 400, {
            requestUrl: "", //FiberRef.currentRequestUrl
            traceId: "", //FiberRef.currentTraceId
          })
        );
      }),
      Effect.catchAll(e => {
        return Effect.succeed(
          mapToProblemDetails(e, 500, {
            requestUrl: "", //FiberRef.currentRequestUrl
            traceId: "", //FiberRef.currentTraceId
          })
        );
      }),
      Effect.provide(PersonServiceLive),
      Effect.provide(PersonRepositoryLive),
      Effect.provide(DrizzleServiceLive)
    )
  );
}
