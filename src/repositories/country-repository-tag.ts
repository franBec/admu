import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { country } from "@/db/schema";

export class CountryRepositoryTag extends Context.Tag("CountryRepository")<
  CountryRepositoryTag,
  {
    readonly findAll: () => Effect.Effect<
      ReadonlyArray<typeof country.$inferSelect>,
      DatabaseQueryError
    >;
  }
>() {}
