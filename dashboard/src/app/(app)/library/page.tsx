"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  FileText, Download, Copy, Check, X, ChevronDown,
  Upload, Loader2, CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  ManualTestTable, ProviderBadge, TestTypeBadge,
  downloadFile, getDownloadContent, getFileExt, getFileMime,
} from "@/lib/test-output";
import { downloadPDF, downloadExcel } from "@/lib/download-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type TestCase = {
  id: string;
  title: string;
  description: string;
  framework: string;
  test_type: string;
  result: string;
  provider: string | null;
  created_at: string;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

const TYPE_FILTERS = ["All", "manual", "bdd", "playwright", "api"] as const;
type Filter = (typeof TYPE_FILTERS)[number];

// ─── Draggable Sheet ──────────────────────────────────────────────────────────

function DraggableSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [width, setWidth] = useState(760);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startW.current = width;
    e.preventDefault();

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startX.current - ev.clientX;
      setWidth(Math.max(380, Math.min(window.innerWidth - 64, startW.current + delta)));
    };
    const onUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [width]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl"
        style={{ width }}
      >
        {/* Drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize bg-transparent hover:bg-violet-400 transition-colors group"
          title="Drag to resize"
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-violet-500" />
            ))}
          </div>
        </div>
        {children}
      </div>
    </>
  );
}

// ─── Download dropdown ────────────────────────────────────────────────────────

function DownloadMenu({ type, text, title }: { type: string; text: string; title: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const ext = getFileExt(type);
  const mime = getFileMime(type);
  const slug = title.slice(0, 30).replace(/\s+/g, "_").toLowerCase();

  return (
    <div ref={ref} className="relative">
      <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setOpen((o) => !o)}>
        <Download className="h-3 w-3" />
        Download
        <ChevronDown className="h-3 w-3" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            onClick={() => { downloadFile(getDownloadContent(type, text), `${slug}.${ext}`, mime); setOpen(false); }}
          >
            <FileText className="h-3.5 w-3.5 text-gray-400" />
            {type === "manual" ? "JSON" : type === "bdd" ? ".feature" : ".ts"} file
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            onClick={() => { downloadPDF(type, text, title); setOpen(false); }}
          >
            <FileText className="h-3.5 w-3.5 text-red-400" />
            PDF
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            onClick={() => { downloadExcel(type, text, title); setOpen(false); }}
          >
            <FileText className="h-3.5 w-3.5 text-green-500" />
            Excel (.xlsx)
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { user } = useUser();
  const [items, setItems]       = useState<TestCase[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<Filter>("All");
  const [selected, setSelected] = useState<TestCase | null>(null);
  const [copied, setCopied]     = useState(false);

  // Zephyr upload state
  const [zephyrState, setZephyrState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [zephyrMsg, setZephyrMsg]     = useState("");

  // JIRA upload state
  const [jiraUpState, setJiraUpState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [jiraUpMsg, setJiraUpMsg]     = useState("");
  const [jiraUpKey, setJiraUpKey]     = useState("");

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("test_cases")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(200);
      setItems(data ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  const filtered =
    filter === "All"
      ? items
      : items.filter((i) => (i.test_type ?? i.framework ?? "").toLowerCase() === filter);

  async function copyResult() {
    if (!selected?.result) return;
    await navigator.clipboard.writeText(selected.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function uploadToZephyr() {
    if (!selected) return;
    const zephyrToken   = localStorage.getItem("zephyr_token") ?? "";
    const projectKey    = localStorage.getItem("zephyr_project") ?? "";

    if (!zephyrToken || !projectKey) {
      setZephyrMsg("Add Zephyr credentials in Settings first.");
      setZephyrState("error");
      return;
    }

    setZephyrState("loading");
    setZephyrMsg("");

    const type  = (selected.test_type ?? selected.framework ?? "playwright").toLowerCase();
    const res   = await fetch("/api/zephyr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zephyrToken,
        projectKey,
        testCases: [{ title: selected.title, type, result: selected.result }],
      }),
    });

    const data = await res.json();
    if (data.allOk) {
      const id = data.results?.[0]?.id;
      setZephyrState("ok");
      setZephyrMsg(`Uploaded to Zephyr${id ? ` as ${id}` : ""}`);
    } else {
      setZephyrState("error");
      setZephyrMsg(data.results?.[0]?.error ?? "Upload failed");
    }
  }

  async function uploadToJira() {
    if (!selected) return;
    const jiraUrl    = localStorage.getItem("jira_url")    ?? "";
    const email      = localStorage.getItem("jira_email")  ?? "";
    const token      = localStorage.getItem("jira_token")  ?? "";
    const projectKey = localStorage.getItem("jira_project") ?? "";

    if (!jiraUrl || !email || !token || !projectKey) {
      setJiraUpMsg("Add JIRA credentials + project key in Settings first.");
      setJiraUpState("error");
      return;
    }

    setJiraUpState("loading");
    setJiraUpMsg("");
    setJiraUpKey("");
    const type = (selected.test_type ?? selected.framework ?? "playwright").toLowerCase();

    const res = await fetch("/api/jira/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jiraUrl, email, token, projectKey,
        testCases: [{ title: selected.title, type, result: selected.result }],
      }),
    });

    const data = await res.json();
    if (data.allOk) {
      const r = data.results?.[0];
      setJiraUpState("ok");
      setJiraUpKey(r?.key ?? "");
      setJiraUpMsg(`Created ${r?.key ?? "issue"} in JIRA`);
    } else {
      setJiraUpState("error");
      setJiraUpMsg(data.results?.[0]?.error ?? "Upload failed");
    }
  }

  function openSelected(tc: TestCase) {
    setSelected(tc);
    setZephyrState("idle");
    setZephyrMsg("");
    setJiraUpState("idle");
    setJiraUpMsg("");
    setJiraUpKey("");
    setCopied(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            All your saved test cases — click any row to view, download, or upload to Zephyr.
          </p>
        </div>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
          {loading ? "…" : `${items.length} saved`}
        </span>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "All" ? "All types" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "All" && (
              <span className="ml-1 opacity-60">
                ({items.filter((i) => (i.test_type ?? i.framework ?? "").toLowerCase() === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">
            {filter === "All" ? "All test cases" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} tests`}
            <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {loading && <div className="px-6 py-10 text-center text-sm text-gray-400">Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-gray-400">No saved test cases yet.</div>
          )}
          {filtered.map((tc) => {
            const type = (tc.test_type ?? tc.framework ?? "").toLowerCase();
            return (
              <button
                key={tc.id}
                onClick={() => openSelected(tc)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-violet-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{tc.title || "Untitled"}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{timeAgo(tc.created_at)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ProviderBadge provider={tc.provider} />
                  <TestTypeBadge type={type || tc.framework || "?"} />
                  <span className="ml-2 text-xs text-violet-500 font-medium">View →</span>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Draggable detail sheet */}
      <DraggableSheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && (() => {
          const type = (selected.test_type ?? selected.framework ?? "playwright").toLowerCase();
          return (
            <div className="flex h-full flex-col">
              {/* Sheet header */}
              <div className="border-b px-6 py-4 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                      {selected.title || "Untitled"}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <TestTypeBadge type={type} />
                      <ProviderBadge provider={selected.provider} />
                      <span className="text-xs text-gray-400">{timeAgo(selected.created_at)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Actions row */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={copyResult}>
                    {copied ? <><Check className="h-3 w-3 text-green-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </Button>

                  <DownloadMenu type={type} text={selected.result} title={selected.title || "test"} />

                  {/* JIRA upload */}
                  <Button
                    size="sm"
                    variant="outline"
                    className={`gap-1.5 text-xs ${
                      jiraUpState === "ok" ? "border-blue-300 text-blue-700" :
                      jiraUpState === "error" ? "border-red-300 text-red-600" : ""
                    }`}
                    onClick={uploadToJira}
                    disabled={jiraUpState === "loading"}
                  >
                    {jiraUpState === "loading" && <Loader2 className="h-3 w-3 animate-spin" />}
                    {jiraUpState === "ok" && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                    {(jiraUpState === "idle" || jiraUpState === "error") && <Upload className="h-3 w-3" />}
                    {jiraUpState === "loading" ? "Uploading…" :
                     jiraUpState === "ok"      ? "In JIRA" :
                                                 "Upload to JIRA"}
                  </Button>

                  {/* Zephyr upload */}
                  <Button
                    size="sm"
                    variant="outline"
                    className={`gap-1.5 text-xs ${
                      zephyrState === "ok" ? "border-green-300 text-green-700" :
                      zephyrState === "error" ? "border-red-300 text-red-600" : ""
                    }`}
                    onClick={uploadToZephyr}
                    disabled={zephyrState === "loading"}
                  >
                    {zephyrState === "loading" && <Loader2 className="h-3 w-3 animate-spin" />}
                    {zephyrState === "ok" && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                    {(zephyrState === "idle" || zephyrState === "error") && <Upload className="h-3 w-3" />}
                    {zephyrState === "loading" ? "Uploading…" :
                     zephyrState === "ok"      ? "Uploaded" :
                                                 "Upload to Zephyr"}
                  </Button>
                </div>

                {/* JIRA status message */}
                {jiraUpMsg && (
                  <p className={`mt-2 text-xs ${jiraUpState === "ok" ? "text-blue-600" : "text-red-500"}`}>
                    {jiraUpMsg}
                    {jiraUpState === "ok" && jiraUpKey && (
                      <a href={`${localStorage.getItem("jira_url") ?? ""}/browse/${jiraUpKey}`}
                        target="_blank" rel="noopener noreferrer"
                        className="ml-1 font-mono font-semibold underline">
                        {jiraUpKey} →
                      </a>
                    )}
                    {jiraUpState === "error" && jiraUpMsg.includes("Settings") && (
                      <a href="/settings" className="ml-1 underline">Go to Settings →</a>
                    )}
                  </p>
                )}

                {/* Zephyr status message */}
                {zephyrMsg && (
                  <p className={`mt-2 text-xs ${zephyrState === "ok" ? "text-green-600" : "text-red-500"}`}>
                    {zephyrMsg}
                    {zephyrState === "error" && zephyrMsg.includes("Settings") && (
                      <a href="/settings" className="ml-1 underline">Go to Settings →</a>
                    )}
                  </p>
                )}

                {/* Resize hint */}
                <p className="mt-2 text-[11px] text-gray-400">← Drag left edge to resize panel</p>
              </div>

              {/* Sheet body */}
              <div className="flex-1 overflow-y-auto p-6">
                {type === "manual" ? (
                  <ManualTestTable text={selected.result} />
                ) : (
                  <pre className="rounded-lg bg-gray-950 p-4 text-xs leading-relaxed text-green-400 font-mono whitespace-pre-wrap">
                    {selected.result.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim()}
                  </pre>
                )}
              </div>
            </div>
          );
        })()}
      </DraggableSheet>
    </div>
  );
}
