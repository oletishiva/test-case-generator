import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = supabaseAdmin();
    const { data: company } = await db.from("companies").select("id").eq("clerk_user_id", userId).single();
    if (!company) return NextResponse.json({ jobs: [] });

    const { data, error } = await db
      .from("job_postings")
      .select("id, title, experience_level, location, remote, status, created_at, required_skills")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ jobs: data ?? [] });
  } catch (err) {
    console.error("recruiter/jobs GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, requiredSkills = [], experienceLevel, location, remote = true, status = "draft" } = body as {
      title: string; description?: string; requiredSkills?: string[];
      experienceLevel: string; location?: string; remote?: boolean; status?: string;
    };

    if (!title?.trim() || !experienceLevel) {
      return NextResponse.json({ error: "title and experienceLevel are required" }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { data: company } = await db.from("companies").select("id").eq("clerk_user_id", userId).single();
    if (!company) return NextResponse.json({ error: "Company profile not found" }, { status: 400 });

    const { data, error } = await db
      .from("job_postings")
      .insert({
        company_id: company.id,
        title: title.trim(),
        description: description?.trim() ?? null,
        required_skills: requiredSkills,
        experience_level: experienceLevel,
        location: location?.trim() ?? null,
        remote,
        status,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("recruiter/jobs POST error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
