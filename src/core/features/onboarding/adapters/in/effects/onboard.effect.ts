import * as Effect from "effect/Effect";
import { z } from "zod";

import {
  onboardingFormZObject,
  OnboardingFormValues,
} from "@/features/onboarding/adapters/in/schemas/onboarding-form.schema";
import { ZodValidationError } from "@/errors/zod-validation-error";
import { ZodUnknownError } from "@/errors/zod-unknown-error";
import { OnboardServiceTag } from "@/features/onboarding/ports/in/onboard-service.tag";
import { defaultError, handleError } from "@/utils/error-handling";

export function onboardEffect(values: OnboardingFormValues) {
  return Effect.log().pipe(
    Effect.andThen(() =>
      Effect.gen(function* () {
        const parsedValues = yield* Effect.try({
          try: () => onboardingFormZObject.parse(values),
          catch: e => {
            if (e instanceof z.ZodError) {
              return new ZodValidationError({
                message: `Invalid input: ${e.errors.map(err => err.message).join(", ")}`,
              });
            }
            return new ZodUnknownError({ e });
          },
        });

        yield* (yield* OnboardServiceTag).onboardPerson({
          personIn: parsedValues.person,
          addressIn: parsedValues.address,
        });
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
    defaultError
  );
}
