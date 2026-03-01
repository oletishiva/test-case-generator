import { NextRequest, NextResponse } from "next/server";

// Converts Atlassian Document Format (ADF) to plain text
function adfToText(node: Record<string, unknown>): string {
  if (!node) return "";
  if (node.type === "text") return (node.text as string) ?? "";
  const content = (node.content as Record<string, unknown>[]) ?? [];
  const childText = content.map(adfToText).join("");
  if (node.type === "paragraph") return childText + "\n";
  if (node.type === "bulletList" || node.type === "orderedList") return childText;
  if (node.type === "listItem") return "- " + childText;
  if (node.type === "heading") return childText + "\n";
  return childText;
}

export async function POST(req: NextRequest) {
  const { jiraUrl, email, token, issueKey } = await req.json();

  if (!jiraUrl || !email || !token || !issueKey) {
    return NextResponse.json({ error: "Missing JIRA credentials or issue key" }, { status: 400 });
  }

  const base = jiraUrl.replace(/\/$/, "");
  const credentials = Buffer.from(`${email}:${token}`).toString("base64");

  const res = await fetch(`${base}/rest/api/3/issue/${issueKey}`, {
    headers: {
      Authorization: `Basic ${credentials}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `JIRA error: ${res.status} — ${err}` }, { status: res.status });
  }

  const data = await res.json();
  const fields = data.fields ?? {};

  const summary = fields.summary ?? issueKey;

  // Description may be ADF object or plain string
  let description = "";
  if (typeof fields.description === "string") {
    description = fields.description;
  } else if (fields.description?.content) {
    description = adfToText(fields.description).trim();
  }

  // Acceptance criteria — often stored in a custom field
  const acField =
    fields.customfield_10016 ??      // Zephyr AC field
    fields.customfield_10014 ??      // common AC field
    fields.customfield_10001 ?? null;

  let acceptanceCriteria = "";
  if (typeof acField === "string") {
    acceptanceCriteria = acField;
  } else if (acField?.content) {
    acceptanceCriteria = adfToText(acField).trim();
  }

  const fullDescription = [
    `Story: ${issueKey} — ${summary}`,
    description ? `\nDescription:\n${description}` : "",
    acceptanceCriteria ? `\nAcceptance Criteria:\n${acceptanceCriteria}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return NextResponse.json({ summary, description: fullDescription });
}
