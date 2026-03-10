import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = supabaseAdmin();

    const { data, error } = await db
      .from("hr_interviews")
      .select("id, status, score, question_count, started_at, completed_at, feedback")
      .eq("candidate_clerk_id", userId)
      .order("started_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ sessions: data ?? [] });
  } catch (err) {
    console.error("hr-interview/list error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
