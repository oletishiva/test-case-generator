import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      role,
      fullName,
      email,
      companyName,
      industry,
      size,
    } = body as {
      role: "candidate" | "recruiter";
      fullName: string;
      email: string;
      companyName?: string;
      industry?: string;
      size?: string;
    };

    if (!role || !["candidate", "recruiter"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (!fullName?.trim()) {
      return NextResponse.json({ error: "fullName is required" }, { status: 400 });
    }
    if (role === "recruiter" && !companyName?.trim()) {
      return NextResponse.json({ error: "companyName is required for recruiters" }, { status: 400 });
    }

    const db = supabaseAdmin();

    // 1. Upsert into profiles
    const { error: profileError } = await db
      .from("profiles")
      .upsert(
        { clerk_user_id: userId, role, full_name: fullName.trim(), email: email ?? "" },
        { onConflict: "clerk_user_id" }
      );
    if (profileError) throw new Error(`profiles upsert: ${profileError.message}`);

    // 2. If recruiter → upsert into companies
    if (role === "recruiter") {
      const { error: companyError } = await db
        .from("companies")
        .upsert(
          {
            clerk_user_id: userId,
            company_name: companyName!.trim(),
            industry: industry?.trim() || null,
            size: size || null,
          },
          { onConflict: "clerk_user_id" }
        );
      if (companyError) throw new Error(`companies upsert: ${companyError.message}`);
    }

    // 3. If candidate → upsert a blank candidate_profile row
    if (role === "candidate") {
      const { error: cpError } = await db
        .from("candidate_profiles")
        .upsert(
          { clerk_user_id: userId, skills: [], experience_years: 0 },
          { onConflict: "clerk_user_id" }
        );
      if (cpError) throw new Error(`candidate_profiles upsert: ${cpError.message}`);
    }

    // 4. Update Clerk publicMetadata so the role is available client-side
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    return NextResponse.json({ ok: true, role });
  } catch (err) {
    console.error("set-role error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
