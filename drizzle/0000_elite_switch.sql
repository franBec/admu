-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "clerk_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "clerk_user_clerk_id_key" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "address" (
	"id" serial PRIMARY KEY NOT NULL,
	"street" text NOT NULL,
	"number" text,
	"floor" text,
	"apartment" text,
	"city" text NOT NULL,
	"postal_code" text NOT NULL,
	"province" text NOT NULL,
	"country" char(2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "person" (
	"id" serial PRIMARY KEY NOT NULL,
	"given_name" text NOT NULL,
	"family_name" text NOT NULL,
	"full_name" text GENERATED ALWAYS AS (((given_name || ' '::text) || family_name)) STORED,
	"gender" text NOT NULL,
	"birth_date" date NOT NULL,
	"nationality" char(2),
	"document_type" text NOT NULL,
	"document_number" text NOT NULL,
	"phone_number" text,
	"address_id" integer NOT NULL,
	"clerk_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "person_document_type_code_document_number_key" UNIQUE("document_type","document_number"),
	CONSTRAINT "person_clerk_id_key" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."address"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_clerk_id_fkey" FOREIGN KEY ("clerk_id") REFERENCES "public"."clerk_user"("clerk_id") ON DELETE set null ON UPDATE no action;
*/