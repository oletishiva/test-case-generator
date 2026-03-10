import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: assessmentId } = await params;
    const db = supabaseAdmin();

    // Verify ownership
    const { data: assessment } = await db
      .from("assessments")
      .select("id, title, passing_score, company:companies!inner(clerk_user_id)")
      .eq("id", assessmentId)
      .single();

    if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const company = (assessment.company as unknown) as { clerk_user_id: string } | null;
    if (company?.clerk_user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all candidate results
    const { data: results, error } = await db
      .from("candidate_assessments")
      .select("id, candidate_clerk_id, status, score, ai_feedback, invited_at, started_at, completed_at, tab_switches, copy_attempts, paste_events, fullscreen_exits, proctoring_flags")
      .eq("assessment_id", assessmentId)
      .order("completed_at", { ascending: false });

    if (error) throw error;

    // Enrich with candidate profile info
    const clerkIds = (results ?? []).map((r) => r.candidate_clerk_id);
    const { data: profiles } = clerkIds.length
      ? await db.from("profiles").select("clerk_user_id, full_name, email").in("clerk_user_id", clerkIds)
      : { data: [] };

    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.clerk_user_id, p]));

    const enriched = (results ?? []).map((r) => ({
      ...r,
      candidate: profileMap[r.candidate_clerk_id] ?? { full_name: "Unknown", email: "" },
    }));

    return NextResponse.json({
      assessment: { id: assessment.id, title: (assessment as { title: string }).title, passing_score: (assessment as { passing_score: number }).passing_score },
      results: enriched,
    });
  } catch (err) {
    console.error("recruiter/assessments/[id]/results error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
