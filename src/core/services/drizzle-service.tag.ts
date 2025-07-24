import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as Context from "effect/Context";
import * as schema from "@/core/db/schema";
import * as relations from "@/core/db/relations";

export class DrizzleServiceTag extends Context.Tag("DrizzleServiceTag")<
  DrizzleServiceTag,
  {
    readonly db: NodePgDatabase<typeof schema & typeof relations>;
  }
>() {}
