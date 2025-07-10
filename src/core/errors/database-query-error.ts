import * as Data from "effect/Data";
import { UNEXPECTED_ERROR } from "@/core/utils/constants";

export class DatabaseQueryError extends Data.TaggedError("DatabaseQueryError")<{
  e: unknown;
  message?: string;
}> {
  constructor(props: { e: unknown; message?: string }) {
    super(props);
    if (!props.message) {
      this.message =
        (props.e as { cause?: { detail?: string } }).cause?.detail ||
        UNEXPECTED_ERROR;
    }
  }
}
