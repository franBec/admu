"use server";

import * as Effect from "effect/Effect";
import { GenderRepositoryTag } from "@/repositories/gender-repository-tag";
import { DrizzleServiceLive } from "@/services/drizzle-service-live";
import { GenderRepositoryLive } from "@/repositories/gender-repository-live";
import * as FiberRef from "effect/FiberRef";
import { currentRequestUrl, currentTraceId } from "@/lib/fiber-refs";
import { mapToProblemDetails } from "@/utils/problem-details-mapper";
import { Cause } from "effect";
import { headers } from "next/headers";

export async function fetchGenders() {
  const headersList = await headers();
  const traceId = headersList.get("x-trace-id");
  const requestUrl = headersList.get("x-request-url");

  const program = Effect.gen(function* () {
    yield* Effect.log();
    const genderRepository = yield* GenderRepositoryTag;
    const result = yield* genderRepository.findAll();
    yield* Effect.log(result);
    return result;
  }).pipe(
    Effect.catchAll(e =>
      Effect.gen(function* (_) {
        const traceId = yield* _(FiberRef.get(currentTraceId));
        const requestUrl = yield* _(FiberRef.get(currentRequestUrl));
        yield* Effect.logError(Cause.die(e));

        return mapToProblemDetails(e, 500, {
          requestUrl,
          traceId,
        });
      })
    ),
    Effect.provide(GenderRepositoryLive),
    Effect.provide(DrizzleServiceLive),
    Effect.locally(currentTraceId, traceId),
    Effect.locally(currentRequestUrl, requestUrl),
    Effect.withLogSpan("src/actions/gender-action.ts>fetchGenders()")
  );

  return Effect.runPromise(program);
}
