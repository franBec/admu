import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as Context from "effect/Context";
import * as schema from "@/db/schema";
import * as relations from "@/db/relations";

const fullSchema = { ...schema, ...relations };
type FullSchemaType = typeof fullSchema;

export class DrizzleServiceTag extends Context.Tag("DrizzleService")<
  DrizzleServiceTag,
  {
    readonly db: NodePgDatabase<FullSchemaType>;
  }
>() {}
