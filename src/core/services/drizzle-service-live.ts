import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as schema from "@/core/db/schema";
import * as relations from "@/core/db/relations";
import { DrizzleServiceTag } from "@/core/services/drizzle-service-tag";
import { DatabasePoolError } from "@/core/errors/database-pool-error";

const fullSchema = { ...schema, ...relations };

export const DrizzleServiceLive = Layer.scoped(
  DrizzleServiceTag,
  Effect.succeed(process.env.DATABASE_URL).pipe(
    Effect.flatMap(databaseUrl => {
      if (!databaseUrl) {
        return Effect.die(new Error("DATABASE_URL is not set."));
      }

      const pool = new Pool({ connectionString: databaseUrl });

      return Effect.addFinalizer(() =>
        Effect.log("Closing database connection pool.").pipe(
          Effect.flatMap(() => Effect.promise(() => pool.end()))
        )
      ).pipe(
        Effect.flatMap(() =>
          Effect.tryPromise({
            try: async () => {
              const client = await pool.connect();
              client.release();
            },
            catch: e => new DatabasePoolError({ e }),
          })
        ),
        Effect.flatMap(() => {
          const db = drizzle(pool, {
            schema: fullSchema,
          });
          return Effect.log(
            "Database connection established and client created."
          ).pipe(
            Effect.map(() => ({ db })),
            Effect.withLogSpan(
              "src/services/drizzle-service-live.ts>DrizzleServiceLive"
            )
          );
        })
      );
    })
  )
);
