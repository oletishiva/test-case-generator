import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "QA automation engineer";
  const page = searchParams.get("page") ?? "1";
  const remoteOnly = searchParams.get("remote") === "true";
  const datePosted = searchParams.get("datePosted") ?? "month";

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ jobs: [], total: 0, unconfigured: true });
  }

  try {
    const url = new URL("https://jsearch.p.rapidapi.com/search");
    url.searchParams.set("query", query);
    url.searchParams.set("page", page);
    url.searchParams.set("num_pages", "1");
    url.searchParams.set("date_posted", datePosted);
    if (remoteOnly) url.searchParams.set("remote_jobs_only", "true");

    const res = await fetch(url.toString(), {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("JSearch error:", res.status, text);
      return NextResponse.json({ error: "Job API error", jobs: [], total: 0 }, { status: 502 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: { data?: any[] } = await res.json();

    const jobs: JobListing[] = (data.data ?? []).map((j) => ({
      id: j.job_id ?? "",
      title: j.job_title ?? "Untitled",
      company: j.employer_name ?? "Unknown",
      logo: j.employer_logo ?? null,
      city: j.job_city ?? null,
      state: j.job_state ?? null,
      country: j.job_country ?? null,
      isRemote: j.job_is_remote ?? false,
      postedAt: j.job_posted_at_datetime_utc ?? null,
      applyLink: j.job_apply_link ?? "#",
      employmentType: j.job_employment_type ?? null,
      minSalary: j.job_min_salary ?? null,
      maxSalary: j.job_max_salary ?? null,
      salaryCurrency: j.job_salary_currency ?? null,
      salaryPeriod: j.job_salary_period ?? null,
      requiredSkills: (j.job_required_skills ?? []).slice(0, 6),
      description: (j.job_description ?? "").slice(0, 280).trim(),
    }));

    return NextResponse.json({ jobs, total: jobs.length });
  } catch (err) {
    console.error("jobs route error:", err);
    return NextResponse.json({ error: "Failed to fetch jobs", jobs: [], total: 0 }, { status: 500 });
  }
}
