"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase, Globe, Building2, ArrowRight, Check, X as XIcon,
  Loader2, MessageSquare, Mic, Shield, Zap, Users, Lock,
} from "lucide-react";

type Job = {
  id: string; title: string; company: string; logo: string | null;
  city: string | null; state: string | null; country: string | null;
  isRemote: boolean; postedAt: string | null; applyLink: string;
  employmentType: string | null; requiredSkills: string[];
};

const COUNTRY_TILES = [
  { flag: "🇺🇸", label: "USA",         code: "us", color: "#0047b6", bg: "#e7f1ff" },
  { flag: "🇬🇧", label: "UK",          code: "gb", color: "#c14d00", bg: "#fff0e6" },
  { flag: "🇨🇦", label: "Canada",      code: "ca", color: "#b91c1c", bg: "#fff5f5" },
  { flag: "🇦🇺", label: "Australia",   code: "au", color: "#166534", bg: "#f0fdf4" },
  { flag: "🇮🇳", label: "India",       code: "in", color: "#c2410c", bg: "#fff8ee" },
  { flag: "🇩🇪", label: "Germany",     code: "de", color: "#374151", bg: "#f9fafb" },
  { flag: "🇸🇬", label: "Singapore",   code: "sg", color: "#991b1b", bg: "#fef2f2" },
  { flag: "🇳🇱", label: "Netherlands", code: "nl", color: "#9a3412", bg: "#fff7ed" },
  { flag: "🇮🇪", label: "Ireland",     code: "ie", color: "#166534", bg: "#f0fdf4" },
  { flag: "🇸🇪", label: "Sweden",      code: "se", color: "#1e40af", bg: "#eff6ff" },
  { flag: "🇦🇪", label: "UAE",         code: "ae", color: "#065f46", bg: "#ecfdf5" },
  { flag: "🇵🇱", label: "Poland",      code: "pl", color: "#9f1239", bg: "#fff1f2" },
  { flag: "🇧🇷", label: "Brazil",      code: "br", color: "#15803d", bg: "#f0fdf4" },
  { flag: "🇳🇿", label: "New Zealand", code: "nz", color: "#1e3a5f", bg: "#eff6ff" },
  { flag: "🇫🇷", label: "France",      code: "fr", color: "#1d4ed8", bg: "#eff6ff" },
  { flag: "🇯🇵", label: "Japan",       code: "jp", color: "#be123c", bg: "#fff1f2" },
  { flag: "🇲🇽", label: "Mexico",      code: "mx", color: "#166534", bg: "#f0fdf4" },
  { flag: "🇵🇭", label: "Philippines", code: "ph", color: "#1e40af", bg: "#eff6ff" },
  { flag: "🇲🇾", label: "Malaysia",    code: "my", color: "#b91c1c", bg: "#fff5f5" },
  { flag: "🇿🇦", label: "S. Africa",   code: "za", color: "#166534", bg: "#f0fdf4" },
  { flag: "🇵🇹", label: "Portugal",    code: "pt", color: "#9f1239", bg: "#fff1f2" },
  { flag: "🇷🇴", label: "Romania",     code: "ro", color: "#9a3412", bg: "#fff7ed" },
];

const EMP_TYPES: Record<string, string> = {
  FULLTIME: "Full-time", PARTTIME: "Part-time",
  CONTRACTOR: "Contract", INTERN: "Internship",
};

const FEATURES = [
  { icon: Globe,  color: "from-blue-500 to-indigo-600",   title: "22 Countries",  desc: "USA, UK, India, Germany, Australia, UAE, Japan & more" },
  { icon: Zap,    color: "from-amber-500 to-orange-600",  title: "Daily Updates", desc: "Jobs refreshed every 24 hours from Google for Jobs" },
  { icon: Shield, color: "from-emerald-500 to-teal-600",  title: "No Fake Jobs",  desc: "Aggregated from LinkedIn, Indeed & Glassdoor only" },
  { icon: Users,  color: "from-violet-500 to-purple-600", title: "QA Focused",    desc: "Every role is relevant to QA engineers & SDETs" },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    highlight: false,
    badge: null,
    features: [
      { text: "10 jobs per search",         ok: true },
      { text: "7 countries",                ok: true },
      { text: "Basic filters (remote/date)", ok: true },
      { text: "Job detail view",            ok: true },
      { text: "All 22 countries",           ok: false },
      { text: "220+ results per search",    ok: false },
      { text: "Job alert emails",           ok: false },
      { text: "Priority daily refresh",     ok: false },
    ],
    cta: "Get Started Free",
    ctaStyle: "border border-white/20 text-white hover:bg-white/10",
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "220+ jobs per search",       ok: true },
      { text: "All 22 countries",           ok: true },
      { text: "Advanced filters",           ok: true },
      { text: "Job detail view",            ok: true },
      { text: "Job alert emails",           ok: true },
      { text: "Priority daily refresh",     ok: true },
      { text: "Resume tips (coming soon)",  ok: true },
      { text: "Early access to new tools",  ok: true },
    ],
    cta: "Upgrade to Pro",
    ctaStyle: "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/30",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Marquee job card
