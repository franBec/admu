import { relations } from "drizzle-orm/relations";
import {
  country,
  address,
  gender,
  person,
  documentType,
  clerkUser,
} from "./schema";

export const addressRelations = relations(address, ({ one, many }) => ({
  country: one(country, {
    fields: [address.countryId],
    references: [country.id],
  }),
  people: many(person),
}));

export const countryRelations = relations(country, ({ many }) => ({
  addresses: many(address),
  people: many(person),
}));

export const personRelations = relations(person, ({ one, many }) => ({
  gender: one(gender, {
    fields: [person.genderId],
    references: [gender.id],
  }),
  country: one(country, {
    fields: [person.nationalityId],
    references: [country.id],
  }),
  documentType: one(documentType, {
    fields: [person.documentTypeId],
    references: [documentType.id],
  }),
  address: one(address, {
    fields: [person.addressId],
    references: [address.id],
  }),
  clerkUsers: many(clerkUser),
}));

export const genderRelations = relations(gender, ({ many }) => ({
  people: many(person),
}));

export const documentTypeRelations = relations(documentType, ({ many }) => ({
  people: many(person),
}));

export const clerkUserRelations = relations(clerkUser, ({ one }) => ({
  person: one(person, {
    fields: [clerkUser.personId],
    references: [person.id],
  }),
}));
