import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUsageSummary } from "@/lib/resume/usage";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const usage = await getUsageSummary(userId);
  return NextResponse.json({ usage, userId });
}
