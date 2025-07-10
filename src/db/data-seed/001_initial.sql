-- DANGER: This script will irrevocably delete all data and schema
-- from the tables listed below.

ALTER TABLE "clerk_user" DROP CONSTRAINT IF EXISTS "clerk_user_person_id_fkey";
ALTER TABLE "person" DROP CONSTRAINT IF EXISTS "person_address_id_fkey";
ALTER TABLE "person" DROP CONSTRAINT IF EXISTS "person_clerk_id_fkey";

DROP TABLE IF EXISTS "clerk_user";
DROP TABLE IF EXISTS "person";
DROP TABLE IF EXISTS "address";

CREATE TABLE "address" (
                           "id" serial PRIMARY KEY NOT NULL,
                           "street" text NOT NULL,
                           "number" text,
                           "floor" text,
                           "apartment" text,
                           "city" text NOT NULL,
                           "postal_code" text NOT NULL,
                           "province" text NOT NULL,
                           "country_alpha_2_code" char(2) NOT NULL,
                           "created_at" timestamp with time zone DEFAULT now(),
                           "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "clerk_user" (
                              "id" serial PRIMARY KEY NOT NULL,
                              "clerk_id" text NOT NULL,
                              "email" text NOT NULL,
                              "image_url" text,
                              "created_at" timestamp with time zone DEFAULT now(),
                              "updated_at" timestamp with time zone DEFAULT now(),
                              CONSTRAINT "clerk_user_clerk_id_key" UNIQUE("clerk_id")
);

CREATE TABLE "person" (
                          "id" serial PRIMARY KEY NOT NULL,
                          "given_name" text NOT NULL,
                          "family_name" text NOT NULL,
                          "full_name" text GENERATED ALWAYS AS (((given_name || ' '::text) || family_name)) STORED,
                          "gender_code" text NOT NULL,
                          "birth_date" date NOT NULL,
                          "nationality_alpha_2_code" char(2),
                          "document_type_code" text NOT NULL,
                          "document_number" text NOT NULL,
                          "phone_number" text,
                          "address_id" integer NOT NULL,
                          "clerk_id" text UNIQUE NOT NULL,
                          "created_at" timestamp with time zone DEFAULT now(),
                          "updated_at" timestamp with time zone DEFAULT now(),
                          CONSTRAINT "person_document_type_code_document_number_key" UNIQUE("document_type_code","document_number")
);

ALTER TABLE "person" ADD CONSTRAINT "person_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."address"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "person" ADD CONSTRAINT "person_clerk_id_fkey" FOREIGN KEY ("clerk_id") REFERENCES "public"."clerk_user"("clerk_id") ON DELETE set null ON UPDATE no action;

SELECT setval('address_id_seq', (SELECT COALESCE(MAX(id), 1) FROM address), true);
SELECT setval('person_id_seq', (SELECT COALESCE(MAX(id), 1) FROM person), true);
SELECT setval('clerk_user_id_seq', (SELECT COALESCE(MAX(id), 1) FROM clerk_user), true);

SELECT 'Database schema and lookup data loaded successfully!' AS status;
