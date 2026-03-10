import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin()
      .from("mock_interviews")
      .select("id, topic, difficulty, completed, score, created_at")
      .eq("candidate_clerk_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ sessions: data ?? [] });
  } catch (err) {
    console.error("mock-interview/list error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
