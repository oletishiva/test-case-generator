import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Question = { id: string; question: string; expected_points: string[] };

function buildEvalPrompt(
  topic: string,
  questions: Question[],
  answers: Record<string, string>
): string {
  const qa = questions.map((q) => `Q: ${q.question}\nExpected points: ${q.expected_points.join(", ")}\nCandidate answer: ${answers[q.id] ?? "(no answer)"}`).join("\n\n");

  return `You are a senior QA engineering interviewer. Evaluate the following candidate answers for a ${topic} interview.

For each question, provide a score (0–100) and brief feedback.
Then provide an overall assessment.

${qa}

Return ONLY valid JSON (no markdown):
{
  "question_scores": {
    "q1": { "score": 85, "feedback": "Good explanation of..." },
    "q2": { "score": 60, "feedback": "Mentioned X but missed Y..." }
  },
  "overall_score": 72,
  "strengths": ["Clear understanding of...", "Good practical examples"],
  "improvements": ["Could expand on...", "Missed key concept of..."],
  "next_steps": ["Practice writing POM classes", "Study Playwright fixtures"]
}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, answers } = await req.json() as { id: string; answers: Record<string, string> };
    if (!id || !answers) return NextResponse.json({ error: "id and answers required" }, { status: 400 });

    const db = supabaseAdmin();

    // Fetch session to get questions
    const { data: session, error: fetchErr } = await db
      .from("mock_interviews")
      .select("*")
      .eq("id", id)
      .eq("candidate_clerk_id", userId)
      .single();

    if (fetchErr || !session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.completed) return NextResponse.json({ error: "Already submitted" }, { status: 400 });

    // Evaluate with Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: buildEvalPrompt(session.topic, session.questions as Question[], answers) }],
    });

    const raw = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "{}";
    const jsonStr = raw.startsWith("```") ? raw.replace(/^```[a-z]*\n?/, "").replace(/```\s*$/, "").trim() : raw;
    const evaluation = JSON.parse(jsonStr);

    const overallScore = evaluation.overall_score ?? 0;

    // Build enriched answers map: { [qId]: { answer, score, feedback } }
    const enrichedAnswers: Record<string, { answer: string; score: number; feedback: string }> = {};
    for (const q of session.questions as Question[]) {
      enrichedAnswers[q.id] = {
        answer: answers[q.id] ?? "",
        score: evaluation.question_scores?.[q.id]?.score ?? 0,
        feedback: evaluation.question_scores?.[q.id]?.feedback ?? "",
      };
    }

    // Save results
    const { error: updateErr } = await db
      .from("mock_interviews")
      .update({
        answers: enrichedAnswers,
        score: overallScore,
        feedback: {
          overall_score: overallScore,
          strengths: evaluation.strengths ?? [],
          improvements: evaluation.improvements ?? [],
          next_steps: evaluation.next_steps ?? [],
        },
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) throw updateErr;

    return NextResponse.json({ ok: true, score: overallScore });
  } catch (err) {
    console.error("mock-interview/submit error:", err);
    const msg = err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
