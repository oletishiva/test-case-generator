/**
 * GET /api/cron/warm-jobs
 *
 * Vercel Cron Job — runs daily at 06:00 UTC.
 * Fetches jobs for all 22 countries + all topic queries from JSearch
 * and upserts into Supabase cached_jobs so users always hit the cache.
 *
 * Protected by CRON_SECRET (Vercel sets Authorization: Bearer <secret> automatically).
 * Also callable manually:  curl -H "Authorization: Bearer $CRON_SECRET" /api/cron/warm-jobs
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — enough for 22 countries × serial fetches

const COUNTRIES = [
  "us","gb","ca","au","in","de","sg",
  "nl","ie","se","ae","pl","br","nz",
  "fr","jp","mx","ph","my","za","pt","ro",
];

// Warm the most-searched query by default; add more if quota allows
const QUERIES = ["QA automation engineer"];

const CACHE_TTL_HOURS = 48;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapJob(j: any) {
  return {
    id:             j.job_id                      ?? "",
    title:          j.job_title                   ?? "Untitled",
    company:        j.employer_name               ?? "Unknown",
    logo:           j.employer_logo               ?? null,
    city:           j.job_city                    ?? null,
    state:          j.job_state                   ?? null,
    country:        j.job_country                 ?? null,
    isRemote:       j.job_is_remote               ?? false,
    postedAt:       j.job_posted_at_datetime_utc  ?? null,
    applyLink:      j.job_apply_link              ?? "#",
    employmentType: j.job_employment_type         ?? null,
    minSalary:      j.job_min_salary              ?? null,
    maxSalary:      j.job_max_salary              ?? null,
    salaryCurrency: j.job_salary_currency         ?? null,
    salaryPeriod:   j.job_salary_period           ?? null,
    requiredSkills: (j.job_required_skills ?? []).slice(0, 6),
    description:    (j.job_description    ?? "").slice(0, 800).trim(),
  };
}

/** Pause between API calls to avoid hitting rate limits */
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function GET(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return NextResponse.json({ error: "RAPIDAPI_KEY not set" }, { status: 500 });

  const db = supabaseAdmin();
  const summary: Record<string, string> = {};
  let apiCalls = 0;
  let skipped = 0;

  for (const query of QUERIES) {
    for (const country of COUNTRIES) {
      const cacheKey = `${query.toLowerCase()}|${country}|month|remote:false|p1`;

      // ── Skip if cache is still fresh (> 20h remaining) ──────────────────
      const { data: cached } = await db
        .from("cached_jobs")
        .select("expires_at")
        .eq("cache_key", cacheKey)
        .single();

      const freshUntil = cached ? new Date(cached.expires_at).getTime() : 0;
      const hoursLeft = (freshUntil - Date.now()) / 3_600_000;

      if (hoursLeft > 20) {
        summary[`${country}|${query}`] = `skip (${hoursLeft.toFixed(0)}h left)`;
        skipped++;
        continue;
      }

      // ── Fetch from JSearch ───────────────────────────────────────────────
      try {
        const url = new URL("https://jsearch.p.rapidapi.com/search");
        url.searchParams.set("query", query);
        url.searchParams.set("page", "1");
        url.searchParams.set("num_pages", "1");
        url.searchParams.set("date_posted", "month");
        url.searchParams.set("country", country);

        const res = await fetch(url.toString(), {
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          },
        });

        if (!res.ok) {
          summary[`${country}|${query}`] = `error:${res.status}`;
          await sleep(500); // back-off on error
          continue;
        }

        const data: { data?: unknown[] } = await res.json();
        const jobs = (data.data ?? []).map(mapJob);

        const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 3_600_000).toISOString();
        await db.from("cached_jobs").upsert(
          { cache_key: cacheKey, jobs, fetched_at: new Date().toISOString(), expires_at: expiresAt },
          { onConflict: "cache_key" }
        );

        summary[`${country}|${query}`] = `ok:${jobs.length} jobs`;
        apiCalls++;
      } catch (e) {
        summary[`${country}|${query}`] = `exception:${String(e)}`;
      }

      // ── Throttle: 300 ms between requests ────────────────────────────────
      await sleep(300);
    }
  }

  return NextResponse.json({
    ok: true,
    apiCalls,
    skipped,
    countries: COUNTRIES.length,
    summary,
    timestamp: new Date().toISOString(),
  });
}
