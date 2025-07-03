import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { address, clerkUser, person } from "@/db/schema";

export type PersonOnboardData = Omit<
  typeof person.$inferInsert,
  "id" | "fullName" | "createdAt" | "updatedAt"
>;

export type AddressOnboardData = Omit<
  typeof address.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;

export type ClerkUserOnboardData = Pick<
  typeof clerkUser.$inferInsert,
  "clerkId" | "email" | "imageUrl"
>;
export class PersonRepositoryTag extends Context.Tag("PersonRepositoryTag")<
  PersonRepositoryTag,
  {
    readonly onboardPerson: (
      personData: PersonOnboardData,
      clerkUserData: ClerkUserOnboardData,
      addressData: AddressOnboardData
    ) => Effect.Effect<{ id: number }, DatabaseQueryError>;
  }
>() {}
