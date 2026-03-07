import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { parseResumeJson } from "@/lib/resume/parser";
import { checkAndIncrementUsage } from "@/lib/resume/usage";
import type { ResumeData } from "@/types/resume";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const plan = user?.publicMetadata?.plan as string | undefined;

    const usage = await checkAndIncrementUsage(userId, "enhance", plan);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: `Free plan limit reached (${usage.used}/${usage.limit} enhances used). Upgrade to Pro for unlimited access.` },
        { status: 429 }
      );
    }

    const body = await req.json() as {
      resumeData: ResumeData;
      targetRole?: string;
      jobDescription?: string;
    };

    const { resumeData, targetRole = "QA Engineer", jobDescription } = body;

    if (!resumeData) {
      return NextResponse.json({ error: "resumeData is required." }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const jobContext = jobDescription
      ? `\nTarget Job Description:\n${jobDescription}`
      : "";

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: `You are an expert QA resume writer specialising in ${targetRole} roles.
Rewrite the experience bullets and summary to be metrics-driven, action-verb-led, and ATS-optimized.

Rules:
- Start every bullet with a strong action verb: Architected, Designed, Reduced, Led, Built, Implemented, Automated, Accelerated, Streamlined, Achieved
- Include at least one metric per bullet (%, numbers, time saved, cost saved, coverage %)
- Use QA industry keywords naturally: shift-left, BDD, TDD, CI/CD, test pyramid, regression, automation coverage, defect rate, release velocity, ISTQB, risk-based testing
- Keep bullets concise: max 20 words each
- Rewrite summary to be 3-4 sentences, compelling, keyword-rich
- Do NOT change personal info, education, certifications, or tools
- Return ONLY the complete enhanced ResumeData JSON (same structure), nothing else`,
      messages: [{
        role: "user",
        content: `Enhance this resume for a ${targetRole} role.${jobContext}\n\nCurrent resume:\n${JSON.stringify(resumeData, null, 2)}`
      }],
    });

    const finalMessage = await stream.finalMessage();
    const raw = finalMessage.content[0].type === "text" ? finalMessage.content[0].text : "";
    const enhanced = parseResumeJson(raw);

    return NextResponse.json({ enhanced });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Resume enhance error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
