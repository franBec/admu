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
    fields: [address.countryAlpha2Code],
    references: [country.alpha2Code],
  }),
  people: many(person),
}));

export const countryRelations = relations(country, ({ many }) => ({
  addresses: many(address),
  people: many(person),
}));

export const personRelations = relations(person, ({ one }) => ({
  gender: one(gender, {
    fields: [person.genderCode],
    references: [gender.code],
  }),
  country: one(country, {
    fields: [person.nationalityAlpha2Code],
    references: [country.alpha2Code],
  }),
  documentType: one(documentType, {
    fields: [person.documentTypeCode],
    references: [documentType.code],
  }),
  address: one(address, {
    fields: [person.addressId],
    references: [address.id],
  }),
  clerkUser: one(clerkUser, {
    fields: [person.clerkId],
    references: [clerkUser.clerkId],
  }),
}));

export const genderRelations = relations(gender, ({ many }) => ({
  people: many(person),
}));

export const documentTypeRelations = relations(documentType, ({ many }) => ({
  people: many(person),
}));

export const clerkUserRelations = relations(clerkUser, ({ many }) => ({
  people: many(person),
}));
