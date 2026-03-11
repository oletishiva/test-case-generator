import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export type JobListing = {
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

const CACHE_TTL_HOURS = 48; // 48h retention — jobs stay active for weeks, saves API quota

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query      = searchParams.get("query")      ?? "QA automation engineer";
  const page       = searchParams.get("page")       ?? "1";
  const remoteOnly = searchParams.get("remote")     === "true";
  const datePosted = searchParams.get("datePosted") ?? "month";
  const country    = searchParams.get("country")    ?? "us"; // ISO country code; "us" = JSearch default

  const cacheKey = `${query.toLowerCase()}|${country}|${datePosted}|remote:${remoteOnly}|p${page}`;

  const db = supabaseAdmin();

  // ── 1. Try cache first ────────────────────────────────────────
  const { data: cached } = await db
    .from("cached_jobs")
    .select("jobs, fetched_at, expires_at")
    .eq("cache_key", cacheKey)
    .single();

  if (cached && new Date(cached.expires_at) > new Date()) {
    return NextResponse.json({
      jobs: cached.jobs as JobListing[],
      total: (cached.jobs as JobListing[]).length,
      cached: true,
      cachedAt: cached.fetched_at,
    });
  }

  // ── 2. No valid cache → fetch from JSearch ───────────────────
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    // Return stale cache if API key is missing rather than empty
    if (cached) {
      return NextResponse.json({
        jobs: cached.jobs as JobListing[],
        total: (cached.jobs as JobListing[]).length,
        cached: true,
        stale: true,
        cachedAt: cached.fetched_at,
      });
    }
    return NextResponse.json({ jobs: [], total: 0, unconfigured: true });
  }

  try {
    const url = new URL("https://jsearch.p.rapidapi.com/search");
    url.searchParams.set("query", query);
    url.searchParams.set("page", page);
    url.searchParams.set("num_pages", "1"); // 1 credit per country — 7 countries × 15 fetches/month ≈ 105 credits
    url.searchParams.set("date_posted", datePosted);
    url.searchParams.set("country", country);
    if (remoteOnly) url.searchParams.set("work_from_home", "true"); // correct JSearch param

    const res = await fetch(url.toString(), {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("JSearch error:", res.status, text);
      // Serve stale cache on API error rather than failing
      if (cached) {
        return NextResponse.json({
          jobs: cached.jobs as JobListing[],
          total: (cached.jobs as JobListing[]).length,
          cached: true,
          stale: true,
          cachedAt: cached.fetched_at,
        });
      }
      return NextResponse.json({ error: "Job API error", jobs: [], total: 0 }, { status: 502 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: { data?: any[] } = await res.json();

    const jobs: JobListing[] = (data.data ?? []).map((j) => ({
      id:             j.job_id               ?? "",
      title:          j.job_title            ?? "Untitled",
      company:        j.employer_name        ?? "Unknown",
      logo:           j.employer_logo        ?? null,
      city:           j.job_city             ?? null,
      state:          j.job_state            ?? null,
      country:        j.job_country          ?? null,
      isRemote:       j.job_is_remote        ?? false,
      postedAt:       j.job_posted_at_datetime_utc ?? null,
      applyLink:      j.job_apply_link       ?? "#",
      employmentType: j.job_employment_type  ?? null,
      minSalary:      j.job_min_salary       ?? null,
      maxSalary:      j.job_max_salary       ?? null,
      salaryCurrency: j.job_salary_currency  ?? null,
      salaryPeriod:   j.job_salary_period    ?? null,
      requiredSkills: (j.job_required_skills ?? []).slice(0, 6),
      description:    (j.job_description     ?? "").slice(0, 800).trim(),
    }));

    // ── 3. Upsert into cache ────────────────────────────────────
    const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
    await db.from("cached_jobs").upsert(
      { cache_key: cacheKey, jobs, fetched_at: new Date().toISOString(), expires_at: expiresAt },
      { onConflict: "cache_key" }
    );

    return NextResponse.json({ jobs, total: jobs.length, cached: false });
  } catch (err) {
    console.error("jobs route error:", err);
    // Serve stale cache on exception
    if (cached) {
      return NextResponse.json({
        jobs: cached.jobs as JobListing[],
        total: (cached.jobs as JobListing[]).length,
        cached: true,
        stale: true,
      });
    }
    return NextResponse.json({ error: "Failed to fetch jobs", jobs: [], total: 0 }, { status: 500 });
  }
}
