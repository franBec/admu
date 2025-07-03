"use server";

import * as Effect from "effect/Effect";
import { DocumentTypeRepositoryTag } from "@/repositories/document-type-repository-tag";
import { DocumentTypeRepositoryLive } from "@/repositories/document-type-repository-live";
import { DrizzleServiceLive } from "@/services/drizzle-service-live";

export async function fetchDocumentTypes() {
  return Effect.runPromise(
    Effect.gen(function* () {
      const documentTypeRepository = yield* DocumentTypeRepositoryTag;
      return yield* documentTypeRepository.findAll();
    }).pipe(
      Effect.catchAll(e => {
        console.error("Unhandled Effect Error in fetchDocumentTypes:", e);
        return Effect.die("fetchDocumentTypes died due to unknown defect");
      }),
      Effect.provide(DocumentTypeRepositoryLive),
      Effect.provide(DrizzleServiceLive)
    )
  );
}
