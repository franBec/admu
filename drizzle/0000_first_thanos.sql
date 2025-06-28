-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "country" (
	"id" serial PRIMARY KEY NOT NULL,
	"alpha_2_code" char(2) NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "country_alpha_2_code_key" UNIQUE("alpha_2_code")
);
--> statement-breakpoint
CREATE TABLE "address" (
	"id" serial PRIMARY KEY NOT NULL,
	"street" text NOT NULL,
	"number" text,
	"floor" text,
	"apartment" text,
	"city" text NOT NULL,
	"postal_code" text,
	"province" text,
	"country_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gender" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "gender_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "person" (
	"id" serial PRIMARY KEY NOT NULL,
	"given_name" text NOT NULL,
	"family_name" text NOT NULL,
	"full_name" text GENERATED ALWAYS AS (((given_name || ' '::text) || family_name)) STORED,
	"gender_id" integer,
	"birth_date" date NOT NULL,
	"nationality_id" integer,
	"document_type_id" integer NOT NULL,
	"document_number" text NOT NULL,
	"phone_number" text,
	"address_id" integer,
	"clerk_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "person_document_type_id_document_number_key" UNIQUE("document_type_id","document_number"),
	CONSTRAINT "person_clerk_id_key" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "document_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "document_type_code_key" UNIQUE("code")
);
--> statement-breakpoint
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
ALTER TABLE "address" ADD CONSTRAINT "address_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."country"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_gender_id_fkey" FOREIGN KEY ("gender_id") REFERENCES "public"."gender"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_nationality_id_fkey" FOREIGN KEY ("nationality_id") REFERENCES "public"."country"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_type"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."address"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_clerk_id_fkey" FOREIGN KEY ("clerk_id") REFERENCES "public"."clerk_user"("clerk_id") ON DELETE set null ON UPDATE no action;
*/