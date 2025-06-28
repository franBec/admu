import { db } from "@/db";
import {
  country,
  gender,
  documentType,
  person,
  address,
  clerkUser,
} from "@/db/schema";
import { sql } from "drizzle-orm";

export type Country = typeof country.$inferSelect;
export type Gender = typeof gender.$inferSelect;
export type DocumentType = typeof documentType.$inferSelect;
export type PersonInsert = typeof person.$inferInsert;
export type AddressInsert = typeof address.$inferInsert;
export type ClerkUserInsert = typeof clerkUser.$inferInsert;

export type PersonOnboardData = Omit<
  PersonInsert,
  "id" | "fullName" | "createdAt" | "updatedAt" | "addressId" | "clerkId"
>;

export type AddressOnboardData = Omit<
  AddressInsert,
  "id" | "createdAt" | "updatedAt"
>;

export type ClerkUserOnboardInput = Pick<
  ClerkUserInsert,
  "clerkId" | "email" | "imageUrl"
>;

export async function getCountries() {
  return db.select().from(country);
}

export async function getGenders() {
  return db.select().from(gender);
}

export async function getDocumentTypes() {
  return db.select().from(documentType);
}

export async function onboardPerson(
  personData: PersonOnboardData,
  clerkUserData: ClerkUserOnboardInput,
  addressData?: AddressOnboardData
) {
  return db.transaction(async tx => {
    try {
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
    } catch (error) {
      console.error("Error upserting clerk user:", error);
      throw new Error(
        `Failed to onboard person: could not manage clerk user record.`
      );
    }

    let newAddressId: number | undefined;
    if (addressData) {
      const [newAddress] = await tx
        .insert(address)
        .values(addressData)
        .returning({ id: address.id });

      if (!newAddress) {
        throw new Error("Failed to create address during onboarding.");
      }
      newAddressId = newAddress.id;
    }

    const personInsertData: Omit<
      PersonInsert,
      "id" | "fullName" | "createdAt" | "updatedAt"
    > = {
      givenName: personData.givenName,
      familyName: personData.familyName,
      genderId: personData.genderId,
      birthDate: personData.birthDate,
      nationalityId: personData.nationalityId,
      documentTypeId: personData.documentTypeId,
      documentNumber: personData.documentNumber,
      phoneNumber: personData.phoneNumber,
      addressId: newAddressId,
      clerkId: clerkUserData.clerkId,
    };

    const [newPerson] = await tx
      .insert(person)
      .values(personInsertData)
      .returning({ id: person.id });

    if (!newPerson) {
      throw new Error("Failed to create person record during onboarding.");
    }

    return newPerson;
  });
}
