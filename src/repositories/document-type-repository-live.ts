import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { DrizzleServiceTag } from "@/services/drizzle-service-tag";
import { documentType } from "@/db/schema";
import { DocumentTypeRepositoryTag } from "@/repositories/document-type-repository-tag";

export const DocumentTypeRepositoryLive = Layer.effect(
  DocumentTypeRepositoryTag,
  Effect.gen(function* () {
    const { db } = yield* DrizzleServiceTag;
    return {
      findAll: () =>
        Effect.log().pipe(
          Effect.andThen(() =>
            Effect.tryPromise({
              try: () => db.select().from(documentType),
              catch: e => new DatabaseQueryError({ e }),
            })
          ),
          Effect.tap(() => Effect.log()),
          Effect.tapError(e => Effect.logError(e)),
          Effect.withLogSpan(
            "src/repositories/document-type-repository-live.ts>DocumentTypeRepositoryLive>findAll()"
          )
        ),
    };
  })
);
