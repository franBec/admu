import { relations } from "drizzle-orm/relations";
import { gender, person, country, documentType, address, clerkUser } from "./schema";

export const personRelations = relations(person, ({one}) => ({
	gender: one(gender, {
		fields: [person.genderCode],
		references: [gender.code]
	}),
	country: one(country, {
		fields: [person.nationalityAlpha2Code],
		references: [country.alpha2Code]
	}),
	documentType: one(documentType, {
		fields: [person.documentTypeCode],
		references: [documentType.code]
	}),
	address: one(address, {
		fields: [person.addressId],
		references: [address.id]
	}),
	clerkUser: one(clerkUser, {
		fields: [person.clerkId],
		references: [clerkUser.clerkId]
	}),
}));

export const genderRelations = relations(gender, ({many}) => ({
	people: many(person),
}));

export const countryRelations = relations(country, ({many}) => ({
	people: many(person),
	addresses: many(address),
}));

export const documentTypeRelations = relations(documentType, ({many}) => ({
	people: many(person),
}));

export const addressRelations = relations(address, ({one, many}) => ({
	people: many(person),
	country: one(country, {
		fields: [address.countryAlpha2Code],
		references: [country.alpha2Code]
	}),
}));

export const clerkUserRelations = relations(clerkUser, ({many}) => ({
	people: many(person),
}));