import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin()
      .from("candidate_assessments")
      .select(`
        id,
        assessment_id,
        status,
        score,
        invited_at,
        started_at,
        completed_at,
        assessment:assessments (
          title,
          description,
          time_limit_minutes,
          passing_score,
          company:companies ( company_name )
        )
      `)
      .eq("candidate_clerk_id", userId)
      .order("invited_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ assessments: data ?? [] });
  } catch (err) {
    console.error("candidate/assessments GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
