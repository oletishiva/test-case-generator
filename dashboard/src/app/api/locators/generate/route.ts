import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { LocatorService, type LocatorServiceOptions } from "@/lib/locatorService";

export const dynamic = "force-dynamic";

/* ── HTML sanitiser (strips scripts/styles/comments, guards size) ── */
function sanitiseHtml(html: string, maxLen = 400_000): string {
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  if (out.length > maxLen) out = out.slice(0, maxLen);
  return out;
}

/* ── Fetch URL server-side ── */
async function fetchUrl(rawUrl: string): Promise<string> {
  const url = new URL(rawUrl); // throws if invalid
  const resp = await fetch(url.toString(), {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
    },
  });
  if (!resp.ok) throw new Error(`Failed to fetch URL (HTTP ${resp.status})`);
  return sanitiseHtml(await resp.text());
}

/* ── LLM providers ── */
async function withGemini(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  const delays = [500, 1500, 3000];

  for (const modelName of models) {
    for (let attempt = 0; attempt < delays.length; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { maxOutputTokens: 8192, temperature: 0.1 },
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
        if (isOverloaded) break; // try next model
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
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });
  const c = msg.content[0];
  return c.type === "text" ? c.text : "";
}

async function withOpenAI(prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0]?.message?.content ?? "";
}

/* ── POST handler ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      inputType = "html",
      content = "",
      preferredStrategy = "role",
      framework = "playwright",
      groupIntoPOM = true,
      language = "typescript",
      includeActions = true,
      includeDynamicLocators = false,
      ignoreSections = "",
    } = body as {
      inputType: "html" | "url" | "describe";
      content: string;
      preferredStrategy: string;
      framework: string;
      groupIntoPOM: boolean;
      language: string;
      includeActions: boolean;
      includeDynamicLocators: boolean;
      ignoreSections: string;
    };

    if (!content.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    /* Resolve final input text */
    let finalInput = content;
    if (inputType === "url") {
      try {
        finalInput = await fetchUrl(content.trim());
      } catch (err) {
        return NextResponse.json(
          { error: `Unable to fetch URL: ${err instanceof Error ? err.message : String(err)}` },
          { status: 400 }
        );
      }
    }

    /* Provider fallback chain */
    const providers: { name: string; fn: (p: string) => Promise<string> }[] = [
      { name: "gemini", fn: withGemini },
      { name: "anthropic", fn: withAnthropic },
      { name: "openai", fn: withOpenAI },
    ];

    const errors: Record<string, string> = {};

    for (const { name, fn } of providers) {
      try {
        const service = new LocatorService(fn);
        const code = await service.generate(finalInput, {
          preferredStrategy: preferredStrategy as LocatorServiceOptions["preferredStrategy"],
          framework: framework as LocatorServiceOptions["framework"],
          groupIntoPOM,
          language: language as LocatorServiceOptions["language"],
          includeActions,
          includeDynamicLocators,
          ignoreSections,
        });
        if (!code.trim()) throw new Error("Empty result");
        console.log(`✓ Locators generated with ${name}`);
        return NextResponse.json({ code, provider: name, framework });
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
    console.error("Locators generate error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
