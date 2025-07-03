"use server";

import * as Effect from "effect/Effect";
import { GenderRepositoryTag } from "@/repositories/gender-repository-tag";
import { DrizzleServiceLive } from "@/services/drizzle-service-live";
import { GenderRepositoryLive } from "@/repositories/gender-repository-live";

export async function fetchGenders() {
  return Effect.runPromise(
    Effect.gen(function* () {
      const genderRepository = yield* GenderRepositoryTag;
      return yield* genderRepository.findAll();
    }).pipe(
      Effect.catchAll(e => {
        console.error("Unhandled Effect Error in fetchGenders:", e);
        return Effect.die("fetchGenders died due to unknown defect");
      }),
      Effect.provide(GenderRepositoryLive),
      Effect.provide(DrizzleServiceLive)
    )
  );
}
