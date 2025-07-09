"use server";

import * as Effect from "effect/Effect";
import { DocumentTypeRepositoryTag } from "@/repositories/document-type-repository-tag";
import { DocumentTypeRepositoryLive } from "@/repositories/document-type-repository-live";
import { DrizzleServiceLive } from "@/services/drizzle-service-live";

import { currentRequestUrl, currentTraceId } from "@/lib/fiber-refs";
import { defaultError } from "@/utils/error-handling";

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
    defaultError,
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
