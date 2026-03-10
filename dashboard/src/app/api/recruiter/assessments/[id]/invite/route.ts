import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: assessmentId } = await params;
    const { candidateClerkId, candidateEmail } = await req.json();

    if (!candidateClerkId && !candidateEmail) {
      return NextResponse.json({ error: "candidateClerkId or candidateEmail is required" }, { status: 400 });
    }

    const db = supabaseAdmin();

    // Verify recruiter owns this assessment
    const { data: assessment } = await db
      .from("assessments")
      .select("id, company:companies!inner(clerk_user_id)")
      .eq("id", assessmentId)
      .single();

    if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

    const company = (assessment.company as unknown) as { clerk_user_id: string } | null;
    if (company?.clerk_user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Resolve clerk_user_id from email if needed
    let targetClerkId = candidateClerkId;
    if (!targetClerkId && candidateEmail) {
      // Look up by email in profiles table
      const { data: profile } = await db
        .from("profiles")
        .select("clerk_user_id")
        .eq("email", candidateEmail)
        .eq("role", "candidate")
        .single();

      if (!profile) {
        return NextResponse.json({ error: "No candidate found with that email. They must sign up first." }, { status: 404 });
      }
      targetClerkId = profile.clerk_user_id;
    }

    // Upsert invite (idempotent)
    const { error } = await db
      .from("candidate_assessments")
      .upsert(
        { assessment_id: assessmentId, candidate_clerk_id: targetClerkId, status: "invited" },
        { onConflict: "assessment_id,candidate_clerk_id", ignoreDuplicates: true }
      );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("recruiter/assessments/[id]/invite error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
