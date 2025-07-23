import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { PersonConstraintViolationError } from "@/errors/person-constraint-violation-error";
import { PersonIn } from "@/features/onboarding/schemas/person.schema";
import { ClerkUserIn } from "@/features/onboarding/schemas/clerk-user.schema";
import { AddressIn } from "@/features/onboarding/schemas/address.schema";

export class OnboardRepositoryTag extends Context.Tag("OnboardRepositoryTag")<
  OnboardRepositoryTag,
  {
    readonly onboardPerson: (
      personIn: PersonIn,
      clerkUserIn: ClerkUserIn,
      addressIn: AddressIn
    ) => Effect.Effect<
      void,
      DatabaseQueryError | PersonConstraintViolationError
    >;
  }
>() {}
