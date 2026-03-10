import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { data, error } = await supabaseAdmin()
      .from("mock_interviews")
      .select("*")
      .eq("id", id)
      .eq("candidate_clerk_id", userId)
      .single();

    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ session: data });
  } catch (err) {
    console.error("mock-interview/[id] GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
