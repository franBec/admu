import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { sql } from "drizzle-orm";
import { PersonRepositoryTag } from "@/repositories/person-repository-tag";
import { DrizzleServiceTag } from "@/services/drizzle-service-tag";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { address, clerkUser, person } from "@/db/schema";

export const PersonRepositoryLive = Layer.effect(
  PersonRepositoryTag,
  Effect.gen(function* () {
    const { db } = yield* DrizzleServiceTag;

    return {
      onboardPerson: (personData, clerkUserData, addressData) =>
        Effect.tryPromise({
          try: () =>
            db.transaction(async tx => {
              //clerkUser
              Effect.tryPromise({
                try: () =>
                  tx
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
                    }),
                catch: e => new DatabaseQueryError({ e }),
              }).pipe(Effect.runSync);

              //address
              const [newAddress] = Effect.tryPromise({
                try: () =>
                  tx
                    .insert(address)
                    .values(addressData)
                    .returning({ id: address.id }),
                catch: e => new DatabaseQueryError({ e }),
              }).pipe(Effect.runSync);

              //person
              const personInsertData = {
                givenName: personData.givenName,
                familyName: personData.familyName,
                genderId: personData.genderId,
                birthDate: personData.birthDate,
                nationalityId: personData.nationalityId,
                documentTypeId: personData.documentTypeId,
                documentNumber: personData.documentNumber,
                phoneNumber: personData.phoneNumber,
                addressId: newAddress.id,
                clerkId: clerkUserData.clerkId,
              };

              const [newPerson] = Effect.tryPromise({
                try: () =>
                  tx
                    .insert(person)
                    .values(personInsertData)
                    .returning({ id: person.id }),
                catch: e => new DatabaseQueryError({ e }),
              }).pipe(Effect.runSync);

              return newPerson;
            }),
          catch: e => new DatabaseQueryError({ e }),
        }),
    };
  })
);
