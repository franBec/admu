import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { gender } from "@/db/schema";

export class GenderRepositoryTag extends Context.Tag("GenderRepositoryTag")<
  GenderRepositoryTag,
  {
    readonly findAll: () => Effect.Effect<
      ReadonlyArray<typeof gender.$inferSelect>,
      DatabaseQueryError
    >;
  }
>() {}
