import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { DrizzleServiceTag } from "@/services/drizzle-service-tag";
import { gender } from "@/db/schema";
import { GenderRepositoryTag } from "@/repositories/gender-repository-tag";


export const GenderRepositoryLive = Layer.effect(
  GenderRepositoryTag,
  Effect.gen(function* () {
    const { db } = yield* DrizzleServiceTag;
    return {
      findAll: () =>
        Effect.tryPromise({
          try: () => db.select().from(gender),
          catch: e => new DatabaseQueryError({ e }),
        }).pipe(
          Effect.withLogSpan(
            "src/repositories.gender-repository-live.ts>GenderRepositoryTag>findAll()"
          ),
          Effect.tap(() => Effect.log()),
          Effect.tapError(e => Effect.logError(e))
        ),
    };
  })
);
