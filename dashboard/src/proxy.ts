import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
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

async function getRoleFromDb(userId: string): Promise<string | undefined> {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
    const { data } = await db
      .from("profiles")
      .select("role")
      .eq("clerk_user_id", userId)
      .single();
    return data?.role ?? undefined;
  } catch {
    return undefined;
  }
}

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId, sessionClaims } = await auth.protect();

  let role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  const pathname = req.nextUrl.pathname;

  // Skip redirect loop: user is already on /onboarding
  if (pathname.startsWith("/onboarding")) return;

  // JWT might be stale right after onboarding — fall back to DB check
  if (!role && userId && (isCandidateRoute(req) || isRecruiterRoute(req))) {
    role = await getRoleFromDb(userId);
  }

  // If role still not set, send to onboarding
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
