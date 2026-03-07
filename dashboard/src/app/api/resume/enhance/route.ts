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

    const hasJD = Boolean(jobDescription?.trim());

    const systemPrompt = hasJD
      ? `You are an expert QA resume writer and ATS optimization specialist.

Your task: Rewrite the provided resume to MAXIMISE ATS match score against the given Job Description.

STEP 1 — Analyse the JD:
- Extract every hard skill, technology, tool, methodology keyword from the JD
- Identify the seniority level, must-have vs nice-to-have requirements
- Note the exact phrasing the JD uses (copy terminology verbatim when appropriate)

STEP 2 — Rewrite the resume:
- Rewrite the SUMMARY to directly mirror the JD's language, seniority level, and top 3 requirements
- Rewrite experience BULLETS to incorporate JD keywords naturally — use exact phrases from the JD
- Add any missing JD skills the candidate likely has (based on their experience) to the skills list
- Prioritise bullets that demonstrate the JD's key responsibilities
- Every bullet: strong action verb + metric (%, numbers, time, cost) + JD-matched keyword
- Remove or deprioritise bullets irrelevant to this JD

STRICT RULES:
- Only claim skills/experience the candidate already has — never fabricate
- Do NOT change: name, email, phone, location, education, certifications, tools list
- Return ONLY valid JSON matching the exact ResumeData structure — no markdown, no commentary`
      : `You are an expert QA resume writer specialising in ${targetRole} roles.
Rewrite the experience bullets and summary to be metrics-driven, action-verb-led, and ATS-optimized.

Rules:
- Start every bullet with a strong action verb: Architected, Designed, Reduced, Led, Built, Implemented, Automated, Accelerated, Streamlined, Achieved
- Include at least one metric per bullet (%, numbers, time saved, cost saved, coverage %)
- Use QA industry keywords: shift-left, BDD, TDD, CI/CD, regression, automation coverage, defect rate, release velocity, ISTQB, risk-based testing
- Keep bullets concise: max 22 words each
- Rewrite summary to be 3-4 sentences, compelling, keyword-rich for ${targetRole}
- Do NOT change personal info, education, certifications, or tools
- Return ONLY valid JSON matching the exact ResumeData structure — no markdown, no commentary`;

    const userMessage = hasJD
      ? `JOB DESCRIPTION TO MATCH:\n${jobDescription}\n\n---\nCANDIDATE RESUME:\n${JSON.stringify(resumeData, null, 2)}`
      : `Enhance this resume for a ${targetRole} role.\n\nResume:\n${JSON.stringify(resumeData, null, 2)}`;

    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
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
