import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

type Provider = "anthropic" | "openai" | "gemini";

async function generateWithAnthropic(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });
  const content = message.content[0];
  return content.type === "text" ? content.text : "";
}

async function generateWithOpenAI(prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0]?.message?.content ?? "";
}

async function generateWithGemini(prompt: string): Promise<string> {
  const model = geminiAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

const providers: { name: Provider; fn: (p: string) => Promise<string> }[] = [
  { name: "gemini",    fn: generateWithGemini },
  { name: "openai",    fn: generateWithOpenAI },
  { name: "anthropic", fn: generateWithAnthropic },
];

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  for (const { name, fn } of providers) {
    try {
      const result = await fn(prompt);
      console.log(`✓ Generated with ${name}`);
      return NextResponse.json({ result, provider: name });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`✗ ${name} failed: ${msg} — trying next provider...`);
    }
  }

  return NextResponse.json(
    { error: "All AI providers failed. Please try again later." },
    { status: 500 }
  );
}
