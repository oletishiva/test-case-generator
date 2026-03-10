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

    const { id } = await params;
    const db = supabaseAdmin();

    const { data: session, error } = await db
      .from("hr_interviews")
      .select("id, conversation, question_count, status, score, feedback, started_at, completed_at, resume_text")
      .eq("id", id)
      .eq("candidate_clerk_id", userId)
      .single();

    if (error || !session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ session });
  } catch (err) {
    console.error("hr-interview GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
