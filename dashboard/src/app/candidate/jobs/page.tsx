"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Briefcase, Search, MapPin, Clock, ExternalLink,
  Loader2, AlertCircle, Globe, Building2, DollarSign,
  RefreshCw, Filter, ChevronLeft, ChevronRight,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  logo: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  isRemote: boolean;
  postedAt: string | null;
  applyLink: string;
  employmentType: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  requiredSkills: string[];
  description: string;
};

const TOPICS = [
  { label: "QA Automation", query: "QA automation engineer" },
  { label: "SDET", query: "SDET software development engineer in test" },
  { label: "Playwright", query: "Playwright test automation engineer" },
  { label: "Selenium", query: "Selenium test automation engineer" },
  { label: "API Testing", query: "API test automation engineer" },
  { label: "Performance QA", query: "performance testing engineer QA" },
];

const DATE_FILTERS = [
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
  { label: "All time", value: "all" },
];

const EMP_TYPES: Record<string, string> = {
  FULLTIME: "Full-time",
  PARTTIME: "Part-time",
  CONTRACTOR: "Contract",
  INTERN: "Internship",
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function formatSalary(min: number | null, max: number | null, currency: string | null, period: string | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  const sym = currency === "USD" ? "$" : currency ?? "";
  const range = min && max ? `${sym}${fmt(min)}–${sym}${fmt(max)}` : min ? `${sym}${fmt(min)}+` : `up to ${sym}${fmt(max!)}`;
  const per = period === "YEAR" ? "/yr" : period === "HOUR" ? "/hr" : period === "MONTH" ? "/mo" : "";
  return `${range}${per}`;
}

function CompanyLogo({ logo, company }: { logo: string | null; company: string }) {
  const [errored, setErrored] = useState(false);
  const initials = company.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  if (!logo || errored) {
    return (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300 font-bold text-sm">
        {initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={company}
      onError={() => setErrored(true)}
      className="w-12 h-12 rounded-xl object-contain bg-white p-1.5 border border-slate-700 flex-shrink-0"
    />
  );
}

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unconfigured, setUnconfigured] = useState(false);

  const [topicIdx, setTopicIdx] = useState(0);
  const [customQuery, setCustomQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [datePosted, setDatePosted] = useState("month");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeQuery = customQuery.trim() || TOPICS[topicIdx].query;

  const fetchJobs = useCallback(async (reset = false) => {
    setLoading(true);
    setError("");
    const p = reset ? 1 : page;
    if (reset) setPage(1);

    try {
      const params = new URLSearchParams({
        query: activeQuery,
        page: String(p),
        remote: String(remoteOnly),
        datePosted,
      });
      const res = await fetch(`/api/candidate/jobs?${params}`);
      const data = await res.json();
      if (data.unconfigured) { setUnconfigured(true); setJobs([]); return; }
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed");
      setJobs(data.jobs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [activeQuery, remoteOnly, datePosted, page]);

  useEffect(() => { fetchJobs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchJobs(true);
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">QA Job Board</h1>
            <p className="text-slate-400 text-xs mt-0.5">Live roles from LinkedIn, Indeed & Glassdoor — aggregated for QA professionals</p>
          </div>
        </div>
      </div>

      {/* ── Topic chips ────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TOPICS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => { setTopicIdx(i); setCustomQuery(""); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              topicIdx === i && !customQuery.trim()
                ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20"
                : "border-slate-700 text-slate-400 hover:border-emerald-500/50 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Search + filters ───────────────────────────── */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder={`Search: ${TOPICS[topicIdx].label}…`}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
        <button
          type="button"
          onClick={() => fetchJobs(true)}
          title="Refresh"
          className="flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white px-3 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </form>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </div>

        {/* Remote toggle */}
        <button
          onClick={() => { setRemoteOnly(!remoteOnly); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            remoteOnly
              ? "bg-teal-600/20 text-teal-400 border-teal-500/40"
              : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Remote Only
        </button>

        {/* Date posted */}
        <div className="flex gap-1">
          {DATE_FILTERS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDatePosted(d.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                datePosted === d.value
                  ? "bg-slate-700 text-white border-slate-600"
                  : "border-slate-800 text-slate-500 hover:text-white hover:border-slate-700"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── States ─────────────────────────────────────── */}
      {unconfigured && (
        <div className="text-center py-20 border border-dashed border-amber-500/30 rounded-2xl bg-amber-500/5">
          <Briefcase className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <div className="text-amber-400 font-semibold mb-2">Job Board API not configured</div>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            Add <code className="text-amber-400 bg-slate-800 px-1 rounded">RAPIDAPI_KEY</code> to your Vercel environment variables to enable live job listings from LinkedIn, Indeed & Glassdoor.
          </p>
          <a
            href="https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Get your free RapidAPI key <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {!unconfigured && error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {!unconfigured && loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-slate-500 text-sm">Fetching live jobs…</span>
        </div>
      )}

      {!unconfigured && !loading && !error && jobs.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-700 rounded-2xl">
          <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <div className="text-slate-400 font-medium">No jobs found</div>
          <p className="text-slate-600 text-sm mt-1">Try a different search term or expand the date range.</p>
        </div>
      )}

      {/* ── Job Cards ──────────────────────────────────── */}
      {!unconfigured && !loading && jobs.length > 0 && (
        <>
          <div className="text-xs text-slate-500 mb-4">{jobs.length} roles found</div>
          <div className="space-y-3">
            {jobs.map((job) => {
              const salary = formatSalary(job.minSalary, job.maxSalary, job.salaryCurrency, job.salaryPeriod);
              const empType = job.employmentType ? (EMP_TYPES[job.employmentType] ?? job.employmentType) : null;
              const location = [job.city, job.state, job.country === "US" ? null : job.country]
                .filter(Boolean).join(", ") || null;
              const isExpanded = expandedId === job.id;

              return (
                <div
                  key={job.id}
                  className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/5 overflow-hidden"
                >
                  {/* Main row */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <CompanyLogo logo={job.logo} company={job.company} />

                      <div className="flex-1 min-w-0">
                        {/* Title + badges */}
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                          <h3 className="text-white font-semibold text-sm leading-tight">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
                            {job.isRemote && (
                              <span className="flex items-center gap-1 text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full px-2 py-0.5">
                                <Globe className="w-2.5 h-2.5" /> Remote
                              </span>
                            )}
                            {empType && (
                              <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 rounded-full px-2 py-0.5">
                                {empType}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Company + meta */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {job.company}
                          </span>
                          {location && !job.isRemote && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {location}
                            </span>
                          )}
                          {salary && (
                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                              <DollarSign className="w-3 h-3" /> {salary}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {timeAgo(job.postedAt)}
                          </span>
                        </div>

                        {/* Skills */}
                        {job.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {job.requiredSkills.map((skill) => (
                              <span key={skill} className="text-xs bg-slate-800 text-slate-400 rounded-full px-2 py-0.5 border border-slate-700/50">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Description preview */}
                        {job.description && (
                          <p className={`text-xs text-slate-500 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                            {job.description}{!isExpanded && job.description.length >= 280 ? "…" : ""}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <a
                            href={job.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30"
                          >
                            Apply Now <ExternalLink className="w-3 h-3" />
                          </a>
                          {job.description.length > 100 && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : job.id)}
                              className="text-xs text-slate-500 hover:text-white transition-colors"
                            >
                              {isExpanded ? "Show less" : "Show more"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); fetchJobs(); }}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-slate-500 text-sm">Page {page}</span>
            <button
              onClick={() => { setPage((p) => p + 1); fetchJobs(); }}
              disabled={jobs.length < 10 || loading}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
