import { describe, it, expect, vi, beforeEach } from "vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { OnboardingFormValues } from "@/features/onboarding/adapters/in/schemas/onboarding-form.schema";
import { HEADER_REQUEST_URL, HEADER_TRACE_ID } from "@/utils/constants";

beforeEach(() => {
  vi.resetModules();
});

describe("onboard action", () => {
  it("should call onboardEffect", async () => {
    const onboardEffectMock = vi.fn(() => Effect.succeed(undefined));

    vi.doMock("next/headers", () => ({
      headers: vi.fn(() => {
        const headers = new Headers();
        headers.set(HEADER_TRACE_ID, "test-trace-id");
        headers.set(HEADER_REQUEST_URL, "http://localhost:3000");
        return headers;
      }),
    }));

    vi.doMock("../effects/onboard.effect", () => ({
      onboardEffect: onboardEffectMock,
    }));

    vi.doMock("@/features/onboarding/onboard-service.live", () => ({
      OnboardServiceLive: Layer.empty,
    }));
    vi.doMock("@/services/clerk-service.live", () => ({
      ClerkServiceLive: Layer.empty,
    }));
    vi.doMock(
      "@/features/onboarding/adapters/out/repositories/onboard-repository.live",
      () => ({ OnboardRepositoryLive: Layer.empty })
    );
    vi.doMock("@/services/drizzle-service.live", () => ({
      DrizzleServiceLive: Layer.empty,
    }));

    const { onboard } = await import("./onboard.action");

    const values = {} as unknown as OnboardingFormValues;

    await onboard(values);

    expect(onboardEffectMock).toHaveBeenCalledWith(values);
  });
});
