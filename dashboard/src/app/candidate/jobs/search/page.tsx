"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Search, Briefcase, Building2, MapPin, ExternalLink,
  ChevronLeft, ChevronRight, X, Clock, Wifi, WifiOff, Loader2,
  SlidersHorizontal, ChevronDown, ChevronUp, Globe, Lock,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────────
type Job = {
  id: string; title: string; company: string; logo: string | null;
  city: string | null; state: string | null; country: string | null;
  isRemote: boolean; postedAt: string | null; applyLink: string;
  employmentType: string | null; minSalary: number | null; maxSalary: number | null;
  salaryCurrency: string | null; salaryPeriod: string | null;
  requiredSkills: string[]; description: string;
};

const COUNTRY_TILES = [
  { flag: "🌐", label: "All",         code: "",   color: "#2563eb", bg: "#e7f1ff" },
  { flag: "🇺🇸", label: "USA",        code: "us", color: "#0047b6", bg: "#e7f1ff" },
  { flag: "🇬🇧", label: "UK",         code: "gb", color: "#c14d00", bg: "#fff0e6" },
  { flag: "🇨🇦", label: "Canada",     code: "ca", color: "#b91c1c", bg: "#fff5f5" },
  { flag: "🇦🇺", label: "Australia",  code: "au", color: "#166534", bg: "#f0fdf4" },
  { flag: "🇮🇳", label: "India",      code: "in", color: "#c2410c", bg: "#fff8ee" },
  { flag: "🇩🇪", label: "Germany",    code: "de", color: "#374151", bg: "#f9fafb" },
  { flag: "🇸🇬", label: "Singapore",  code: "sg", color: "#991b1b", bg: "#fef2f2" },
  { flag: "🇳🇱", label: "Netherlands",code: "nl", color: "#9a3412", bg: "#fff7ed" },
  { flag: "🇮🇪", label: "Ireland",    code: "ie", color: "#166534", bg: "#f0fdf4" },
  { flag: "🇸🇪", label: "Sweden",     code: "se", color: "#1e40af", bg: "#eff6ff" },
  { flag: "🇦🇪", label: "UAE",        code: "ae", color: "#065f46", bg: "#ecfdf5" },
  { flag: "🇵🇱", label: "Poland",     code: "pl", color: "#9f1239", bg: "#fff1f2" },
  { flag: "🇧🇷", label: "Brazil",     code: "br", color: "#15803d", bg: "#f0fdf4" },
  { flag: "🇳🇿", label: "New Zealand",code: "nz", color: "#1e3a5f", bg: "#eff6ff" },
  { flag: "🇫🇷", label: "France",     code: "fr", color: "#1d4ed8", bg: "#eff6ff" },
  { flag: "🇯🇵", label: "Japan",      code: "jp", color: "#be123c", bg: "#fff1f2" },
  { flag: "🇲🇽", label: "Mexico",     code: "mx", color: "#166534", bg: "#f0fdf4" },
  { flag: "🇵🇭", label: "Philippines",code: "ph", color: "#1e40af", bg: "#eff6ff" },
  { flag: "🇲🇾", label: "Malaysia",   code: "my", color: "#b91c1c", bg: "#fff5f5" },
  { flag: "🇿🇦", label: "S. Africa",  code: "za", color: "#166534", bg: "#f0fdf4" },
  { flag: "🇵🇹", label: "Portugal",   code: "pt", color: "#9f1239", bg: "#fff1f2" },
  { flag: "🇷🇴", label: "Romania",    code: "ro", color: "#9a3412", bg: "#fff7ed" },
];

const TOPICS = [
  "QA Automation Engineer", "SDET", "Manual Tester", "QA Lead",
  "Performance Engineer", "Security Tester", "QA Manager",
];

const DATE_OPTIONS = [
  { label: "Past Month",  value: "month" },
  { label: "Past Week",   value: "week" },
  { label: "Past 3 Days", value: "3days" },
  { label: "Today",       value: "today" },
];

const EMP_TYPES: Record<string, string> = {
  FULLTIME: "Full-time", PARTTIME: "Part-time",
  CONTRACTOR: "Contract", INTERN: "Internship",
};

