"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { User, Github, Linkedin, Briefcase, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";

type Profile = {
  skills: string[];
  experience_years: number;
  bio: string;
  linkedin_url: string;
  github_url: string;
};

const SUGGESTED_SKILLS = [
  "Playwright", "Selenium", "Cypress", "WebdriverIO",
  "API Testing", "Postman", "Jest", "Pytest",
  "Java", "Python", "TypeScript", "JavaScript",
  "CI/CD", "GitHub Actions", "Docker", "Agile",
];

export default function CandidateProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile>({
    skills: [], experience_years: 0, bio: "", linkedin_url: "", github_url: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/candidate/profile")
      .then((r) => r.json())
      .then((d) => { if (d.profile) setProfile(d.profile); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function addSkill(skill: string) {
    const s = skill.trim();
    if (!s || profile.skills.includes(s)) return;
    setProfile((p) => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/candidate/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Keep your profile up to date to improve your visibility to recruiters.</p>
      </div>

      {/* Identity (read-only from Clerk) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-4">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="" className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center">
              <User className="w-7 h-7 text-violet-400" />
            </div>
          )}
          <div>
            <div className="text-white font-semibold">{user?.fullName}</div>
            <div className="text-slate-500 text-sm">{user?.primaryEmailAddress?.emailAddress}</div>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Professional Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            placeholder="I'm a QA engineer with 3 years of experience in Playwright and API testing…"
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Years of Experience</label>
          <div className="relative w-32">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="number"
              min={0}
              max={30}
              value={profile.experience_years}
              onChange={(e) => setProfile((p) => ({ ...p, experience_years: parseInt(e.target.value) || 0 }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Skills</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
              placeholder="Add a skill and press Enter"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={() => addSkill(skillInput)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm transition-colors"
            >
              Add
            </button>
          </div>

          {/* Added skills */}
          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.skills.map((s) => (
                <span key={s} className="flex items-center gap-1 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-0.5 text-xs">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_SKILLS.filter((s) => !profile.skills.includes(s)).slice(0, 10).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
                className="text-xs bg-slate-800 text-slate-400 border border-slate-700 hover:border-violet-500 hover:text-violet-400 rounded-full px-2.5 py-0.5 transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">LinkedIn URL</label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="url"
                value={profile.linkedin_url}
                onChange={(e) => setProfile((p) => ({ ...p, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/…"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">GitHub URL</label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="url"
                value={profile.github_url}
                onChange={(e) => setProfile((p) => ({ ...p, github_url: e.target.value }))}
                placeholder="https://github.com/…"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors disabled:opacity-50"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> :
           saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> :
           "Save Profile"}
        </button>
      </form>
    </div>
  );
}
