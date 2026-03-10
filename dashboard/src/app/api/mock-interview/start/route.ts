import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TOPIC_LABELS: Record<string, string> = {
  playwright: "Playwright (TypeScript/JavaScript)",
  selenium: "Selenium WebDriver",
  cypress: "Cypress",
  "api-testing": "API Testing (REST/GraphQL)",
  "general-qa": "General QA Engineering",
  cicd: "CI/CD and DevOps for QA",
  behavioral: "Behavioral & situational",
};

function buildPrompt(topic: string, difficulty: string): string {
  return `You are a senior QA engineering interviewer. Generate exactly 5 interview questions for a ${difficulty}-level candidate on the topic: ${TOPIC_LABELS[topic] ?? topic}.

Requirements:
- Mix question types: conceptual, practical, scenario-based
- Each question should be distinct and progressively challenging
- Include a "expected_points" array of 3–5 key points a good answer should cover

Return ONLY a JSON array (no markdown, no explanation):
[
  {
    "id": "q1",
    "question": "...",
    "expected_points": ["point 1", "point 2", "point 3"]
  },
  ...
]`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topic = "playwright", difficulty = "medium" } = await req.json();

    const validTopics = ["playwright", "selenium", "cypress", "api-testing", "performance", "mobile", "general-qa", "cicd", "behavioral"];
    const validDiffs = ["easy", "medium", "hard", "mixed"];
    if (!validTopics.includes(topic) || !validDiffs.includes(difficulty)) {
      return NextResponse.json({ error: "Invalid topic or difficulty" }, { status: 400 });
    }

    // Generate questions with Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: buildPrompt(topic, difficulty) }],
    });

    const raw = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";
    // Strip accidental markdown fences
    const jsonStr = raw.startsWith("```") ? raw.replace(/^```[a-z]*\n?/, "").replace(/```\s*$/, "").trim() : raw;
    const questions = JSON.parse(jsonStr);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid questions format from AI");
    }

    // Save to DB
    const { data, error } = await supabaseAdmin()
      .from("mock_interviews")
      .insert({
        candidate_clerk_id: userId,
        topic,
        difficulty,
        questions,
        answers: {},
        completed: false,
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id, questions });
  } catch (err) {
    console.error("mock-interview/start error:", err);
    const msg = err instanceof Error ? err.message : "Failed to start interview";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
