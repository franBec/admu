import { FiberRef } from "effect";

export const currentRequestUrl = FiberRef.unsafeMake<string | null>(
  null
);
export const currentTraceId = FiberRef.unsafeMake<string | null>(
  null
);