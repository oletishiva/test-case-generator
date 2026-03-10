import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function buildHRInviteEmail(opts: {
  companyName: string;
  assessmentTitle: string;
  hrInterviewUrl: string;
  isNewUser: boolean;
  signUpUrl: string;
}) {
  const { companyName, assessmentTitle, hrInterviewUrl, isNewUser, signUpUrl } = opts;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4338ca,#7c3aed);padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px;">
              <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:8px;display:inline-block;line-height:36px;text-align:center;font-weight:900;font-size:16px;color:#fff;">A</div>
              <span style="color:#fff;font-size:20px;font-weight:700;">AITestCraft</span>
            </div>
            <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;">HR Round Interview Invitation</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">You're invited to an HR Interview!</h1>
            <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
              <strong style="color:#e2e8f0;">${companyName}</strong> has invited you to complete an AI-powered HR round interview as part of the <strong style="color:#e2e8f0;">${assessmentTitle}</strong> hiring process.
            </p>

            <!-- Info card -->
            <div style="background:#1e1b4b;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #312e81;">
              <p style="color:#a5b4fc;font-size:14px;margin:0 0 12px;line-height:1.6;">In this AI-powered HR interview you will:</p>
              <ul style="color:#c7d2fe;font-size:14px;margin:0;padding-left:20px;line-height:2;">
                <li>Paste your resume to personalise the interview</li>
                <li>Answer up to 20 conversational questions</li>
                <li>Receive follow-up questions based on your answers</li>
                <li>Get an instant score and detailed feedback</li>
              </ul>
            </div>

            ${isNewUser ? `
            <!-- New user notice -->
            <div style="background:#1e3a2e;border:1px solid #166534;border-radius:10px;padding:16px;margin-bottom:24px;">
              <p style="color:#86efac;font-size:13px;margin:0;line-height:1.6;">
                <strong>First time?</strong> Create your free AITestCraft account first, then you'll be taken straight to the interview.
              </p>
              <a href="${signUpUrl}" style="display:inline-block;margin-top:10px;color:#4ade80;font-size:13px;font-weight:600;text-decoration:none;">
                Create account → ${signUpUrl}
              </a>
            </div>
            ` : ""}

            <!-- CTA -->
            <div style="text-align:center;margin:32px 0;">
              <a href="${hrInterviewUrl}" style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#fff;font-size:16px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.01em;">
                Start HR Interview →
              </a>
            </div>

            <p style="color:#475569;font-size:12px;text-align:center;margin:0;line-height:1.6;">
              Have your resume ready to paste before you begin. The interview is conversational — answer naturally and honestly.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0a0f1e;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
            <p style="color:#334155;font-size:12px;margin:0;">Powered by <strong style="color:#475569;">AITestCraft</strong> · AI-powered HR interviews</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildInviteEmail(opts: {
  candidateEmail: string;
  assessmentTitle: string;
  companyName: string;
  timeLimitMinutes: number;
  passingScore: number;
  assessmentUrl: string;
  isNewUser: boolean;
  signUpUrl: string;
}) {
  const { assessmentTitle, companyName, timeLimitMinutes, passingScore, assessmentUrl, isNewUser, signUpUrl } = opts;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px;">
              <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:8px;display:inline-block;line-height:36px;text-align:center;font-weight:900;font-size:16px;color:#fff;">A</div>
              <span style="color:#fff;font-size:20px;font-weight:700;">AITestCraft</span>
            </div>
            <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;">Technical Assessment Invitation</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">You've been invited!</h1>
            <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
              <strong style="color:#e2e8f0;">${companyName}</strong> has invited you to complete a technical assessment as part of their hiring process.
            </p>

            <!-- Assessment card -->
            <div style="background:#1e293b;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #334155;">
              <h2 style="color:#e2e8f0;font-size:18px;font-weight:600;margin:0 0 16px;">${assessmentTitle}</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-bottom:12px;">
                    <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:4px;">Time Limit</span>
                    <span style="color:#e2e8f0;font-size:15px;font-weight:600;">${timeLimitMinutes} minutes</span>
                  </td>
                  <td width="50%" style="padding-bottom:12px;">
                    <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:4px;">Passing Score</span>
                    <span style="color:#e2e8f0;font-size:15px;font-weight:600;">${passingScore}%</span>
                  </td>
                </tr>
              </table>
            </div>

            ${isNewUser ? `
            <!-- New user notice -->
            <div style="background:#1e3a2e;border:1px solid #166534;border-radius:10px;padding:16px;margin-bottom:24px;">
              <p style="color:#86efac;font-size:13px;margin:0;line-height:1.6;">
                <strong>First time?</strong> Create your free AITestCraft account first, then you'll be taken straight to the assessment.
              </p>
              <a href="${signUpUrl}" style="display:inline-block;margin-top:10px;color:#4ade80;font-size:13px;font-weight:600;text-decoration:none;">
                Create account → ${signUpUrl}
              </a>
            </div>
            ` : ""}

            <!-- CTA -->
            <div style="text-align:center;margin:32px 0;">
              <a href="${assessmentUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:16px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.01em;">
                Start Assessment →
              </a>
            </div>

            <p style="color:#475569;font-size:12px;text-align:center;margin:0;line-height:1.6;">
              Once started, the timer cannot be paused. Make sure you are in a quiet environment before beginning.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0a0f1e;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
            <p style="color:#334155;font-size:12px;margin:0;">Powered by <strong style="color:#475569;">AITestCraft</strong> · Fair, AI-graded technical assessments</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: assessmentId } = await params;
    const { candidateClerkId, candidateEmail, inviteType } = await req.json();
    const isHRInvite = inviteType === "hr_interview";

    if (!candidateClerkId && !candidateEmail) {
      return NextResponse.json({ error: "candidateClerkId or candidateEmail is required" }, { status: 400 });
    }

    const db = supabaseAdmin();

    // Verify recruiter owns this assessment
    const { data: assessment } = await db
      .from("assessments")
      .select("id, title, time_limit_minutes, passing_score, company:companies!inner(clerk_user_id, company_name)")
      .eq("id", assessmentId)
      .single();

    if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

    const company = (assessment.company as unknown) as { clerk_user_id: string; company_name: string } | null;
    if (company?.clerk_user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Resolve clerk_user_id from email if needed
    let targetClerkId = candidateClerkId;
    let resolvedEmail = candidateEmail ?? "";
    let isNewUser = false;

    if (!targetClerkId && candidateEmail) {
      const { data: profile } = await db
        .from("profiles")
        .select("clerk_user_id, email")
        .eq("email", candidateEmail)
        .eq("role", "candidate")
        .single();

      if (profile) {
        targetClerkId = profile.clerk_user_id;
        resolvedEmail = profile.email ?? candidateEmail;
      } else {
        // Not registered yet — still send the invite email with sign-up link
        isNewUser = true;
        resolvedEmail = candidateEmail;
        // We can't create a candidate_assessments record without a clerk_id,
        // so we return a special response indicating the email was sent but
        // the candidate needs to sign up first.
        // Send email and return early
        if (process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";
          if (isHRInvite) {
            await resend.emails.send({
              from: "AITestCraft <onboarding@resend.dev>",
              to: resolvedEmail,
              subject: `${company?.company_name ?? "A company"} invites you to an HR Interview`,
              html: buildHRInviteEmail({
                companyName: company?.company_name ?? "A company",
                assessmentTitle: assessment.title,
                hrInterviewUrl: `${appUrl}/candidate/hr-interview?assessmentId=${assessmentId}`,
                isNewUser: true,
                signUpUrl: `${appUrl}/sign-up`,
              }),
            });
          } else {
            await resend.emails.send({
              from: "AITestCraft <onboarding@resend.dev>",
              to: resolvedEmail,
              subject: `You've been invited to take: ${assessment.title}`,
              html: buildInviteEmail({
                candidateEmail: resolvedEmail,
                assessmentTitle: assessment.title,
                companyName: company?.company_name ?? "A company",
                timeLimitMinutes: assessment.time_limit_minutes,
                passingScore: assessment.passing_score,
                assessmentUrl: `${appUrl}/candidate/assessments/${assessmentId}`,
                isNewUser: true,
                signUpUrl: `${appUrl}/sign-up`,
              }),
            });
          }
        }
        return NextResponse.json({
          ok: true,
          emailSent: true,
          warning: "Candidate not yet registered. Invite email sent with sign-up link.",
        });
      }
    }

    // HR Interview invite — just send email, no candidate_assessments record needed
    if (isHRInvite) {
      if (process.env.RESEND_API_KEY && resolvedEmail) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";
          await resend.emails.send({
            from: "AITestCraft <onboarding@resend.dev>",
            to: resolvedEmail,
            subject: `${company?.company_name ?? "A company"} invites you to an HR Interview`,
            html: buildHRInviteEmail({
              companyName: company?.company_name ?? "A company",
              assessmentTitle: assessment.title,
              hrInterviewUrl: `${appUrl}/candidate/hr-interview?assessmentId=${assessmentId}`,
              isNewUser,
              signUpUrl: `${appUrl}/sign-up`,
            }),
          });
        } catch (emailErr) {
          console.warn("HR invite email send failed (non-fatal):", emailErr);
        }
      }
      return NextResponse.json({ ok: true, emailSent: !!process.env.RESEND_API_KEY });
    }

    // Upsert invite (idempotent)
    const { error } = await db
      .from("candidate_assessments")
      .upsert(
        { assessment_id: assessmentId, candidate_clerk_id: targetClerkId, status: "invited" },
        { onConflict: "assessment_id,candidate_clerk_id", ignoreDuplicates: true }
      );

    if (error) throw error;

    // Send invite email
    if (process.env.RESEND_API_KEY && resolvedEmail) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";
        await resend.emails.send({
          from: "AITestCraft <onboarding@resend.dev>",
          to: resolvedEmail,
          subject: `You've been invited to take: ${assessment.title}`,
          html: buildInviteEmail({
            candidateEmail: resolvedEmail,
            assessmentTitle: assessment.title,
            companyName: company?.company_name ?? "A company",
            timeLimitMinutes: assessment.time_limit_minutes,
            passingScore: assessment.passing_score,
            assessmentUrl: `${appUrl}/candidate/assessments/${assessmentId}`,
            isNewUser,
            signUpUrl: `${appUrl}/sign-up`,
          }),
        });
      } catch (emailErr) {
        console.warn("Email send failed (non-fatal):", emailErr);
      }
    }

    return NextResponse.json({ ok: true, emailSent: !!process.env.RESEND_API_KEY });
  } catch (err) {
    console.error("recruiter/assessments/[id]/invite error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
