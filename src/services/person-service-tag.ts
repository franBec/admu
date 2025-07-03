import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { OnboardingFormValues } from "@/features/person/adapter/in/server-function/schema/onboarding-form-schema";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { ClerkCurrentUserNotFoundError } from "@/errors/clerk-current-user-not-found-error";
import { ClerkCurrentUserHookError } from "@/errors/clerk-current-user-hook-error";
import { ClerkClientHookError } from "@/errors/clerk-client-hook-error";

export class PersonServiceTag extends Context.Tag("PersonServiceTag")<
  PersonServiceTag,
  {
    readonly onboardPerson: (
      onboardData: OnboardingFormValues
    ) => Effect.Effect<
      { id: number },
      | DatabaseQueryError
      | ClerkCurrentUserNotFoundError
      | ClerkCurrentUserHookError
      | ClerkClientHookError
    >;
  }
>() {}
