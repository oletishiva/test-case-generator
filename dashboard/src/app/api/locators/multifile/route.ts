import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { LocatorService } from "@/lib/locatorService";

export const dynamic = "force-dynamic";

function sanitiseHtml(html: string, maxLen = 400_000): string {
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  if (out.length > maxLen) out = out.slice(0, maxLen);
  return out;
}

async function withGemini(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  const delays = [500, 1500, 3000];
  for (const modelName of models) {
    for (let attempt = 0; attempt < delays.length; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { maxOutputTokens: 16384, temperature: 0.1 },
        });
        const result = await model.generateContent(prompt);
        const text = result?.response?.text?.() ?? "";
        if (!text) throw new Error("Empty response from Gemini");
        return text;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const isOverloaded = /overloaded|unavailable|503/i.test(msg);
        if (isOverloaded && attempt < delays.length - 1) {
          await new Promise((r) => setTimeout(r, delays[attempt]));
          continue;
        }
        if (isOverloaded) break;
        throw err;
      }
    }
  }
  throw new Error("Gemini temporarily unavailable");
}

async function withAnthropic(prompt: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 16384,
    messages: [{ role: "user", content: prompt }],
  });
  const c = msg.content[0];
  return c.type === "text" ? c.text : "";
}

async function withOpenAI(prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 16384,
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content = "", pageName = "GeneratedPage" } = body as {
      content: string;
      pageName: string;
    };

    if (!content.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const cleanedInput = sanitiseHtml(content);
    const cleanPageName = pageName.trim().replace(/\s+/g, "") || "GeneratedPage";

    const providers: { name: string; fn: (p: string) => Promise<string> }[] = [
      { name: "gemini",    fn: withGemini    },
      { name: "anthropic", fn: withAnthropic },
      { name: "openai",    fn: withOpenAI    },
    ];

    const errors: Record<string, string> = {};

    for (const { name, fn } of providers) {
      try {
        const service = new LocatorService(fn);
        const result = await service.generateMultiFile(cleanedInput, cleanPageName);
        console.log(`✓ Multi-file locators generated with ${name}`);
        return NextResponse.json({ ...result, provider: name, pageName: cleanPageName });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors[name] = msg;
        console.warn(`✗ ${name} failed: ${msg}`);
      }
    }

    return NextResponse.json(
      { error: "All providers failed", details: errors },
      { status: 500 }
    );
  } catch (err) {
    console.error("Multi-file locators error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
