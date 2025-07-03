"use server";

import * as Effect from "effect/Effect";
import { CountryRepositoryTag } from "@/repositories/country-repository-tag";
import { CountryRepositoryLive } from "@/repositories/country-repository-live";
import { DrizzleServiceLive } from "@/services/drizzle-service-live";

export async function fetchCountries() {
  return Effect.runPromise(
    Effect.gen(function* () {
      const countryRepository = yield* CountryRepositoryTag;
      return yield* countryRepository.findAll();
    }).pipe(
      Effect.catchAll(e => {
        console.error("Unhandled Effect Error in fetchCountries:", e);
        return Effect.die("fetchCountries died due to unknown defect");
      }),
      Effect.provide(CountryRepositoryLive),
      Effect.provide(DrizzleServiceLive)
    )
  );
}
