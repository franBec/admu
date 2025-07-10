import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { OnboardingFormValues } from "@/core/schemas/onboarding-form-schema";
import { DatabaseQueryError } from "@/core/errors/database-query-error";
import { ClerkCurrentUserNotFoundError } from "@/core/errors/clerk-current-user-not-found-error";
import { ClerkNextjsServerError } from "@/core/errors/clerk-nextjs-server-error";
import { PersonConstraintViolationError } from "@/core/errors/person-constraint-violation-error";
import { ClerkUserDoesNotHaveEmailAddress } from "@/core/errors/clerk-user-does-not-have-email-address";

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
      | ClerkNextjsServerError
      | ClerkUserDoesNotHaveEmailAddress
    >;
  }
>() {}
