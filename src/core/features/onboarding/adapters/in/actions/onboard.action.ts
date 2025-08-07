"use server";

import * as Effect from "effect/Effect";

import { currentRequestUrl, currentTraceId } from "@/lib/fiber-refs";
import { OnboardingFormValues } from "@/features/onboarding/adapters/in/actions/schemas/onboarding-form.schema";
import { OnboardServiceLive } from "@/features/onboarding/onboard-service.live";
import { OnboardRepositoryLive } from "@/features/onboarding/adapters/out/repositories/onboard-repository.live";
import { DrizzleServiceLive } from "@/services/drizzle-service.live";
import { headers } from "next/headers";
import { ClerkServiceLive } from "@/services/clerk-service.live";
import { HEADER_REQUEST_URL, HEADER_TRACE_ID } from "@/utils/constants";
import { onboardEffect } from "@/features/onboarding/adapters/in/actions/onboard.effect";

const label =
  "src/core/features/onboarding/adapters/in/actions/onboard.action.ts>onboardPerson()";

export async function onboard(values: OnboardingFormValues) {
  const headersList = await headers();
  const traceId = headersList.get(HEADER_TRACE_ID);
  const requestUrl = headersList.get(HEADER_REQUEST_URL);

  return Effect.runPromise(
    onboardEffect(values).pipe(
      Effect.provide(OnboardServiceLive),
      Effect.provide(ClerkServiceLive),
      Effect.provide(OnboardRepositoryLive),
      Effect.provide(DrizzleServiceLive),
      Effect.locally(currentTraceId, traceId),
      Effect.locally(currentRequestUrl, requestUrl),
      Effect.annotateLogs("traceId", traceId),
      Effect.annotateLogs("requestUrl", requestUrl),
      Effect.withLogSpan(label)
    )
  );
}
