import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type FieldDef = { name: string; type: string; options?: string };

/* ── Prompt builders ──────────────────────────────────────── */

function buildFieldsPrompt(
  fields: FieldDef[],
  rowCount: number,
  locale: string,
  domain: string,
  includeEdgeCases: boolean
): string {
  return `You are a test data generator. Generate exactly ${rowCount} rows of realistic test data as a JSON array.

Fields to generate:
${fields.map((f) => `- "${f.name}": ${f.type}${f.options ? ` (options: ${f.options})` : ""}`).join("\n")}

Requirements:
1. Return ONLY a valid JSON array with exactly ${rowCount} objects. No markdown, no code blocks, no explanation.
2. Each object must have exactly all the listed field names as keys.
3. Generate realistic, contextually consistent data (city matches country, IBAN format is country-specific, bank names are real banks, phone numbers match country format).
4. Locale: ${locale} — use appropriate formats for phone, date, currency, address.
5. Domain context: ${domain || "general"}
6. Ensure variety — do not repeat the same values row to row.
${includeEdgeCases ? "7. Include 2–3 rows with edge cases: null, empty string, max-length values, special unicode characters (ünïcödé), boundary numbers." : "7. All values must be valid, realistic data."}

Field type notes:
- IBAN: valid format for locale country (e.g. GB for UK, DE for Germany, US accounts use routing+account)
- SWIFT/BIC: real 8 or 11 char bank codes
- Date / Date of Birth: ISO 8601 (YYYY-MM-DD)
- Currency Amount: number with 2 decimal places as string e.g. "1250.00"
- Boolean: true or false
- UUID: valid UUID v4 format
- Phone/Mobile: formatted with country code for the locale
- Custom / Constant / From List: use the options provided

Return only: [{"${fields[0]?.name || "id"}": "value", ...}, ...]`;
}

function buildDescribePrompt(
  description: string,
  rowCount: number,
  locale: string,
  includeEdgeCases: boolean
): string {
  return `You are a test data generator. Based on the description below, infer the necessary fields and generate exactly ${rowCount} rows of realistic test data as a JSON array.

Description: "${description}"

Requirements:
1. Return ONLY a valid JSON array with exactly ${rowCount} objects. No markdown, no code blocks, no explanation.
2. Infer sensible, descriptive field names (snake_case) from the description.
3. Generate realistic, contextually consistent data.
4. Locale: ${locale} — use appropriate formats.
${includeEdgeCases ? "5. Include 2–3 rows with edge cases: null, empty string, special characters, boundary values." : "5. All values must be valid, realistic data."}

Return only the JSON array.`;
}

function buildSchemaPrompt(
  schema: string,
  rowCount: number,
  locale: string,
  includeEdgeCases: boolean
): string {
  return `You are a test data generator. Parse the schema below and generate exactly ${rowCount} rows of realistic test data as a JSON array.

Schema:
${schema}

Requirements:
1. Return ONLY a valid JSON array with exactly ${rowCount} objects. No markdown, no code blocks, no explanation.
2. Parse the schema (JSON Schema, SQL CREATE TABLE, TypeScript interface, or plain field list — whatever is provided).
3. Use the exact field names from the schema.
4. Respect constraints: data types, min/max, required, enums, patterns.
5. Generate realistic, contextually consistent data.
6. Locale: ${locale}
${includeEdgeCases ? "7. Include 2–3 rows with edge cases." : ""}

Return only the JSON array.`;
}

/* ── Provider functions (reuse pattern from /api/generate) ── */

async function withGemini(prompt: string): Promise<string> {
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function withOpenAI(prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0]?.message?.content ?? "";
}

async function withAnthropic(prompt: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  const c = msg.content[0];
  return c.type === "text" ? c.text : "";
}

function safeParseJSON(text: string): unknown[] {
  // Strip markdown code fences if present
  const stripped = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    const parsed = JSON.parse(stripped);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const match = stripped.match(/\[[\s\S]*\]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    return [];
  }
}

/* ── Main handler ─────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fields = [],
      rowCount = 10,
      locale = "en-US",
      domain = "general",
      includeEdgeCases = false,
      inputMode = "build",
      description = "",
      schema = "",
    } = body;

    let prompt: string;
    if (inputMode === "describe") {
      prompt = buildDescribePrompt(description, rowCount, locale, includeEdgeCases);
    } else if (inputMode === "schema") {
      prompt = buildSchemaPrompt(schema, rowCount, locale, includeEdgeCases);
    } else {
      prompt = buildFieldsPrompt(fields, rowCount, locale, domain, includeEdgeCases);
    }

    const providers = [
      { name: "gemini", fn: withGemini },
      { name: "openai", fn: withOpenAI },
      { name: "anthropic", fn: withAnthropic },
    ];

    const errors: Record<string, string> = {};
    for (const { name, fn } of providers) {
      try {
        const raw = await fn(prompt);
        const data = safeParseJSON(raw);
        if (data.length === 0) throw new Error("Empty result");
        console.log(`✓ TestData generated with ${name}`);
        return NextResponse.json({ data, provider: name });
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
    console.error("TestData generate error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
