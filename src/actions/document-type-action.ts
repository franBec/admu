"use server";

import * as Effect from "effect/Effect";
import { DocumentTypeRepositoryTag } from "@/repositories/document-type-repository-tag";
import { DocumentTypeRepositoryLive } from "@/repositories/document-type-repository-live";
import { DrizzleServiceLive } from "@/services/drizzle-service-live";
import { currentRequestUrl, currentTraceId } from "@/lib/fiber-refs";
import { defaultError } from "@/utils/error-handling";

import { headers } from "next/headers";
import { HEADER_REQUEST_URL, HEADER_TRACE_ID } from "@/utils/constants";

export async function fetchDocumentTypes() {
  const headersList = await headers();
  const traceId = headersList.get(HEADER_TRACE_ID);
  const requestUrl = headersList.get(HEADER_REQUEST_URL);

  const program = Effect.log().pipe(
    Effect.andThen(() => DocumentTypeRepositoryTag),
    Effect.andThen(documentTypeRepository => documentTypeRepository.findAll()),
    Effect.tap(response => Effect.log(response)),
    defaultError,
    Effect.provide(DocumentTypeRepositoryLive),
    Effect.provide(DrizzleServiceLive),
    Effect.locally(currentTraceId, traceId),
    Effect.locally(currentRequestUrl, requestUrl),
    Effect.annotateLogs("traceId", traceId),
    Effect.annotateLogs("requestUrl", requestUrl),
    Effect.withLogSpan(
      "src/actions/document-type-action.ts>fetchDocumentTypes()"
    )
  );

  return Effect.runPromise(program);
}
