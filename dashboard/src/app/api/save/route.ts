import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, framework, test_type, result, provider } = body;

  const { error } = await supabaseAdmin().from("test_cases").insert({
    user_id: userId,
    title,
    description,
    framework,
    test_type,
    result,
    provider,
  });

  if (error) {
    console.error("Supabase save error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
