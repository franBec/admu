"use server";

import * as Effect from "effect/Effect";
import { CountryRepositoryTag } from "@/repositories/country-repository-tag";
import { CountryRepositoryLive } from "@/repositories/country-repository-live";
import { DrizzleServiceLive } from "@/services/drizzle-service-live";
import { currentRequestUrl, currentTraceId } from "@/lib/fiber-refs";
import { defaultError } from "@/utils/error-handling";
import { headers } from "next/headers";

export async function fetchCountries() {
  const headersList = await headers();
  const traceId = headersList.get("x-trace-id");
  const requestUrl = headersList.get("x-request-url");

  const program = Effect.log().pipe(
    Effect.andThen(() =>
      Effect.gen(function* () {
        return yield* (yield* CountryRepositoryTag).findAll();
      })
    ),
    Effect.tap(response => Effect.log(response)),
    defaultError,
    Effect.provide(CountryRepositoryLive),
    Effect.provide(DrizzleServiceLive),
    Effect.locally(currentTraceId, traceId),
    Effect.locally(currentRequestUrl, requestUrl),
    Effect.annotateLogs("traceId", traceId),
    Effect.annotateLogs("requestUrl", requestUrl),
    Effect.withLogSpan("src/actions/country-action.ts>fetchCountries()")
  );

  return Effect.runPromise(program);
}