const PAGE_SIZE = 10;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function timeAgo(iso: string | null) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function formatSalary(min: number | null, max: number | null, currency: string | null, period: string | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${n}`;
  const cur = currency ?? "USD";
  const per = period ? `/${period.toLowerCase().replace("year", "yr").replace("month", "mo")}` : "";
  if (min && max) return `${cur} ${fmt(min)}–${fmt(max)}${per}`;
  if (min) return `${cur} ${fmt(min)}+${per}`;
  return `Up to ${cur} ${fmt(max!)}${per}`;
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// Job logo component
// ─────────────────────────────────────────────────────────────────────────────
function CompanyLogo({ logo, company, size = "md" }: { logo: string | null; company: string; size?: "sm" | "md" | "lg" }) {
  const [err, setErr] = useState(false);
  const initials = company.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const dim = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  if (logo && !err) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logo} alt={company} onError={() => setErr(true)}
        className={`${dim} rounded-xl object-contain bg-white p-1.5 border border-slate-200 flex-shrink-0`} />
    );
  }
  return (
    <div className={`${dim} rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Left panel — compact job card
// ─────────────────────────────────────────────────────────────────────────────
function JobListCard({
  job, selected, onClick,
}: { job: Job; selected: boolean; onClick: () => void }) {
  const countryMeta = COUNTRY_TILES.find(t => t.code === (job.country ?? "").toLowerCase());
  const salary = formatSalary(job.minSalary, job.maxSalary, job.salaryCurrency, job.salaryPeriod);
  const age = timeAgo(job.postedAt);
  const empType = job.employmentType ? (EMP_TYPES[job.employmentType] ?? job.employmentType) : null;

  return (
    <button onClick={onClick} className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 mb-2
      ${selected
        ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm"
      }`}>
      <div className="flex items-start gap-3">
        <CompanyLogo logo={job.logo} company={job.company} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${selected ? "text-blue-700" : "text-slate-800"}`}>
              {job.title}
            </h3>
            {age && <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">{age}</span>}
          </div>
          <p className="text-slate-500 text-xs flex items-center gap-1 mb-2 truncate">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{job.company}</span>
          </p>
          <div className="flex flex-wrap gap-1.5 items-center">
            {countryMeta && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: countryMeta.bg, color: countryMeta.color }}>
                {countryMeta.flag} {countryMeta.label}
              </span>
            )}
            {job.isRemote && (
              <span className="text-[10px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-full font-medium">Remote</span>
            )}
            {empType && (
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{empType}</span>
            )}
            {salary && (
              <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">{salary}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Right panel — job detail
// ─────────────────────────────────────────────────────────────────────────────
function JobDetail({ job, onClose }: { job: Job; onClose: () => void }) {
  const [descExpanded, setDescExpanded] = useState(false);
  const countryMeta = COUNTRY_TILES.find(t => t.code === (job.country ?? "").toLowerCase());
  const salary = formatSalary(job.minSalary, job.maxSalary, job.salaryCurrency, job.salaryPeriod);
  const age = timeAgo(job.postedAt);
  const empType = job.employmentType ? (EMP_TYPES[job.employmentType] ?? job.employmentType) : null;
  const locationParts = [job.city, job.state, job.country?.toUpperCase()].filter(Boolean);

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex-shrink-0">
        <span className="text-xs text-slate-400 font-medium">Job Detail</span>
        <button onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Company + logo */}
        <div className="flex items-start gap-4 mb-5">
          <CompanyLogo logo={job.logo} company={job.company} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-slate-900 font-black text-lg leading-snug mb-1">{job.title}</h2>
            <p className="text-slate-600 text-sm font-medium flex items-center gap-1.5">
              <Building2 className="w-4 h-4 flex-shrink-0 text-slate-400" />
              {job.company}
            </p>
          </div>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {countryMeta && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: countryMeta.bg, color: countryMeta.color }}>
              {countryMeta.flag} {countryMeta.label === "All" ? "Global" : countryMeta.label}
            </span>
          )}
          {job.isRemote && (
            <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full font-medium">
              <Wifi className="w-3 h-3" /> Remote
            </span>
          )}
          {!job.isRemote && locationParts.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3" /> {locationParts.join(", ")}
            </span>
          )}
          {empType && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
              <Briefcase className="w-3 h-3" /> {empType}
            </span>
          )}
          {age && (
            <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
              <Clock className="w-3 h-3" /> {age}
            </span>
          )}
        </div>

        {/* Salary */}
        {salary && (
          <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-5">
            <div className="text-xs text-green-600 font-medium mb-0.5">Estimated Salary</div>
            <div className="text-green-800 font-black text-lg">{salary}</div>
          </div>
        )}

        {/* Skills */}
        {job.requiredSkills.length > 0 && (
          <div className="mb-5">
            <h3 className="text-slate-700 font-bold text-sm mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map(s => (
                <span key={s} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div className="mb-5">
            <h3 className="text-slate-700 font-bold text-sm mb-2">Job Description</h3>
            <div className="relative">
              <div style={{
                maxHeight: descExpanded ? "none" : "120px",
                overflow: "hidden",
                transition: "max-height 0.35s ease",
              }}>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
              {!descExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}
            </div>
            {job.description.length > 200 && (
              <button onClick={() => setDescExpanded(e => !e)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors">
                {descExpanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Apply CTA */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
        <a href={job.applyLink} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-blue-500/20 text-sm">
          Apply Now <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main search page (inner, uses hooks that need Suspense)
// ─────────────────────────────────────────────────────────────────────────────
function JobSearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initCountry = searchParams.get("country") ?? "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState<{ cached: boolean; stale?: boolean; cachedAt?: string } | null>(null);

  // Filters
  const [topicIdx, setTopicIdx] = useState(0);
  const [customQuery, setCustomQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [datePosted, setDatePosted] = useState("month");
  const [selectedCountry, setSelectedCountry] = useState(initCountry);
  const [showFilters, setShowFilters] = useState(false);

  // Results
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const query = customQuery.trim() || TOPICS[topicIdx];
  // All 7 country codes (skip the "" "All" entry)
  const ALL_COUNTRY_CODES = COUNTRY_TILES.filter(t => t.code).map(t => t.code);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setSelectedJob(null);
    try {
      if (!selectedCountry) {
        // "All" → fetch all countries in batches of 4 to avoid connection pool exhaustion
        const BATCH = 4;
        const merged: Job[] = [];
        let anyCached = false;
        let anyStale = false;

        for (let i = 0; i < ALL_COUNTRY_CODES.length; i += BATCH) {
          const batch = ALL_COUNTRY_CODES.slice(i, i + BATCH);
          const results = await Promise.allSettled(
            batch.map(code => {
              const params = new URLSearchParams({ query, country: code, datePosted, remote: String(remoteOnly), page: "1" });
              return fetch(`/api/candidate/jobs?${params}`)
                .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); });
            })
          );
          results.forEach(r => {
            if (r.status === "fulfilled" && r.value?.jobs) {
              merged.push(...r.value.jobs);
              if (r.value.cached) anyCached = true;
              if (r.value.stale) anyStale = true;
            }
          });
        }
        // Deduplicate by id
        const seen = new Set<string>();
        const deduped = merged.filter(j => { if (seen.has(j.id)) return false; seen.add(j.id); return true; });
        setJobs(deduped);
        setCached({ cached: anyCached, stale: anyStale });
      } else {
        // Single country
        const params = new URLSearchParams({ query, country: selectedCountry, datePosted, remote: String(remoteOnly), page: "1" });
        const res = await fetch(`/api/candidate/jobs?${params}`);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        setJobs(data.jobs ?? []);
        setCached({ cached: data.cached, stale: data.stale, cachedAt: data.cachedAt });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedCountry, datePosted, remoteOnly]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Reset page when country filter changes (client-side, no re-fetch needed when using all-countries view)
  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    setCurrentPage(1);
    setSelectedJob(null);
    // Update URL param without navigation
    const url = new URL(window.location.href);
    if (code) url.searchParams.set("country", code);
    else url.searchParams.delete("country");
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Derived
  const filteredJobs = jobs; // jobs are already country-filtered by API
  const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setMobileDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setSelectedJob(null);
    setMobileDetailOpen(false);
  };

  return (
    <div className="min-h-full bg-[#f5f7fe]">
      {/* ─── Top bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="/candidate/jobs"
            className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" /> Job Board
          </Link>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" value={customQuery} placeholder={TOPICS[topicIdx]}
                onChange={e => { setCustomQuery(e.target.value); setCurrentPage(1); }}
                onKeyDown={e => e.key === "Enter" && fetchJobs()}
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 placeholder:text-slate-400 transition"
              />
            </div>
            {/* Filters toggle (mobile) */}
            <button onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-blue-50 transition sm:hidden flex-shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
            {/* Inline filters (desktop) */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <select value={datePosted} onChange={e => setDatePosted(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer">
                {DATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-blue-50 transition select-none">
                <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} className="w-3 h-3 accent-blue-600" />
                <WifiOff className="w-3 h-3 text-slate-400" /> Remote only
              </label>
              <button onClick={fetchJobs}
                className="text-xs bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-4 py-2 rounded-xl transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="sm:hidden border-t border-slate-100 px-4 py-3 bg-white flex flex-wrap gap-3 items-center">
            <select value={datePosted} onChange={e => setDatePosted(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-600 focus:outline-none">
              {DATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 select-none">
              <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} className="w-3 h-3 accent-blue-600" />
              Remote only
            </label>
            <button onClick={() => { fetchJobs(); setShowFilters(false); }}
              className="text-xs bg-[#2563eb] text-white font-semibold px-4 py-2 rounded-xl">
              Search
            </button>
          </div>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">

        {/* ─── Topic chips ────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-4">
          {TOPICS.map((t, i) => (
            <button key={t} onClick={() => { setTopicIdx(i); setCustomQuery(""); setCurrentPage(1); }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                i === topicIdx && !customQuery
                  ? "bg-[#2563eb] text-white border-transparent shadow-sm shadow-blue-300"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* ─── Country chips ──────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-5">
          {COUNTRY_TILES.map(({ flag, label, code, color, bg }) => {
            const isSelected = selectedCountry === code;
            return (
              <button key={code} onClick={() => handleCountryChange(code)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  isSelected
                    ? "shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
                style={isSelected ? { background: bg, color, borderColor: color + "44" } : {}}>
                {flag} {label}
              </button>
            );
          })}
        </div>

        {/* ─── Results header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            {loading ? (
              <span className="text-slate-500 text-sm">Searching…</span>
            ) : error ? (
              <span className="text-red-500 text-sm">{error}</span>
            ) : (
              <span className="text-slate-600 text-sm font-medium">
                <span className="font-black text-slate-800">{filteredJobs.length}</span> roles found
                {selectedCountry ? ` in ${COUNTRY_TILES.find(t => t.code === selectedCountry)?.label ?? selectedCountry.toUpperCase()}` : ""}
              </span>
            )}
            {cached?.cached && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                cached.stale ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}>
                {cached.stale ? "⚡ Stale cache" : "⚡ Cached"}
              </span>
            )}
          </div>
          {totalPages > 1 && !loading && (
            <span className="text-xs text-slate-400">Page {currentPage} of {totalPages}</span>
          )}
        </div>

        {/* ─── Main layout ────────────────────────────────────────────── */}
        <div className="flex gap-5 items-start">

          {/* LEFT: job list */}
          <div className={`flex-shrink-0 transition-all duration-300 ${selectedJob ? "w-full lg:w-[420px] xl:w-[460px]" : "w-full max-w-2xl mx-auto"}`}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-slate-400 text-sm">Loading jobs…</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-slate-500 text-sm mb-4">{error}</p>
                <button onClick={fetchJobs} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-xl">Retry</button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-slate-600 font-semibold mb-1">No jobs found</p>
                <p className="text-slate-400 text-sm">Try a different search or country</p>
              </div>
            ) : (
              <>
                <div>
                  {paginatedJobs.map(job => (
                    <JobListCard key={job.id} job={job}
                      selected={selectedJob?.id === job.id}
                      onClick={() => handleJobClick(job)} />
                  ))}
                </div>

                {/* Pagination — page 1 free, page 2+ Pro gate */}
                {totalPages > 1 && currentPage === 1 && (
                  <div className="mt-4">
                    {/* Pro paywall gate */}
                    <div className="relative rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50 to-indigo-50 px-6 py-6 text-center overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                      <Lock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-slate-700 font-bold text-sm mb-0.5">
                        {filteredJobs.length - PAGE_SIZE} more jobs available
                      </p>
                      <p className="text-slate-500 text-xs mb-4">
                        Free plan shows 10 results. Upgrade to Pro to unlock all {filteredJobs.length} jobs.
                      </p>
                      <Link href="/candidate/jobs#plans"
                        className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-blue-200">
                        Upgrade to Pro <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
                {totalPages > 1 && currentPage > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-4 pb-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {pageNumbers.map((p, i) =>
                      p === "…" ? (
                        <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>
                      ) : (
                        <button key={p} onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold border transition-all ${
                            p === currentPage
                              ? "bg-[#2563eb] text-white border-transparent shadow-sm shadow-blue-300"
                              : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                          }`}>
                          {p}
                        </button>
                      )
                    )}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT: detail panel (desktop, sticky) */}
          {selectedJob && (
            <div className="hidden lg:block flex-1 sticky top-[72px] max-h-[calc(100vh-88px)]">
              <JobDetail job={selectedJob} onClose={handleCloseDetail} />
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile detail modal ────────────────────────────────────── */}
      {mobileDetailOpen && selectedJob && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) handleCloseDetail(); }}>
          <div className="mt-auto h-[92vh] rounded-t-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <JobDetail job={selectedJob} onClose={handleCloseDetail} />
          </div>
        </div>
      )}

      {/* ─── Bottom CTA ──────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-10">
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-8 py-8 text-center shadow-sm">
          <h2 className="text-slate-800 font-black text-lg mb-1">Ready to ace the interview?</h2>
          <p className="text-slate-500 text-sm mb-5">Practice AI-powered assessments before you apply</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/candidate/mock-interview"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm shadow-violet-200">
              Practice Assessment
            </Link>
            <Link href="/candidate/hr-interview"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm shadow-blue-200">
              Technical Interview
            </Link>
            <Link href="/candidate/jobs"
              className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Job Board
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export — wrap in Suspense (required for useSearchParams in App Router)
// ─────────────────────────────────────────────────────────────────────────────
export default function JobSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <JobSearchInner />
    </Suspense>
  );
}
