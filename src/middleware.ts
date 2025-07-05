import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import * as Effect from "effect/Effect";
import * as FiberRef from "effect/FiberRef";
import {
  currentRequestUrl,
  currentTraceId,
} from "@/lib/fiber-refs";
import { v4 as uuidv4 } from "uuid";

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const hasCompletedOnboarding = sessionClaims?.metadata?.onboardingComplete;

  // 1. If the user is NOT signed in and the route is NOT public, redirect to sign-in.
  //    This ensures that private routes are protected for unauthenticated users.
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 2. If the user IS signed in:
  if (userId) {
    // 2a. If the user HAS completed onboarding:
    if (hasCompletedOnboarding) {
      // If they try to visit the /onboarding route, redirect them to the home page.
      if (isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      // For any other route, let them proceed (they are logged in and onboarded).
      return NextResponse.next();
    } else {
      // 2b. If the user HAS NOT completed onboarding:
      // If they are trying to access a route that IS NOT /onboarding, redirect them to /onboarding.
      if (!isOnboardingRoute(req)) {
        const onboardingUrl = new URL("/onboarding", req.url);
        return NextResponse.redirect(onboardingUrl);
      }
      // If they ARE already on the /onboarding route, let them proceed to complete it.
      return NextResponse.next();
    }
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  const program = Effect.log("Executing middleware").pipe(
    Effect.locally(currentRequestUrl, req.url),
    Effect.locally(currentTraceId, uuidv4())
  );

  await Effect.runPromise(program);

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
