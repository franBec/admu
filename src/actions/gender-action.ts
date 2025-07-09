"use server";

import * as Effect from "effect/Effect";
import { GenderRepositoryTag } from "@/repositories/gender-repository-tag";
import { DrizzleServiceLive } from "@/services/drizzle-service-live";
import { GenderRepositoryLive } from "@/repositories/gender-repository-live";
import { currentRequestUrl, currentTraceId } from "@/lib/fiber-refs";
import { defaultError } from "@/utils/error-handling";
import { headers } from "next/headers";

export async function fetchGenders() {
  const headersList = await headers();
  const traceId = headersList.get("x-trace-id");
  const requestUrl = headersList.get("x-request-url");

  const program = Effect.log().pipe(
    Effect.andThen(() => GenderRepositoryTag),
    Effect.andThen(genderRepository => genderRepository.findAll()),
    defaultError,
    Effect.provide(GenderRepositoryLive),
    Effect.provide(DrizzleServiceLive),
    Effect.locally(currentTraceId, traceId),
    Effect.locally(currentRequestUrl, requestUrl),
    Effect.annotateLogs("traceId", traceId),
    Effect.annotateLogs("requestUrl", requestUrl),
    Effect.withLogSpan("src/actions/gender-action.ts>fetchGenders()")
  );

  return Effect.runPromise(program);
}
