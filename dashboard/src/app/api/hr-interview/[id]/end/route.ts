import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type ConversationEntry = { role: "ai" | "candidate"; content: string; timestamp: string };

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const db = supabaseAdmin();

    const { data: session } = await db
      .from("hr_interviews")
      .select("id, candidate_clerk_id, resume_text, conversation, status")
      .eq("id", id)
      .eq("candidate_clerk_id", userId)
      .single();

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.status === "completed") {
      return NextResponse.json({ ok: true, alreadyCompleted: true });
    }

    const conversation = (session.conversation as ConversationEntry[]) ?? [];
    const transcript = conversation
      .map((m) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`)
      .join("\n\n");

    const evalPrompt = `You evaluated an HR interview. Here is the full transcript:

${transcript}

---
Candidate's resume:
${(session.resume_text ?? "").slice(0, 2000)}
---

Evaluate the candidate's overall performance across communication, experience relevance, problem-solving, and culture fit.

Return ONLY valid JSON (no markdown):
{
  "overall_score": 75,
  "verdict": "Strong Candidate",
  "strengths": ["Clear communicator", "Relevant project experience"],
  "improvements": ["Could quantify achievements", "More specific examples needed"],
  "question_highlights": [
    {"question": "Tell me about yourself", "summary": "Gave a concise, well-structured intro covering key experience."}
  ]
}

Verdict options: "Strong Candidate" | "Good Candidate" | "Potential" | "Needs Improvement"`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: evalPrompt }],
    });

    const raw = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "{}";
    const jsonStr = raw.startsWith("```") ? raw.replace(/^```[a-z]*\n?/, "").replace(/```\s*$/, "").trim() : raw;
    const evaluation = JSON.parse(jsonStr);

    await db
      .from("hr_interviews")
      .update({
        status: "completed",
        score: evaluation.overall_score ?? 0,
        feedback: evaluation,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ ok: true, score: evaluation.overall_score, feedback: evaluation });
  } catch (err) {
    console.error("hr-interview/end error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
