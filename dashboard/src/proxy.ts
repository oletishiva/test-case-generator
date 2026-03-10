import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/test-cases(.*)",
  "/settings(.*)",
  "/onboarding(.*)",
  "/candidate(.*)",
  "/recruiter(.*)",
]);

const isCandidateRoute = createRouteMatcher(["/candidate(.*)"]);
const isRecruiterRoute = createRouteMatcher(["/recruiter(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId, sessionClaims } = await auth.protect();

  // Not signed in — auth.protect() already redirects to sign-in, so we only
  // reach here if the user IS authenticated.

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  const pathname = req.nextUrl.pathname;

  // Skip redirect loop: user is already on /onboarding
  if (pathname.startsWith("/onboarding")) return;

  // If role is not set yet, send to onboarding
  if (!role) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // Role-based route protection: candidates can't access recruiter pages and vice versa
  if (isCandidateRoute(req) && role !== "candidate") {
    return NextResponse.redirect(new URL("/recruiter/dashboard", req.url));
  }
  if (isRecruiterRoute(req) && role !== "recruiter") {
    return NextResponse.redirect(new URL("/candidate/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
