import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { sql } from "drizzle-orm";
import { OnboardRepositoryTag } from "@/features/onboarding/ports/out/onboard-repository-tag";
import { DrizzleServiceTag } from "@/services/drizzle-service-tag";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { PersonConstraintViolationError } from "@/errors/person-constraint-violation-error";
import { address, clerkUser, person } from "@/db/schema";

const label =
  "src/core/features/onboarding/adapters/out/repositories/onboard-repository-live.ts>OnboardRepositoryLive>onboardPerson()";

export const OnboardRepositoryLive = Layer.effect(
  OnboardRepositoryTag,
  Effect.gen(function* () {
    const { db } = yield* DrizzleServiceTag;

    return {
      onboardPerson: data =>
        Effect.log(data).pipe(
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
                      clerkId: data.clerkUserIn.clerkId,
                      email: data.clerkUserIn.email,
                      imageUrl: data.clerkUserIn.imageUrl,
                    })
                    .onConflictDoUpdate({
                      target: clerkUser.clerkId,
                      set: {
                        email: data.clerkUserIn.email,
                        imageUrl: data.clerkUserIn.imageUrl,
                        updatedAt: sql`now()`,
                      },
                    });

                  //address
                  const [newAddress] = await tx
                    .insert(address)
                    .values(data.addressIn)
                    .returning({ id: address.id });

                  //person
                  const personInsertData = {
                    givenName: data.personIn.givenName,
                    familyName: data.personIn.familyName,
                    gender: data.personIn.gender,
                    birthDate: data.personIn.birthDate
                      .toISOString()
                      .split("T")[0],
                    nationality: data.personIn.nationality,
                    documentType: data.personIn.documentType,
                    documentNumber: data.personIn.documentNumber,
                    phoneNumber: data.personIn.phoneNumber,
                    addressId: newAddress.id,
                    clerkId: data.clerkUserIn.clerkId,
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
          Effect.withLogSpan(label)
        ),
    };
  })
);
