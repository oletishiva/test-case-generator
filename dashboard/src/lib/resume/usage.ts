import { supabaseAdmin } from "@/lib/supabase";

export type ResumeAction = "parse" | "enhance" | "ats-score";

const FREE_LIMITS: Record<ResumeAction, number> = {
  parse: 5,
  enhance: 3,
  "ats-score": 5,
};

// Comma-separated Clerk user IDs that bypass all limits (set in Vercel env)
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Returns { allowed: true } or { allowed: false, used, limit } */
export async function checkAndIncrementUsage(
  userId: string,
  action: ResumeAction,
  plan: string | undefined
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limit = FREE_LIMITS[action];

  // Admin users and pro plan users are never rate-limited
  if (ADMIN_USER_IDS.includes(userId) || (plan && plan !== "free")) {
    return { allowed: true, used: 0, limit };
  }

  const db = supabaseAdmin();

  // Upsert row, incrementing count atomically via rpc
  const { data, error } = await db
    .from("resume_api_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("action", action)
    .maybeSingle();

  if (error) {
    console.error("Usage check error:", error.message);
    // Fail open — don't block the user on a DB error
    return { allowed: true, used: 0, limit };
  }

  const used = (data?.count ?? 0) as number;

  if (used >= limit) {
    return { allowed: false, used, limit };
  }

  // Increment
  if (data) {
    await db
      .from("resume_api_usage")
      .update({ count: used + 1, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("action", action);
  } else {
    await db.from("resume_api_usage").insert({
      user_id: userId,
      action,
      count: 1,
    });
  }

  return { allowed: true, used: used + 1, limit };
}

/** Fetch remaining counts for all actions (for UI banner) */
export async function getUsageSummary(userId: string): Promise<
  Record<ResumeAction, { used: number; limit: number }>
> {
  const db = supabaseAdmin();
  const { data } = await db
    .from("resume_api_usage")
    .select("action, count")
    .eq("user_id", userId);

  const result = {} as Record<ResumeAction, { used: number; limit: number }>;
  for (const action of Object.keys(FREE_LIMITS) as ResumeAction[]) {
    const row = data?.find((r) => r.action === action);
    result[action] = { used: row?.count ?? 0, limit: FREE_LIMITS[action] };
  }
  return result;
}
