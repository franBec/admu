import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as schema from "@/db/schema";
import * as relations from "@/db/relations";

import { DrizzleServiceTag } from "@/services/drizzle-service-tag";
import { DatabasePoolError } from "@/errors/database-pool-error";

const fullSchema = { ...schema, ...relations };

export const DrizzleServiceLive = Layer.scoped(
  DrizzleServiceTag,
  Effect.gen(function* () {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      yield* Effect.die(new Error("DATABASE_URL is not set."));
    }

    const pool = new Pool({ connectionString: databaseUrl });

    yield* Effect.addFinalizer(() =>
      Effect.log("Closing database connection pool.").pipe(
        Effect.flatMap(() => Effect.promise(() => pool.end()))
      )
    );

    yield* Effect.tryPromise({
      try: async () => {
        const client = await pool.connect();
        client.release();
      },
      catch: e => new DatabasePoolError({ e }),
    });

    const db = drizzle(pool, {
      schema: fullSchema,
    });

    yield* Effect.log("Database connection established and client created.");

    return { db };
  })
);