// ─────────────────────────────────────────────────────────────────────────────
function MarqueeCard({ job, countryMeta }: { job: Job; countryMeta: typeof COUNTRY_TILES[0] | undefined }) {
  const [logoErr, setLogoErr] = useState(false);
  const initials = job.company.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const empType = job.employmentType ? (EMP_TYPES[job.employmentType] ?? job.employmentType) : null;
  return (
    <div className="mx-3 w-72 flex-shrink-0 bg-white rounded-2xl p-4 border border-[#e2e7ff] shadow-[0_4px_16px_rgba(37,99,235,0.08)] hover:-translate-y-1 transition-transform duration-200 cursor-default select-none">
      <div className="flex items-center justify-between mb-3">
        {countryMeta ? (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: countryMeta.bg, color: countryMeta.color }}>
            {countryMeta.flag} {countryMeta.label}
          </span>
        ) : <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full">🌐 Global</span>}
        {job.isRemote && <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-medium">Remote</span>}
      </div>
      {job.logo && !logoErr ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={job.logo} alt={job.company} onError={() => setLogoErr(true)} className="w-8 h-8 rounded-lg object-contain bg-slate-50 p-1 border border-slate-100 mb-2" />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 border border-[#dce8ff] flex items-center justify-center text-[#3b5bdb] font-bold text-xs mb-2">
          {initials}
        </div>
      )}
      <h3 className="text-[#1c2e4a] font-bold text-sm leading-snug mb-1 line-clamp-2">{job.title}</h3>
      <p className="text-[#59647a] text-xs flex items-center gap-1 mb-2">
        <Building2 className="w-3 h-3 flex-shrink-0" /> {job.company}
      </p>
      {empType && <span className="inline-block text-xs bg-[#f0f4ff] text-[#3b5bdb] px-2 py-0.5 rounded-full mb-2">{empType}</span>}
      {job.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {job.requiredSkills.slice(0, 3).map(s => (
            <span key={s} className="text-xs bg-[#f8faff] text-[#4b6cb7] border border-[#dce8ff] px-1.5 py-0.5 rounded-full">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function JobsLandingPage() {
  const router = useRouter();
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [countryCounts, setCountryCounts] = useState<Record<string, number>>({});
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const totalJobs = Object.values(countryCounts).reduce((a, b) => a + b, 0);

  useEffect(() => {
    const prefetchAll = async () => {
      const counts: Record<string, number> = {};
      const jobs: Job[] = [];

      // Fetch in batches of 4 to avoid connection pool exhaustion
      const BATCH = 4;
      for (let i = 0; i < COUNTRY_TILES.length; i += BATCH) {
        const batch = COUNTRY_TILES.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          batch.map(({ code }) =>
            fetch(`/api/candidate/jobs?country=${code}&query=QA+automation+engineer&datePosted=month&page=1&remote=false`)
              .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
          )
        );
        batch.forEach(({ code }, j) => {
          const r = results[j];
          if (r.status === "fulfilled" && r.value?.jobs) {
            counts[code] = r.value.jobs.length;
            jobs.push(...r.value.jobs);
          }
        });
        // Update UI progressively after each batch
        setCountryCounts({ ...counts });
        setAllJobs([...jobs]);
      }
      setLoading(false);
    };
    prefetchAll();
  }, []);

  const goToSearch = (country?: string) => {
    const url = country ? `/candidate/jobs/search?country=${country}` : "/candidate/jobs/search";
    router.push(url);
  };

  return (
    <div className="min-h-full bg-[#0b102a]">
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track  { display:flex; animation: marquee 50s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }

        @keyframes tilesScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .tiles-track  { display:flex; animation: tilesScroll 28s linear infinite; }
        .tiles-track:hover { animation-play-state: paused; }
      `}</style>

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden"
        style={{ background: "radial-gradient(circle at 30% 20%, #1e2a6e 0%, #0b102a 60%)" }}>
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.22]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-6 pt-14 pb-6 text-center max-w-4xl mx-auto">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-200 text-xs px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live Job Updates — Refreshed Daily
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-[1.1]">
            Get Verified QA &amp; SDET<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Jobs from 22 Countries
            </span>
          </h1>
          <p className="text-slate-400 text-base mb-10 max-w-lg mx-auto leading-relaxed">
            Daily job updates from LinkedIn, Indeed &amp; Glassdoor — curated exclusively for QA professionals
          </p>

          {/* ── Auto-scrolling country tiles ── */}
          <div className="relative mb-10 overflow-hidden">
            <div className="tiles-track">
              {[...COUNTRY_TILES, ...COUNTRY_TILES].map(({ flag, label, code, color, bg }, i) => {
                const count = countryCounts[code] ?? null;
                return (
                  <button key={`${code}-${i}`} onClick={() => goToSearch(code)}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5 mx-2 px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/12 hover:border-white/30 hover:scale-105 transition-all duration-200 w-[92px]">
                    <span className="text-2xl">{flag}</span>
                    <span className="text-white text-[11px] font-bold leading-tight text-center">{label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={count !== null && count > 0 ? { background: bg, color } : { background: "rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                      {loading ? "…" : count !== null ? `${count}` : "0"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0d1333] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0d1333] to-transparent pointer-events-none" />
          </div>

          {/* Stats — just two clean numbers */}
          <div className="flex items-center justify-center gap-12 flex-wrap mb-10 text-center">
            <div>
              <div className="text-white font-black text-2xl">{loading ? "…" : `${totalJobs}+`}</div>
              <div className="text-slate-500 text-xs mt-0.5 font-medium">Live Jobs</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-white font-black text-2xl">22</div>
              <div className="text-slate-500 text-xs mt-0.5 font-medium">Countries</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-white font-black text-2xl">Daily</div>
              <div className="text-slate-500 text-xs mt-0.5 font-medium">Refresh</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button onClick={() => goToSearch()}
              className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-500/30 text-sm w-full sm:w-auto justify-center">
              Browse All Jobs <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex flex-wrap justify-center gap-2">
              {COUNTRY_TILES.slice(0, 5).map(({ flag, code, label }) => (
                <button key={code} onClick={() => goToSearch(code)}
                  className="flex items-center gap-1.5 border border-white/15 hover:border-white/30 text-white/80 hover:text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                  {flag} {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Job marquee */}
        <div className="relative pb-10 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-24 gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-slate-500 text-sm">Loading jobs from 22 countries…</span>
            </div>
          ) : allJobs.length > 0 ? (
            <div ref={marqueeRef}>
              <div className="marquee-track">
                {[...allJobs, ...allJobs].map((job, i) => {
                  const meta = COUNTRY_TILES.find(t => t.code === (job.country ?? "").toLowerCase());
                  return <MarqueeCard key={`${job.id}-${i}`} job={job} countryMeta={meta} />;
                })}
              </div>
            </div>
          ) : null}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0b102a] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0b102a] to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          WHY SECTION
      ══════════════════════════════════════════════════ */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-white mb-2">Why AITestCraft Job Board?</h2>
          <p className="text-slate-500 text-sm">Everything a QA engineer needs in one place</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/8 rounded-2xl p-5 hover:bg-white/8 hover:border-white/15 transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BROWSE BY COUNTRY
      ══════════════════════════════════════════════════ */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white mb-2">Browse by Country</h2>
          <p className="text-slate-500 text-sm">QA jobs from 22 major tech markets worldwide</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {/* All Countries card */}
          <button onClick={() => goToSearch()}
            className="col-span-2 sm:col-span-1 flex items-center gap-4 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 hover:border-blue-400/50 rounded-2xl p-5 hover:scale-[1.02] transition-all group">
            <div className="text-3xl">🌐</div>
            <div className="text-left">
              <div className="text-white font-bold text-sm">All Countries</div>
              <div className="text-blue-400 text-xs font-semibold mt-0.5">
                {loading ? "Loading…" : `${totalJobs}+ jobs`}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          {COUNTRY_TILES.map(({ flag, label, code, color, bg }) => {
            const count = countryCounts[code];
            return (
              <button key={code} onClick={() => goToSearch(code)}
                className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 rounded-2xl p-4 hover:scale-[1.02] transition-all group">
                <span className="text-2xl">{flag}</span>
                <div className="text-left flex-1">
                  <div className="text-white font-bold text-sm">{label}</div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: count ? color : "#94a3b8" }}>
                    {loading ? "…" : count ? `${count} jobs` : "0 jobs"}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PRICING PLANS
      ══════════════════════════════════════════════════ */}
      <section className="px-6 pb-16 max-w-4xl mx-auto" id="plans">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-white mb-2">Simple, Transparent Pricing</h2>
          <p className="text-slate-500 text-sm">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {PLANS.map(plan => (
            <div key={plan.name}
              className={`relative rounded-3xl p-6 flex flex-col border transition-all ${
                plan.highlight
                  ? "bg-gradient-to-b from-blue-600/20 to-indigo-900/20 border-blue-500/40 shadow-xl shadow-blue-900/30"
                  : "bg-white/5 border-white/10"
              }`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="mb-5">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">{plan.name}</div>
                <div className="flex items-end gap-1.5">
                  <span className="text-white font-black text-3xl">{plan.price}</span>
                  <span className="text-slate-400 text-sm mb-1">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f.text} className="flex items-center gap-2.5">
                    {f.ok
                      ? <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      : <XIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                    <span className={`text-sm ${f.ok ? "text-slate-300" : "text-slate-600"}`}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${plan.ctaStyle}`}
                onClick={() => plan.highlight ? undefined : goToSearch()}>
                {plan.highlight
                  ? <span className="flex items-center justify-center gap-2"><Lock className="w-4 h-4" /> {plan.cta} — Coming Soon</span>
                  : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PRACTICE SECTION
      ══════════════════════════════════════════════════ */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="rounded-3xl overflow-hidden border border-white/10"
          style={{ background: "radial-gradient(ellipse at top left, #1e2a6e 0%, #0b102a 70%)" }}>
          <div className="relative px-8 py-12 overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs px-3 py-1 rounded-full mb-5">
                🚀 Don&apos;t Just Apply — Get Ready
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                Ace Your Interview Before You Apply
              </h2>
              <p className="text-slate-400 text-sm mb-8 max-w-lg leading-relaxed">
                Practice with AI-powered assessments and technical interviews. Build confidence and stand out from the crowd.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
                <Link href="/candidate/mock-interview"
                  className="flex items-start gap-4 bg-white/8 hover:bg-white/12 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm mb-0.5">Practice Assessment</div>
                    <div className="text-slate-400 text-xs leading-relaxed">AI-generated Q&amp;A to sharpen your QA knowledge</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white mt-0.5 ml-auto flex-shrink-0 transition-colors" />
                </Link>
                <Link href="/candidate/hr-interview"
                  className="flex items-start gap-4 bg-white/8 hover:bg-white/12 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm mb-0.5">Technical Interview</div>
                    <div className="text-slate-400 text-xs leading-relaxed">Conversational AI interview based on your resume</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white mt-0.5 ml-auto flex-shrink-0 transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════ */}
      <section className="px-6 pb-12 max-w-5xl mx-auto text-center">
        <div className="border border-white/10 bg-white/3 rounded-3xl px-8 py-10">
          <Briefcase className="w-10 h-10 text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2">Ready to Find Your Next QA Role?</h2>
          <p className="text-slate-500 text-sm mb-6">Browse verified QA jobs from 22 countries — refreshed daily</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => goToSearch()}
              className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/25 text-sm">
              Browse All Jobs <ArrowRight className="w-4 h-4" />
            </button>
            {COUNTRY_TILES.map(({ flag, code }) => (
              <button key={code} onClick={() => goToSearch(code)}
                className="text-lg hover:scale-125 transition-transform" title={code.toUpperCase()}>
                {flag}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
