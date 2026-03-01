import { NextRequest, NextResponse } from "next/server";
import { parseMarkdownTable } from "@/lib/test-output";

type ZephyrStep = { description: string; expectedResult: string };

function manualToSteps(text: string): ZephyrStep[] {
  const parsed = parseMarkdownTable(text);
  if (!parsed) return [{ description: text.slice(0, 500), expectedResult: "" }];

  const { headers, rows } = parsed;
  const stepsIdx   = headers.findIndex((h) => h.toLowerCase().includes("step"));
  const expectIdx  = headers.findIndex((h) => h.toLowerCase().includes("expected") || h.toLowerCase().includes("result"));

  return rows.map((row) => ({
    description:    stepsIdx  !== -1 ? row[stepsIdx]  ?? "" : row.join(" | "),
    expectedResult: expectIdx !== -1 ? row[expectIdx] ?? "" : "",
  }));
}

function codeToSteps(text: string, type: string): ZephyrStep[] {
  const clean = text.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim();
  return [
    {
      description: `Execute the ${type.toUpperCase()} test script below:\n\n${clean.slice(0, 3000)}`,
      expectedResult: "All assertions pass and tests complete without errors.",
    },
  ];
}

export async function POST(req: NextRequest) {
  const { zephyrToken, projectKey, testCases } = await req.json();
  // testCases: Array<{ title: string; type: string; result: string }>

  if (!zephyrToken || !projectKey || !Array.isArray(testCases) || testCases.length === 0) {
    return NextResponse.json({ error: "Missing Zephyr token, project key, or test cases" }, { status: 400 });
  }

  const results: { title: string; status: "ok" | "error"; id?: string; error?: string }[] = [];

  for (const tc of testCases) {
    const steps =
      tc.type === "manual"
        ? manualToSteps(tc.result)
        : codeToSteps(tc.result, tc.type);

    const body = {
      projectKey,
      name: tc.title.slice(0, 120),
      status: { id: "Draft" },
      testScript: {
        type: "STEP_BY_STEP",
        steps: steps.map((s) => ({
          description: s.description.slice(0, 1000),
          expectedResult: s.expectedResult.slice(0, 500),
        })),
      },
    };

    const res = await fetch("https://api.zephyrscale.smartbear.com/v2/testcases", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${zephyrToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      results.push({ title: tc.title, status: "ok", id: data.key ?? data.id });
    } else {
      const err = await res.text();
      results.push({ title: tc.title, status: "error", error: err.slice(0, 200) });
    }
  }

  const allOk = results.every((r) => r.status === "ok");
  return NextResponse.json({ results, allOk }, { status: allOk ? 200 : 207 });
}
