import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = supabaseAdmin();

    const { data: company } = await db
      .from("companies")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!company) return NextResponse.json({ assessmentsCount: 0, candidatesInvited: 0, avgScore: null, jobsCount: 0 });

    const [assessRes, caRes, jobRes] = await Promise.all([
      db.from("assessments").select("id").eq("company_id", company.id),
      db.from("candidate_assessments")
        .select("score, status")
        .in("assessment_id",
          (await db.from("assessments").select("id").eq("company_id", company.id)).data?.map((a) => a.id) ?? []
        ),
      db.from("job_postings").select("id").eq("company_id", company.id),
    ]);

    const cas = caRes.data ?? [];
    const scores = cas.filter((c) => c.score != null && c.status === "completed").map((c) => c.score as number);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    return NextResponse.json({
      assessmentsCount: assessRes.data?.length ?? 0,
      candidatesInvited: cas.length,
      candidatesCompleted: cas.filter((c) => c.status === "completed").length,
      avgScore,
      jobsCount: jobRes.data?.length ?? 0,
    });
  } catch (err) {
    console.error("recruiter/stats error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
