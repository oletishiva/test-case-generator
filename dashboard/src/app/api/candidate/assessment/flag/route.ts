import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type FlagType = "tab_switch" | "copy" | "paste" | "fullscreen_exit" | "face_violation";

const COUNTER_COLUMN: Record<FlagType, string | null> = {
  tab_switch:       "tab_switches",
  copy:             "copy_attempts",
  paste:            "paste_events",
  fullscreen_exit:  "fullscreen_exits",
  face_violation:   null, // handled via JSONB append
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { assessmentId, flagType, detail } = await req.json() as {
      assessmentId: string;
      flagType: FlagType;
      detail?: string;
    };

    if (!assessmentId || !flagType) {
      return NextResponse.json({ error: "assessmentId and flagType required" }, { status: 400 });
    }

    const db = supabaseAdmin();

    // Fetch current record
    const { data: invite, error: fetchErr } = await db
      .from("candidate_assessments")
      .select("id, tab_switches, copy_attempts, paste_events, fullscreen_exits, proctoring_flags")
      .eq("assessment_id", assessmentId)
      .eq("candidate_clerk_id", userId)
      .single();

    if (fetchErr || !invite) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const col = COUNTER_COLUMN[flagType];

    if (col) {
      // Increment counter column
      const current = (invite as Record<string, number>)[col] ?? 0;
      await db
        .from("candidate_assessments")
        .update({ [col]: current + 1 })
        .eq("id", invite.id);
    } else {
      // Face violation — append to JSONB array
      const existing = (invite.proctoring_flags as Array<unknown>) ?? [];
      const newFlag = { type: detail ?? "unknown", timestamp: new Date().toISOString() };
      await db
        .from("candidate_assessments")
        .update({ proctoring_flags: [...existing, newFlag] })
        .eq("id", invite.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("flag route error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
