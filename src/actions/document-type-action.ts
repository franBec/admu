"use server";

import * as Effect from "effect/Effect";
import { DocumentTypeRepositoryTag } from "@/repositories/document-type-repository-tag";
import { DocumentTypeRepositoryLive } from "@/repositories/document-type-repository-live";
import { DrizzleServiceLive } from "@/services/drizzle-service-live";
import * as FiberRef from "effect/FiberRef";
import { currentRequestUrl, currentTraceId } from "@/lib/fiber-refs";
import { mapToProblemDetails } from "@/utils/problem-details-mapper";

import { headers } from "next/headers";

export async function fetchDocumentTypes() {
  const headersList = await headers();
  const traceId = headersList.get("x-trace-id");
  const requestUrl = headersList.get("x-request-url");

  const program = Effect.gen(function* () {
    yield* Effect.log();
    const documentTypeRepository = yield* DocumentTypeRepositoryTag;
    const result = yield* documentTypeRepository.findAll();
    yield* Effect.log(result);
    return result;
  }).pipe(
    Effect.catchAll(e =>
      Effect.gen(function* (_) {
        const traceId = yield* _(FiberRef.get(currentTraceId));
        const requestUrl = yield* _(FiberRef.get(currentRequestUrl));
        yield* Effect.logError(e);

        return mapToProblemDetails(e, 500, {
          requestUrl,
          traceId,
        });
      })
    ),
    Effect.provide(DocumentTypeRepositoryLive),
    Effect.provide(DrizzleServiceLive),
    Effect.locally(currentTraceId, traceId),
    Effect.locally(currentRequestUrl, requestUrl),
    Effect.withLogSpan(
      "src/actions/document-type-actions.ts>fetchDocumentTypes()"
    )
  );

  return Effect.runPromise(program);
}
