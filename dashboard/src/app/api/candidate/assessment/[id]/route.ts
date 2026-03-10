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

    // Verify candidate is invited
    const { data: invite, error: inviteErr } = await db
      .from("candidate_assessments")
      .select("id, status, answers, started_at")
      .eq("assessment_id", assessmentId)
      .eq("candidate_clerk_id", userId)
      .single();

    if (inviteErr || !invite) {
      return NextResponse.json({ error: "You have not been invited to this assessment." }, { status: 403 });
    }

    if (invite.status === "completed") {
      return NextResponse.json({ error: "Assessment already completed.", completed: true }, { status: 400 });
    }

    // Fetch assessment (questions, time limit)
    const { data: assessment, error: assErr } = await db
      .from("assessments")
      .select(`
        id, title, description, questions, time_limit_minutes, passing_score,
        company:companies ( company_name )
      `)
      .eq("id", assessmentId)
      .single();

    if (assErr || !assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Mark as in_progress on first open
    if (invite.status === "invited") {
      await db
        .from("candidate_assessments")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("id", invite.id);
    }

    // Strip correct_answer from questions before sending to client
    const safeQuestions = (assessment.questions as Array<Record<string, unknown>>).map(({ correct_answer, ...rest }) => rest);

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        questions: safeQuestions,
        time_limit_minutes: assessment.time_limit_minutes,
        passing_score: assessment.passing_score,
        company: ((assessment.company as unknown) as { company_name: string } | null)?.company_name ?? "Unknown Company",
      },
      invite: { id: invite.id, started_at: invite.started_at, savedAnswers: invite.answers ?? {} },
    });
  } catch (err) {
    console.error("candidate/assessment/[id] GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
