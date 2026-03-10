"use client";

import { useEffect, useState } from "react";
import {
  Briefcase, Plus, MapPin, Globe, X, Loader2,
  AlertCircle, CheckCircle2,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  experience_level: string;
  location: string | null;
  remote: boolean;
  status: "draft" | "active" | "closed";
  required_skills: string[];
  created_at: string;
};

const EXPERIENCE_LEVELS = ["junior", "mid", "senior", "lead"];
const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  draft:  "bg-slate-700 text-slate-400 border-slate-600",
  closed: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", requiredSkills: [] as string[],
    skillInput: "", experienceLevel: "mid", location: "", remote: true, status: "draft",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/recruiter/jobs")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function addSkill() {
    const s = form.skillInput.trim();
    if (!s || form.requiredSkills.includes(s)) return;
    setForm((p) => ({ ...p, requiredSkills: [...p.requiredSkills, s], skillInput: "" }));
  }

  async function createJob(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/recruiter/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          requiredSkills: form.requiredSkills,
          experienceLevel: form.experienceLevel,
          location: form.location,
          remote: form.remote,
          status: form.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      // Refresh list
      const updated = await fetch("/api/recruiter/jobs").then((r) => r.json());
      setJobs(updated.jobs ?? []);
      setShowForm(false);
      setForm({ title: "", description: "", requiredSkills: [], skillInput: "", experienceLevel: "mid", location: "", remote: true, status: "draft" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Postings</h1>
          <p className="text-slate-400 text-sm mt-1">Post QA roles and link them to assessments.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Post a Job
        </button>
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">New Job Posting</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createJob} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Job title *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Senior QA Automation Engineer"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Role overview, responsibilities…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Experience level *</label>
                  <select value={form.experienceLevel} onChange={(e) => setForm((p) => ({ ...p, experienceLevel: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white capitalize focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l} className="capitalize">{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="San Francisco, CA"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input type="checkbox" checked={form.remote} onChange={(e) => setForm((p) => ({ ...p, remote: e.target.checked }))}
                      className="w-4 h-4 rounded accent-emerald-500" />
                    <span className="text-sm text-slate-300">Remote OK</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Required skills</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={form.skillInput} onChange={(e) => setForm((p) => ({ ...p, skillInput: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="e.g. Playwright"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <button type="button" onClick={addSkill} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">Add</button>
                </div>
                {form.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.requiredSkills.map((s) => (
                      <span key={s} className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                        {s}
                        <button type="button" onClick={() => setForm((p) => ({ ...p, requiredSkills: p.requiredSkills.filter((x) => x !== s) }))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={saving || !form.title.trim()} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="w-4 h-4" /> Create Job</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <div className="text-slate-400 font-medium">No jobs posted yet</div>
          <p className="text-slate-600 text-sm mt-1">Create your first job posting to attract QA talent.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">{j.title}</span>
                    <span className={`text-xs rounded-full px-2 py-0.5 border capitalize ${STATUS_COLORS[j.status]}`}>{j.status}</span>
                    <span className="text-xs text-slate-500 capitalize bg-slate-800 rounded-full px-2 py-0.5">{j.experience_level}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    {j.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {j.location}</span>}
                    {j.remote && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Remote</span>}
                  </div>
                  {j.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {j.required_skills.slice(0, 5).map((s) => (
                        <span key={s} className="text-xs bg-slate-800 text-slate-400 rounded-full px-2 py-0.5">{s}</span>
                      ))}
                      {j.required_skills.length > 5 && <span className="text-xs text-slate-600">+{j.required_skills.length - 5}</span>}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-600 flex-shrink-0">
                  {new Date(j.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
