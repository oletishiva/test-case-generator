import { NextRequest, NextResponse } from "next/server";

type TestCase = { title: string; type: string; result: string };

function buildIssueBody(tc: TestCase, projectKey: string) {
  const clean = tc.result.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim();
  const label = tc.type.charAt(0).toUpperCase() + tc.type.slice(1);

  return {
    fields: {
      project: { key: projectKey },
      summary: tc.title.slice(0, 120),
      issuetype: { name: "Task" },
      labels: ["auto-generated-test", "AITestCraft", label],
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Generated ${label} test case by AITestCraft`,
                marks: [{ type: "strong" }],
              },
            ],
          },
          {
            type: "codeBlock",
            attrs: { language: tc.type === "bdd" ? "gherkin" : "typescript" },
            content: [{ type: "text", text: clean.slice(0, 30000) }],
          },
        ],
      },
    },
  };
}

export async function POST(req: NextRequest) {
  const { jiraUrl, email, token, projectKey, testCases } = await req.json();

  if (!jiraUrl || !email || !token || !projectKey || !Array.isArray(testCases) || testCases.length === 0) {
    return NextResponse.json({ error: "Missing JIRA credentials, project key, or test cases" }, { status: 400 });
  }

  const base = jiraUrl.replace(/\/$/, "");
  const credentials = Buffer.from(`${email}:${token}`).toString("base64");

  const results: { title: string; status: "ok" | "error"; key?: string; url?: string; error?: string }[] = [];

  for (const tc of testCases as TestCase[]) {
    const body = buildIssueBody(tc, projectKey);

    const res = await fetch(`${base}/rest/api/3/issue`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      results.push({
        title: tc.title,
        status: "ok",
        key: data.key,
        url: `${base}/browse/${data.key}`,
      });
    } else {
      const err = await res.text();
      results.push({ title: tc.title, status: "error", error: err.slice(0, 300) });
    }
  }

  const allOk = results.every((r) => r.status === "ok");
  return NextResponse.json({ results, allOk }, { status: allOk ? 200 : 207 });
}
