import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { cleanJson } from "@/lib/resume/parser";
import type { ResumeData, AtsScore } from "@/types/resume";

export const dynamic = "force-dynamic";

const ATS_CRITERIA = [
  "Contact info completeness (name, email, phone, location)",
  "Professional summary present",
  "Summary mentions target role",
  "Action verbs used in bullet points",
  "Metrics or numbers present in bullets",
  "No tables or images referenced in text",
  "Skills section present",
  "QA keywords density (Selenium, Playwright, automation, testing, CI/CD, etc.)",
  "Job title matches or is relevant to QA roles",
  "Education listed",
  "Certifications listed",
  "No personal pronouns (I, my, me)",
  "Consistent date format throughout",
  "Bullet points used in experience section",
  "No obvious spelling errors detected",
  "LinkedIn URL present",
  "GitHub URL present",
  "Tools section present",
  "Achievements are quantified",
  "File-friendly formatting (no special symbols that break ATS)",
  "Keyword density 2-3% (not keyword stuffed)",
  "Section headings are clear and standard",
  "Length appropriate (content for 1-2 pages)",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      resumeData: ResumeData;
      jobDescription?: string;
    };

    const { resumeData, jobDescription } = body;

    if (!resumeData) {
      return NextResponse.json({ error: "resumeData is required." }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: `You are an ATS (Applicant Tracking System) expert evaluating QA resumes.
Evaluate the resume against exactly these 23 criteria and return ONLY valid JSON, no explanation.

Return this exact structure:
{
  "total": <0-100 overall score>,
  "keywordMatch": <0-100 percentage of QA keywords present>,
  "criteriaScore": <number of criteria passed out of 23>,
  "impactScore": <"A+" | "A" | "B" | "C" based on metrics and impact in bullets>,
  "breakdown": [
    { "criterion": "<criterion text>", "passed": <true|false>, "suggestion": "<brief fix if failed>" }
  ],
  "missingKeywords": ["<keywords missing from the resume>"],
  "suggestions": ["<top 5 actionable suggestions to improve ATS score>"]
}

The 23 criteria to evaluate (in order):
${ATS_CRITERIA.map((c, i) => `${i + 1}. ${c}`).join("\n")}`,
      messages: [{
        role: "user",
        content: `Score this resume${jobDescription ? ` for this job:\n${jobDescription}\n\n` : ":\n\n"}${JSON.stringify(resumeData, null, 2)}`
      }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = cleanJson(raw);
    const atsScore = JSON.parse(cleaned) as AtsScore;

    return NextResponse.json({ atsScore });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("ATS score error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
