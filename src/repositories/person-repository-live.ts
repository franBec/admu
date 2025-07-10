import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { sql } from "drizzle-orm";
import { PersonRepositoryTag } from "@/repositories/person-repository-tag";
import { DrizzleServiceTag } from "@/services/drizzle-service-tag";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { PersonConstraintViolationError } from "@/errors/person-constraint-violation-error";
import { address, clerkUser, person } from "@/db/schema";

export const PersonRepositoryLive = Layer.effect(
  PersonRepositoryTag,
  Effect.gen(function* () {
    const { db } = yield* DrizzleServiceTag;

    return {
      onboardPerson: (personData, clerkUserData, addressData) =>
        Effect.log(personData, clerkUserData, addressData).pipe(
          Effect.andThen(() =>
            Effect.tryPromise<
              {
                id: number;
              },
              DatabaseQueryError | PersonConstraintViolationError
            >({
              try: () =>
                db.transaction(async tx => {
                  //clerkUser
                  await tx
                    .insert(clerkUser)
                    .values({
                      clerkId: clerkUserData.clerkId,
                      email: clerkUserData.email,
                      imageUrl: clerkUserData.imageUrl,
                    })
                    .onConflictDoUpdate({
                      target: clerkUser.clerkId,
                      set: {
                        email: clerkUserData.email,
                        imageUrl: clerkUserData.imageUrl,
                        updatedAt: sql`now()`,
                      },
                    });

                  //address
                  const [newAddress] = await tx
                    .insert(address)
                    .values(addressData)
                    .returning({ id: address.id });

                  //person
                  const personInsertData = {
                    givenName: personData.givenName,
                    familyName: personData.familyName,
                    gender: personData.gender,
                    birthDate: personData.birthDate,
                    nationality: personData.nationality,
                    documentType: personData.documentType,
                    documentNumber: personData.documentNumber,
                    phoneNumber: personData.phoneNumber,
                    addressId: newAddress.id,
                    clerkId: clerkUserData.clerkId,
                  };

                  const [newPerson] = await tx
                    .insert(person)
                    .values(personInsertData)
                    .returning({ id: person.id });

                  return newPerson;
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
            "src/repositories/person-repository-live.ts>PersonRepositoryLive>onboardPerson()"
          )
        ),
    };
  })
);
