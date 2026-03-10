import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/* ── GET: list assessments for the recruiter's company ── */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = supabaseAdmin();
    const { data: company } = await db.from("companies").select("id").eq("clerk_user_id", userId).single();
    if (!company) return NextResponse.json({ assessments: [] });

    const { data, error } = await db
      .from("assessments")
      .select(`
        id, title, description, time_limit_minutes, passing_score, is_active, created_at,
        job_posting:job_postings ( title ),
        candidate_count:candidate_assessments ( count )
      `)
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ assessments: data ?? [] });
  } catch (err) {
    console.error("recruiter/assessments GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

/* ── POST: create assessment (AI generates questions) ── */
function buildQuestionsPrompt(role: string, topic: string, count: number): string {
  return `You are a senior QA engineering hiring manager. Generate exactly ${count} assessment questions for a "${role}" role, focused on ${topic}.

Mix question types:
- MCQ (multiple choice, 4 options, 1 correct)
- Text (open-ended, short answer)
- Code (write/debug code snippet)

Return ONLY a JSON array (no markdown):
[
  {
    "id": "q1",
    "question": "...",
    "type": "mcq",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "B",
    "points": 10
  },
  {
    "id": "q2",
    "question": "...",
    "type": "text",
    "points": 15
  },
  {
    "id": "q3",
    "question": "Write a Playwright test that...",
    "type": "code",
    "points": 20
  }
]`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      title, description, role, topic, questionCount = 5,
      timeLimitMinutes = 60, passingScore = 70, jobPostingId,
    } = body as {
      title: string; description?: string; role: string; topic: string;
      questionCount?: number; timeLimitMinutes?: number; passingScore?: number;
      jobPostingId?: string;
    };

    if (!title?.trim() || !role?.trim() || !topic?.trim()) {
      return NextResponse.json({ error: "title, role, and topic are required" }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { data: company } = await db.from("companies").select("id").eq("clerk_user_id", userId).single();
    if (!company) return NextResponse.json({ error: "Company profile not found. Complete onboarding first." }, { status: 400 });

    // Generate questions with Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      messages: [{ role: "user", content: buildQuestionsPrompt(role, topic, Math.min(questionCount, 10)) }],
    });

    const raw = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "[]";
    const jsonStr = raw.startsWith("```") ? raw.replace(/^```[a-z]*\n?/, "").replace(/```\s*$/, "").trim() : raw;
    const questions = JSON.parse(jsonStr);

    const { data, error } = await db
      .from("assessments")
      .insert({
        company_id: company.id,
        job_posting_id: jobPostingId ?? null,
        title: title.trim(),
        description: description?.trim() ?? null,
        questions,
        time_limit_minutes: timeLimitMinutes,
        passing_score: passingScore,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id, questions });
  } catch (err) {
    console.error("recruiter/assessments POST error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
