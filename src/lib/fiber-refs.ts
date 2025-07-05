
import { FiberRef } from "effect";

export const currentRequestUrl = FiberRef.unsafeMake<string | undefined>(
  undefined
);
export const currentTraceId = FiberRef.unsafeMake<string | undefined>(
  undefined
);
