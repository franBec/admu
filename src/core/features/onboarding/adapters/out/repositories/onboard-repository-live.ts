import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { sql } from "drizzle-orm";
import { OnboardRepositoryTag } from "@/features/onboarding/ports/out/onboard-repository-tag";
import { DrizzleServiceTag } from "@/services/drizzle-service-tag";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { PersonConstraintViolationError } from "@/errors/person-constraint-violation-error";
import { address, clerkUser, person } from "@/db/schema";

export const OnboardRepositoryLive = Layer.effect(
  OnboardRepositoryTag,
  Effect.gen(function* () {
    const { db } = yield* DrizzleServiceTag;

    return {
      onboardPerson: (personIn, clerkUserIn, addressIn) =>
        Effect.log(personIn, clerkUserIn, addressIn).pipe(
          Effect.andThen(() =>
            Effect.tryPromise<
              void,
              DatabaseQueryError | PersonConstraintViolationError
            >({
              try: () =>
                db.transaction(async tx => {
                  //clerkUser
                  await tx
                    .insert(clerkUser)
                    .values({
                      clerkId: clerkUserIn.clerkId,
                      email: clerkUserIn.email,
                      imageUrl: clerkUserIn.imageUrl,
                    })
                    .onConflictDoUpdate({
                      target: clerkUser.clerkId,
                      set: {
                        email: clerkUserIn.email,
                        imageUrl: clerkUserIn.imageUrl,
                        updatedAt: sql`now()`,
                      },
                    });

                  //address
                  const [newAddress] = await tx
                    .insert(address)
                    .values(addressIn)
                    .returning({ id: address.id });

                  //person
                  const personInsertData = {
                    givenName: personIn.givenName,
                    familyName: personIn.familyName,
                    gender: personIn.gender,
                    birthDate: personIn.birthDate.toISOString().split("T")[0],
                    nationality: personIn.nationality,
                    documentType: personIn.documentType,
                    documentNumber: personIn.documentNumber,
                    phoneNumber: personIn.phoneNumber,
                    addressId: newAddress.id,
                    clerkId: clerkUserIn.clerkId,
                  };

                  await tx
                    .insert(person)
                    .values(personInsertData)
                    .returning({ id: person.id });
                }),
              catch: e => {
                if (
                  (e as { cause?: { constraint?: string } }).cause
                    ?.constraint ===
                  "person_document_type_code_document_number_key"
                ) {
                  return new PersonConstraintViolationError({
                    message:
                      "A person with this document type and number already exists.",
                  });
                }
                return new DatabaseQueryError({ e });
              },
            })
          ),
          Effect.tap(response => Effect.log(response)),
          Effect.tapError(e => Effect.logError(e)),
          Effect.withLogSpan(
            "src/repositories/onboard-repository-live.ts>OnboardRepositoryLive>onboardPerson()"
          )
        ),
    };
  })
);
