import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Question = { id: string; question: string; type: string; correct_answer?: string; points: number };

function buildEvalPrompt(questions: Question[], answers: Record<string, string>): string {
  const qa = questions.map((q) => {
    const ans = answers[q.id] ?? "(no answer)";
    const correctHint = q.type === "mcq" && q.correct_answer ? `\nCorrect answer: ${q.correct_answer}` : "";
    return `Q [${q.type}, ${q.points}pts]: ${q.question}${correctHint}\nCandidate: ${ans}`;
  }).join("\n\n");

  return `You are a QA hiring assessor. Score the following candidate answers.

${qa}

For MCQ: full points if correct, 0 if wrong.
For text/code: partial credit based on quality (0–${Math.max(...questions.map((q) => q.points))} pts).

Return ONLY valid JSON (no markdown):
{
  "scores": { "q1": 10, "q2": 8 },
  "overall_score": 72,
  "feedback": "Strong understanding of locators but missed async handling details."
}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { assessmentId, answers } = await req.json() as {
      assessmentId: string;
      answers: Record<string, string>;
    };

    if (!assessmentId || !answers) {
      return NextResponse.json({ error: "assessmentId and answers required" }, { status: 400 });
    }

    const db = supabaseAdmin();

    // Verify invite & not already completed
    const { data: invite } = await db
      .from("candidate_assessments")
      .select("id, status")
      .eq("assessment_id", assessmentId)
      .eq("candidate_clerk_id", userId)
      .single();

    if (!invite) return NextResponse.json({ error: "Not invited" }, { status: 403 });
    if (invite.status === "completed") return NextResponse.json({ error: "Already submitted" }, { status: 400 });

    // Fetch full questions (with correct_answer) for scoring
    const { data: assessment } = await db
      .from("assessments")
      .select("questions")
      .eq("id", assessmentId)
      .single();

    const questions = (assessment?.questions ?? []) as Question[];

    // Score with Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: buildEvalPrompt(questions, answers) }],
    });

    const raw = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "{}";
    const jsonStr = raw.startsWith("```") ? raw.replace(/^```[a-z]*\n?/, "").replace(/```\s*$/, "").trim() : raw;
    const evaluation = JSON.parse(jsonStr);

    const overallScore = evaluation.overall_score ?? 0;

    // Save result
    const { error: updateErr } = await db
      .from("candidate_assessments")
      .update({
        answers,
        score: overallScore,
        ai_feedback: evaluation.feedback ?? null,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    if (updateErr) throw updateErr;
    return NextResponse.json({ ok: true, score: overallScore, feedback: evaluation.feedback });
  } catch (err) {
    console.error("candidate/assessment/submit error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
