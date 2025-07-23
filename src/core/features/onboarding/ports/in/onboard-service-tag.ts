import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { ClerkCurrentUserNotFoundError } from "@/errors/clerk-current-user-not-found-error";
import { ClerkNextjsServerError } from "@/errors/clerk-nextjs-server-error";
import { PersonConstraintViolationError } from "@/errors/person-constraint-violation-error";
import { ClerkUserDoesNotHaveEmailAddress } from "@/errors/clerk-user-does-not-have-email-address";
import { PersonIn } from "@/features/onboarding/schemas/person.schema";
import { AddressIn } from "@/features/onboarding/schemas/address.schema";

export class OnboardServiceTag extends Context.Tag("OnboardServiceTag")<
  OnboardServiceTag,
  {
    readonly onboardPerson: (
      personIn: PersonIn,
      addressIn: AddressIn
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
