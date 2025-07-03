import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { documentType } from "@/db/schema";

export class DocumentTypeRepositoryTag extends Context.Tag(
  "DocumentTypeRepositoryTag"
)<
  DocumentTypeRepositoryTag,
  {
    readonly findAll: () => Effect.Effect<
      ReadonlyArray<typeof documentType.$inferSelect>,
      DatabaseQueryError
    >;
  }
>() {}
