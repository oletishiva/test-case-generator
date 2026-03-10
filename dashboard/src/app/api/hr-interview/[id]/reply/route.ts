import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type ConversationEntry = { role: "ai" | "candidate"; content: string; timestamp: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { answer } = await req.json() as { answer: string };

    if (!answer?.trim()) {
      return NextResponse.json({ error: "Answer is required" }, { status: 400 });
    }

    const db = supabaseAdmin();

    const { data: session } = await db
      .from("hr_interviews")
      .select("id, candidate_clerk_id, resume_text, conversation, question_count, status")
      .eq("id", id)
      .eq("candidate_clerk_id", userId)
      .single();

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.status === "completed") return NextResponse.json({ error: "Interview already completed" }, { status: 400 });

    const conversation = (session.conversation as ConversationEntry[]) ?? [];
    const questionCount = session.question_count ?? 0;

    // Append candidate answer
    const updatedConversation: ConversationEntry[] = [
      ...conversation,
      { role: "candidate", content: answer.trim(), timestamp: new Date().toISOString() },
    ];

    const isDone = questionCount >= 20;

    if (isDone) {
      // Save answer and trigger evaluation
      await db
        .from("hr_interviews")
        .update({ conversation: updatedConversation })
        .eq("id", id);

      return NextResponse.json({ nextQuestion: null, done: true });
    }

    // Build transcript for Claude
    const transcript = updatedConversation
      .map((m) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`)
      .join("\n\n");

    const isNearEnd = questionCount >= 18;

    const prompt = `You are conducting an HR interview. Here is the conversation so far:

${transcript}

---
Candidate's resume:
${(session.resume_text ?? "").slice(0, 2000)}
---

You have asked ${questionCount} questions. Maximum is 20.
${isNearEnd ? "You are near the end of the interview. Ask a closing or reflective question." : ""}

Based on the candidate's LAST answer, choose ONE approach:
1. Follow up on a specific detail they mentioned (dig deeper)
2. Ask a STAR behavioural question (situation, task, action, result)
3. Ask about something notable in their resume they haven't addressed yet
4. Ask a situational or culture-fit question

${questionCount >= 20
  ? 'The interview is complete. Return ONLY valid JSON: {"done": true}'
  : "Return ONLY the next question text — no labels, no numbering, no preamble."}`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";

    // Check if Claude returned done signal
    let nextQuestion: string | null = null;
    let done = false;

    if (raw.includes('"done"') || raw.includes("done: true")) {
      done = true;
    } else {
      nextQuestion = raw;
      updatedConversation.push({ role: "ai", content: nextQuestion, timestamp: new Date().toISOString() });
    }

    await db
      .from("hr_interviews")
      .update({
        conversation: updatedConversation,
        question_count: done ? questionCount : questionCount + 1,
      })
      .eq("id", id);

    return NextResponse.json({ nextQuestion, done });
  } catch (err) {
    console.error("hr-interview/reply error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
