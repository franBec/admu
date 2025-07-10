import { relations } from "drizzle-orm/relations";
import { address, person, clerkUser } from "./schema";

export const personRelations = relations(person, ({ one }) => ({
  address: one(address, {
    fields: [person.addressId],
    references: [address.id],
  }),
  clerkUser: one(clerkUser, {
    fields: [person.clerkId],
    references: [clerkUser.clerkId],
  }),
}));

export const addressRelations = relations(address, ({ many }) => ({
  people: many(person),
}));

export const clerkUserRelations = relations(clerkUser, ({ many }) => ({
  people: many(person),
}));
