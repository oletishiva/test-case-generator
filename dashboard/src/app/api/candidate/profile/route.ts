import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await supabaseAdmin()
      .from("candidate_profiles")
      .select("skills, experience_years, bio, linkedin_url, github_url")
      .eq("clerk_user_id", userId)
      .single();

    return NextResponse.json({ profile: data ?? { skills: [], experience_years: 0, bio: "", linkedin_url: "", github_url: "" } });
  } catch (err) {
    console.error("candidate/profile GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { skills, experience_years, bio, linkedin_url, github_url } = await req.json();

    const { error } = await supabaseAdmin()
      .from("candidate_profiles")
      .upsert(
        { clerk_user_id: userId, skills: skills ?? [], experience_years: experience_years ?? 0, bio: bio ?? null, linkedin_url: linkedin_url ?? null, github_url: github_url ?? null },
        { onConflict: "clerk_user_id" }
      );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("candidate/profile PUT error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
