import { pgTable, unique, serial, text, char, foreignKey, timestamp, date, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const gender = pgTable("gender", {
	id: serial().primaryKey().notNull(),
	code: text().notNull(),
	name: text().notNull(),
}, (table) => [
	unique("gender_code_key").on(table.code),
	unique("gender_name_key").on(table.name),
]);

export const country = pgTable("country", {
	id: serial().primaryKey().notNull(),
	alpha2Code: char("alpha_2_code", { length: 2 }).notNull(),
	name: text().notNull(),
}, (table) => [
	unique("country_alpha_2_code_key").on(table.alpha2Code),
	unique("country_name_key").on(table.name),
]);

export const address = pgTable("address", {
	id: serial().primaryKey().notNull(),
	street: text().notNull(),
	number: text(),
	floor: text(),
	apartment: text(),
	city: text().notNull(),
	postalCode: text("postal_code").notNull(),
	province: text().notNull(),
	countryAlpha2Code: char("country_alpha_2_code", { length: 2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.countryAlpha2Code],
			foreignColumns: [country.alpha2Code],
			name: "address_country_alpha_2_code_fkey"
		}).onDelete("restrict"),
]);

export const person = pgTable("person", {
	id: serial().primaryKey().notNull(),
	givenName: text("given_name").notNull(),
	familyName: text("family_name").notNull(),
	fullName: text("full_name").generatedAlwaysAs(sql`((given_name || ' '::text) || family_name)`),
	genderCode: text("gender_code").notNull(),
	birthDate: date("birth_date").notNull(),
	nationalityAlpha2Code: char("nationality_alpha_2_code", { length: 2 }),
	documentTypeCode: text("document_type_code").notNull(),
	documentNumber: text("document_number").notNull(),
	phoneNumber: text("phone_number"),
	addressId: integer("address_id").notNull(),
	clerkId: text("clerk_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.genderCode],
			foreignColumns: [gender.code],
			name: "person_gender_code_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.nationalityAlpha2Code],
			foreignColumns: [country.alpha2Code],
			name: "person_nationality_alpha_2_code_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.documentTypeCode],
			foreignColumns: [documentType.code],
			name: "person_document_type_code_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [address.id],
			name: "person_address_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.clerkId],
			foreignColumns: [clerkUser.clerkId],
			name: "person_clerk_id_fkey"
		}).onDelete("set null"),
	unique("person_document_type_code_document_number_key").on(table.documentTypeCode, table.documentNumber),
	unique("person_clerk_id_key").on(table.clerkId),
]);

export const documentType = pgTable("document_type", {
	id: serial().primaryKey().notNull(),
	code: text().notNull(),
	name: text().notNull(),
}, (table) => [
	unique("document_type_code_key").on(table.code),
	unique("document_type_name_key").on(table.name),
]);

export const clerkUser = pgTable("clerk_user", {
	id: serial().primaryKey().notNull(),
	clerkId: text("clerk_id").notNull(),
	email: text().notNull(),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("clerk_user_clerk_id_key").on(table.clerkId),
]);
