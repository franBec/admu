import {
  pgTable,
  unique,
  serial,
  char,
  text,
  foreignKey,
  integer,
  timestamp,
  date,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const country = pgTable(
  "country",
  {
    id: serial().primaryKey().notNull(),
    alpha2Code: char("alpha_2_code", { length: 2 }).notNull(),
    name: text().notNull(),
  },
  table => [unique("country_alpha_2_code_key").on(table.alpha2Code)]
);

export const address = pgTable(
  "address",
  {
    id: serial().primaryKey().notNull(),
    street: text().notNull(),
    number: text(),
    floor: text(),
    apartment: text(),
    city: text().notNull(),
    postalCode: text("postal_code"),
    province: text(),
    countryId: integer("country_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [country.id],
      name: "address_country_id_fkey",
    }).onDelete("restrict"),
  ]
);

export const gender = pgTable(
  "gender",
  {
    id: serial().primaryKey().notNull(),
    code: text().notNull(),
    name: text().notNull(),
  },
  table => [unique("gender_code_key").on(table.code)]
);

export const person = pgTable(
  "person",
  {
    id: serial().primaryKey().notNull(),
    givenName: text("given_name").notNull(),
    familyName: text("family_name").notNull(),
    fullName: text("full_name").generatedAlwaysAs(
      sql`((given_name || ' '::text) || family_name)`
    ),
    genderId: integer("gender_id"),
    birthDate: date("birth_date").notNull(),
    nationalityId: integer("nationality_id"),
    documentTypeId: integer("document_type_id").notNull(),
    documentNumber: text("document_number").notNull(),
    phoneNumber: text("phone_number"),
    addressId: integer("address_id"),
    clerkId: text("clerk_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.genderId],
      foreignColumns: [gender.id],
      name: "person_gender_id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.nationalityId],
      foreignColumns: [country.id],
      name: "person_nationality_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.documentTypeId],
      foreignColumns: [documentType.id],
      name: "person_document_type_id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.addressId],
      foreignColumns: [address.id],
      name: "person_address_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.clerkId],
      foreignColumns: [clerkUser.clerkId],
      name: "person_clerk_id_fkey",
    }).onDelete("set null"),
    unique("person_document_type_id_document_number_key").on(
      table.documentTypeId,
      table.documentNumber
    ),
    unique("person_clerk_id_key").on(table.clerkId),
  ]
);

export const documentType = pgTable(
  "document_type",
  {
    id: serial().primaryKey().notNull(),
    code: text().notNull(),
    name: text().notNull(),
  },
  table => [unique("document_type_code_key").on(table.code)]
);

export const clerkUser = pgTable(
  "clerk_user",
  {
    id: serial().primaryKey().notNull(),
    clerkId: text("clerk_id").notNull(),
    email: text().notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  table => [unique("clerk_user_clerk_id_key").on(table.clerkId)]
);
