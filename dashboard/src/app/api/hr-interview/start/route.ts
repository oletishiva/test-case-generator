import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resumeText, assessmentId } = await req.json() as {
      resumeText: string;
      assessmentId?: string;
    };

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    const db = supabaseAdmin();

    // Fetch candidate profile for extra context
    const { data: profile } = await db
      .from("candidate_profiles")
      .select("skills, experience_years, bio")
      .eq("clerk_user_id", userId)
      .single();

    const skills = profile?.skills?.join(", ") ?? "Not specified";
    const expYears = profile?.experience_years ?? 0;

    // Generate first question with Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{
        role: "user",
        content: `You are a senior HR interviewer at a top tech company.

The candidate's resume:
---
${resumeText.slice(0, 3000)}
---
Skills: ${skills}. Experience: ${expYears} years.

Start the HR interview with a warm, professional opening sentence, then ask your FIRST question.
Use a classic opener like "Tell me about yourself" or "Walk me through your background and what brings you here today."
Return ONLY the opening + question — no labels, no numbering, no extra commentary.`,
      }],
    });

    const firstQuestion = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "Tell me about yourself and what brings you here today.";

    const conversation = [{
      role: "ai",
      content: firstQuestion,
      timestamp: new Date().toISOString(),
    }];

    // Create session
    const { data: session, error } = await db
      .from("hr_interviews")
      .insert({
        candidate_clerk_id: userId,
        assessment_id: assessmentId ?? null,
        resume_text: resumeText,
        conversation,
        question_count: 1,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: session.id, firstQuestion });
  } catch (err) {
    console.error("hr-interview/start error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
