// Shared test output rendering utilities used by test-cases page and library page

// ─── Markdown table parser ────────────────────────────────────────────────────

export function parseMarkdownTable(text: string): { headers: string[]; rows: string[][] } | null {
  const cleaned = text.replace(/```[a-z]*\n?/gi, "").trim();
  const lines = cleaned.split("\n");
  const tableLines = lines.filter((l) => l.trim().startsWith("|"));
  if (tableLines.length < 2) return null;

  const parseCells = (line: string) =>
    line.split("|").slice(1, -1).map((c) => c.trim());

  const isSeparator = (line: string) => /^\|[\s|:-]+\|$/.test(line.trim());

  const [headerLine, ...rest] = tableLines;
  const dataLines = rest.filter((l) => !isSeparator(l));

  return {
    headers: parseCells(headerLine),
    rows: dataLines.map(parseCells),
  };
}

// ─── Download helper ──────────────────────────────────────────────────────────

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getDownloadContent(type: string, text: string): string {
  if (type === "manual") {
    const parsed = parseMarkdownTable(text);
    if (parsed) {
      const { headers, rows } = parsed;
      const json = rows.map((row) =>
        Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]))
      );
      return JSON.stringify(json, null, 2);
    }
    return text;
  }
  return text.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim();
}

export function getFileExt(type: string): string {
  if (type === "manual") return "json";
  if (type === "bdd") return "feature";
  if (type === "api") return "api.spec.ts";
  return "spec.ts";
}

export function getFileMime(type: string): string {
  if (type === "manual") return "application/json";
  if (type === "bdd") return "text/plain";
  return "text/typescript";
}

// ─── Badge components ─────────────────────────────────────────────────────────

export function PriorityBadge({ value }: { value: string }) {
  const v = value.toUpperCase();
  if (v.includes("CRITICAL"))
    return <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold bg-red-100 text-red-700">CRITICAL</span>;
  if (v.includes("HIGH"))
    return <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold bg-orange-100 text-orange-700">HIGH</span>;
  if (v.includes("MEDIUM"))
    return <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold bg-yellow-100 text-yellow-700">MEDIUM</span>;
  return <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold bg-green-100 text-green-700">LOW</span>;
}

export function TypeBadge({ value }: { value: string }) {
  const v = value.toUpperCase();
  if (v.includes("NEGATIVE"))
    return <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">NEGATIVE</span>;
  if (v.includes("EDGE"))
    return <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold bg-orange-50 text-orange-600 border border-orange-200">EDGE</span>;
  return <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold bg-green-50 text-green-600 border border-green-200">POSITIVE</span>;
}

export function LevelBadge({ value }: { value: string }) {
  const v = value.toUpperCase();
  const base = "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold border";
  if (v.includes("E2E"))         return <span className={`${base} bg-violet-50 text-violet-600 border-violet-200`}>E2E</span>;
  if (v.includes("UNIT"))        return <span className={`${base} bg-blue-50 text-blue-600 border-blue-200`}>UNIT</span>;
  if (v.includes("INTEGRATION")) return <span className={`${base} bg-teal-50 text-teal-600 border-teal-200`}>INTEGRATION</span>;
  if (v.includes("API"))         return <span className={`${base} bg-cyan-50 text-cyan-600 border-cyan-200`}>API</span>;
  return <span className={`${base} bg-gray-50 text-gray-600 border-gray-200`}>{value}</span>;
}

export function renderCell(header: string, value: string) {
  const h = header.toLowerCase();
  if (h.includes("priority")) return <PriorityBadge value={value} />;
  if (h.includes("type"))     return <TypeBadge value={value} />;
  if (h.includes("level"))    return <LevelBadge value={value} />;
  if (h.includes("step")) {
    const steps = value.split(/;\s*|\n/).filter(Boolean);
    return (
      <ol className="list-decimal list-inside space-y-0.5 text-xs text-gray-600">
        {steps.map((s, i) => <li key={i}>{s.replace(/^\d+\.\s*/, "")}</li>)}
      </ol>
    );
  }
  return <span className="text-xs text-gray-700">{value}</span>;
}

// ─── Manual test table ────────────────────────────────────────────────────────

export function ManualTestTable({ text }: { text: string }) {
  const parsed = parseMarkdownTable(text);

  if (!parsed) {
    return (
      <pre className="max-h-[520px] overflow-y-auto rounded-lg bg-gray-950 p-4 text-xs leading-relaxed text-green-400 font-mono whitespace-pre-wrap">
        {text}
      </pre>
    );
  }

  const { headers, rows } = parsed;

  const isNegative = (row: string[]) => {
    const typeIdx = headers.findIndex((h) => h.toLowerCase().includes("type"));
    if (typeIdx === -1) return false;
    return row[typeIdx]?.toUpperCase().includes("NEGATIVE");
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Generated Test Cases ({rows.length} total)
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="w-8 px-3 py-2 text-left text-xs font-semibold text-gray-500">#</th>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-gray-100 last:border-0 ${
                isNegative(row) ? "border-l-4 border-l-red-400" : "border-l-4 border-l-green-400"
              }`}
            >
              <td className="px-3 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
              {headers.map((h, j) => (
                <td key={j} className="px-3 py-3 align-top">
                  {renderCell(h, row[j] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Provider badge ───────────────────────────────────────────────────────────

export function ProviderBadge({ provider }: { provider?: string | null }) {
  if (!provider) return null;
  if (provider === "anthropic") return <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">Claude</span>;
  if (provider === "openai")    return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">GPT-4o</span>;
  if (provider === "gemini")    return <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Gemini</span>;
  return null;
}

// ─── Type label badge ─────────────────────────────────────────────────────────

export function TestTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    manual:     "bg-amber-100 text-amber-700",
    bdd:        "bg-teal-100 text-teal-700",
    playwright: "bg-violet-100 text-violet-700",
    api:        "bg-cyan-100 text-cyan-700",
  };
  const cls = colors[type.toLowerCase()] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {type.toUpperCase()}
    </span>
  );
}
