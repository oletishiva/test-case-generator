import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { parseResumeJson } from "@/lib/resume/parser";
import { checkAndIncrementUsage } from "@/lib/resume/usage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const plan = user?.publicMetadata?.plan as string | undefined;

    const usage = await checkAndIncrementUsage(userId, "parse", plan);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: `Free plan limit reached (${usage.used}/${usage.limit} parses used). Upgrade to Pro for unlimited access.` },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;

    let resumeText = "";

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Custom page renderer — avoids canvas/DOMMatrix APIs (Node.js has none)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async function pageRenderTextOnly(pageData: any): Promise<string> {
        return pageData
          .getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .then((textContent: any) => {
            let lastY: number | undefined;
            let text = "";
            for (const item of textContent.items) {
              const y = item.transform?.[5];
              if (lastY !== undefined && lastY !== y) text += "\n";
              text += item.str;
              lastY = y;
            }
            return text;
          });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfModule = await import("pdf-parse") as any;
      const pdfParse = pdfModule.default ?? pdfModule;
      const pdfData = await pdfParse(buffer, { pagerender: pageRenderTextOnly });
      resumeText = pdfData.text;
    } else if (pastedText) {
      resumeText = pastedText;
    } else {
      return NextResponse.json({ error: "No file or text provided." }, { status: 400 });
    }

    if (!resumeText.trim()) {
      return NextResponse.json({ error: "Could not extract text from the file." }, { status: 422 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: `You are a resume parser. Extract all information from this resume text and return
ONLY a valid JSON object matching this exact structure. No markdown, no explanation, pure JSON only.

{
  "personalInfo": { "name": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "summary": "" },
  "experience": [{ "role": "", "company": "", "location": "", "startDate": "", "endDate": "", "bullets": [""] }],
  "education": [{ "degree": "", "institution": "", "year": "", "grade": "" }],
  "skills": [{ "name": "", "level": 1 }],
  "certifications": [{ "name": "", "issuer": "", "year": "" }],
  "tools": [""],
  "achievements": [{ "metric": "", "label": "" }],
  "languages": [""]
}

Rules:
- For skills, infer level 1-5 based on context (mentioned as "expert" = 5, "proficient" = 4, "familiar" = 2)
- For bullets, keep them exactly as written but clean formatting artifacts
- If a field is missing, use empty string or empty array
- achievements: extract any quantified results (e.g. "reduced by 40%" → metric: "40%", label: "reduction")
- Return ONLY the JSON, nothing else`,
      messages: [{ role: "user", content: `Parse this resume:\n\n${resumeText}` }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const resumeData = parseResumeJson(raw);

    return NextResponse.json({ resumeData });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Resume parse error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
