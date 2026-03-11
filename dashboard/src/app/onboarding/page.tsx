"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  User,
  Building2,
  ChevronRight,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Loader2,
} from "lucide-react";

type Role = "candidate" | "recruiter";

export default function OnboardingPage() {
  const { user } = useUser();

  // If user already completed onboarding, redirect them straight to their dashboard
  useEffect(() => {
    const existingRole = user?.publicMetadata?.role as string | undefined;
    if (existingRole === "recruiter") window.location.href = "/recruiter/dashboard";
    else if (existingRole === "candidate") window.location.href = "/candidate/dashboard";
  }, [user]);

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [fullName, setFullName] = useState(
    user?.fullName ?? (user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "")
  );
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleRoleSelect(r: Role) {
    setRole(r);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role || !fullName.trim()) return;
    if (role === "recruiter" && !companyName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          fullName: fullName.trim(),
          email: user?.primaryEmailAddress?.emailAddress ?? "",
          companyName: companyName.trim() || undefined,
          industry: industry.trim() || undefined,
          size: size || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Setup failed");

      // Hard redirect so Clerk issues a fresh session token with the new role in JWT claims.
      // router.push() (client navigation) would use the stale token and proxy.ts would
      // redirect back to /onboarding again.
      window.location.href = role === "candidate" ? "/candidate/dashboard" : "/recruiter/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-white font-bold text-2xl mb-2">
            <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white text-sm font-black">A</span>
            </div>
            AITestCraft
          </div>
          <p className="text-slate-400 text-sm">Let&apos;s get you set up in 30 seconds</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`h-2 w-8 rounded-full transition-colors ${step >= 1 ? "bg-violet-500" : "bg-slate-700"}`} />
          <div className={`h-2 w-8 rounded-full transition-colors ${step >= 2 ? "bg-violet-500" : "bg-slate-700"}`} />
        </div>

        {/* ── Step 1: Choose role ── */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-white text-center mb-2">How will you use AITestCraft?</h1>
            <p className="text-slate-400 text-center text-sm mb-8">
              Choose your primary role — you can always explore both sides.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Candidate card */}
              <button
                onClick={() => handleRoleSelect("candidate")}
                className="group relative rounded-2xl border border-slate-700 bg-slate-800/50 hover:border-violet-500 hover:bg-slate-800 p-6 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-500/30 transition-colors">
                  <GraduationCap className="w-6 h-6 text-violet-400" />
                </div>
                <div className="text-white font-semibold text-lg mb-1">I&apos;m a Candidate</div>
                <div className="text-slate-400 text-sm leading-relaxed">
                  Practice assessments, take technical interviews, build your QA resume.
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Practice Assessment", "Technical Interview", "Resume Builder"].map((tag) => (
                    <span key={tag} className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
                <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-slate-600 group-hover:text-violet-400 transition-colors" />
              </button>

              {/* Recruiter card */}
              <button
                onClick={() => handleRoleSelect("recruiter")}
                className="group relative rounded-2xl border border-slate-700 bg-slate-800/50 hover:border-blue-500 hover:bg-slate-800 p-6 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-white font-semibold text-lg mb-1">I&apos;m a Recruiter</div>
                <div className="text-slate-400 text-sm leading-relaxed">
                  Create skill assessments, post jobs, and evaluate QA candidates at scale.
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Create Assessments", "Post Jobs", "Review Results"].map((tag) => (
                    <span key={tag} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
                <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Fill in details ── */}
        {step === 2 && role && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>

            <h1 className="text-2xl font-bold text-white mb-2">
              {role === "candidate" ? "Tell us about yourself" : "Tell us about your company"}
            </h1>
            <p className="text-slate-400 text-sm mb-8">
              {role === "candidate"
                ? "This helps us personalise your interview prep and job matches."
                : "This will be shown to candidates on your assessments and job postings."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Your full name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Jane Smith"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Recruiter-only fields */}
              {role === "recruiter" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Company name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        placeholder="Acme Corp"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Industry</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select…</option>
                        {["Fintech", "E-commerce", "SaaS", "Healthcare", "Gaming", "Media", "Other"].map((i) => (
                          <option key={i} value={i.toLowerCase()}>{i}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Company size</label>
                      <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select…</option>
                        {["1-10", "11-50", "51-200", "201-1000", "1000+"].map((s) => (
                          <option key={s} value={s}>{s} employees</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !fullName.trim() || (role === "recruiter" && !companyName.trim())}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-all ${
                  role === "candidate"
                    ? "bg-violet-600 hover:bg-violet-500 focus:ring-2 focus:ring-violet-500"
                    : "bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up your account…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {role === "candidate" ? "Go to my dashboard" : "Set up my company"}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* What you get preview */}
            <div className="mt-6 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">
                {role === "candidate" ? "Your candidate dashboard includes" : "Your recruiter dashboard includes"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(role === "candidate"
                  ? ["Practice Assessments", "Technical Interviews", "QA Resume Builder", "Interview Prep Bank"]
                  : ["Create Assessments", "Invite Candidates", "Review Scores & AI Feedback", "Post Job Openings"]
                ).map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${role === "candidate" ? "text-violet-400" : "text-blue-400"}`} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
