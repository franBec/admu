import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { CountryRepositoryTag } from "@/repositories/country-repository-tag";
import { country } from "@/db/schema";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { DrizzleServiceTag } from "@/services/drizzle-service-tag";

export const CountryRepositoryLive = Layer.effect(
  CountryRepositoryTag,
  Effect.gen(function* () {
    const { db } = yield* DrizzleServiceTag;
    return {
      findAll: () =>
        Effect.tryPromise({
          try: () => db.select().from(country),
          catch: e => new DatabaseQueryError({ e }),
        }),
    };
  })
);
