import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = supabaseAdmin();

    const [mockRes, assessRes, hrRes] = await Promise.all([
      db.from("mock_interviews")
        .select("completed, score")
        .eq("candidate_clerk_id", userId),
      db.from("candidate_assessments")
        .select("status, score")
        .eq("candidate_clerk_id", userId),
      db.from("hr_interviews")
        .select("status, score")
        .eq("candidate_clerk_id", userId),
    ]);

    const mocks = mockRes.data ?? [];
    const assessments = assessRes.data ?? [];
    const hrInterviews = hrRes.data ?? [];

    const completed = mocks.filter((m) => m.completed);
    const scores = completed.filter((m) => m.score != null).map((m) => m.score as number);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    return NextResponse.json({
      mockInterviewsCompleted: completed.length,
      mockInterviewsTotal: mocks.length,
      hrInterviewsCompleted: hrInterviews.filter((h) => h.status === "completed").length,
      assessmentsPending: assessments.filter((a) => a.status === "invited").length,
      assessmentsCompleted: assessments.filter((a) => a.status === "completed").length,
      avgScore,
    });
  } catch (err) {
    console.error("candidate/stats error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
