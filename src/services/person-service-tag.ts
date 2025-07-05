import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { OnboardingFormValues } from "@/schemas/onboarding-form-schema";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { ClerkCurrentUserNotFoundError } from "@/errors/clerk-current-user-not-found-error";
import { ClerkCurrentUserHookError } from "@/errors/clerk-current-user-hook-error";
import { ClerkClientHookError } from "@/errors/clerk-client-hook-error";
import { PersonConstraintViolationError } from "@/errors/person-constraint-violation-error";

export class PersonServiceTag extends Context.Tag("PersonServiceTag")<
  PersonServiceTag,
  {
    readonly onboardPerson: (
      onboardData: OnboardingFormValues
    ) => Effect.Effect<
      { id: number },
      | DatabaseQueryError
      | PersonConstraintViolationError
      | ClerkCurrentUserNotFoundError
      | ClerkCurrentUserHookError
      | ClerkClientHookError
    >;
  }
>() {}
