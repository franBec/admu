import * as Data from "effect/Data";
import { UNEXPECTED_ERROR } from "@/utils/constants";

export class DatabasePoolError extends Data.TaggedError("DatabasePoolError")<{
  e: unknown;
  message?: string;
}> {
  constructor(props: { e: unknown; message?: string }) {
    super(props);
    if (!props.message) {
      this.message = (props.e as any).cause?.detail || UNEXPECTED_ERROR;
    }
  }
}
