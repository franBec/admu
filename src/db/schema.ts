import {
  pgTable,
  unique,
  serial,
  text,
  timestamp,
  char,
  foreignKey,
  date,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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

export const address = pgTable("address", {
  id: serial().primaryKey().notNull(),
  street: text().notNull(),
  number: text(),
  floor: text(),
  apartment: text(),
  city: text().notNull(),
  postalCode: text("postal_code").notNull(),
  province: text().notNull(),
  country: char({ length: 2 }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
});

export const person = pgTable(
  "person",
  {
    id: serial().primaryKey().notNull(),
    givenName: text("given_name").notNull(),
    familyName: text("family_name").notNull(),
    fullName: text("full_name").generatedAlwaysAs(
      sql`((given_name || ' '::text) || family_name)`
    ),
    gender: text().notNull(),
    birthDate: date("birth_date").notNull(),
    nationality: char({ length: 2 }),
    documentType: text("document_type").notNull(),
    documentNumber: text("document_number").notNull(),
    phoneNumber: text("phone_number"),
    addressId: integer("address_id").notNull(),
    clerkId: text("clerk_id").notNull(),
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
      columns: [table.addressId],
      foreignColumns: [address.id],
      name: "person_address_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.clerkId],
      foreignColumns: [clerkUser.clerkId],
      name: "person_clerk_id_fkey",
    }).onDelete("set null"),
    unique("person_document_type_code_document_number_key").on(
      table.documentType,
      table.documentNumber
    ),
    unique("person_clerk_id_key").on(table.clerkId),
  ]
);
