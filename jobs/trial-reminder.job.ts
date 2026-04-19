import pool from "@/lib/db";
import { trialWarningEmail, trialExpiredEmail } from "@/lib/emails/trial-expiry";
import { sendEmail } from "@/lib/emails/send";
import { inngest } from "@/lib/inngest";

/**
 * Daily cron job that sends trial lifecycle emails.
 *
 * Sends:
 *  1. 3-day warning  — when trial_ends_at is 3 days away (±12 h window)
 *  2. Expiry notice  — when trial_ends_at has passed and the tenant is still
 *                      in 'trial' status (not yet subscribed / suspended)
 *
 * Both sends are idempotent: the timestamp columns trial_warning_3d_sent_at
 * and trial_expired_email_sent_at prevent double-sends across multiple runs.
 */
export const sendTrialEmails = inngest.createFunction(
  {
    id: "send-trial-emails",
    name: "Send trial lifecycle emails",
    triggers: [{ cron: "0 9 * * *" }], // 09:00 UTC every day
  },
  async () => {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.solohub.nl").replace(/\/$/, "");
    const billingUrl = `${appUrl}/settings/billing`;

    const now = new Date();

    // ── 3-day warning ─────────────────────────────────────────────────────────
    // Window: trial ends between 2.5 and 3.5 days from now
    const warningWindowStart = new Date(now.getTime() + 2.5 * 24 * 60 * 60 * 1000);
    const warningWindowEnd   = new Date(now.getTime() + 3.5 * 24 * 60 * 60 * 1000);

    const warningResult = await pool.query(
      `SELECT id, owner_email, owner_first_name, name, trial_ends_at
       FROM tenants
       WHERE tenant_status = 'trial'
         AND trial_ends_at BETWEEN $1 AND $2
         AND trial_warning_3d_sent_at IS NULL`,
      [warningWindowStart, warningWindowEnd]
    );

    let warningSent = 0;
    for (const tenant of warningResult.rows) {
      const email = tenant.owner_email as string | null;
      if (!email) continue;

      const { subject, html } = trialWarningEmail({
        firstName: (tenant.owner_first_name as string | null) ?? (tenant.name as string),
        trialEndsAt: new Date(tenant.trial_ends_at as string),
        billingUrl,
      });

      const ok = await sendEmail({
        to: email,
        subject,
        html,
        from: "SoloHub <hello@solohub.nl>",
      });

      if (ok) {
        await pool.query(
          `UPDATE tenants SET trial_warning_3d_sent_at = NOW() WHERE id = $1`,
          [tenant.id]
        );
        warningSent++;
      }
    }

    // ── Expiry notice ─────────────────────────────────────────────────────────
    // Trigger when trial_ends_at < NOW() and account is still in 'trial' status.
    // (Subscribed/active tenants are excluded automatically because their status
    //  switches to 'active' when the Stripe webhook fires.)
    const expiredResult = await pool.query(
      `SELECT id, owner_email, owner_first_name, name
       FROM tenants
       WHERE tenant_status = 'trial'
         AND trial_ends_at < NOW()
         AND trial_expired_email_sent_at IS NULL`,
    );

    let expiredSent = 0;
    for (const tenant of expiredResult.rows) {
      const email = tenant.owner_email as string | null;
      if (!email) continue;

      const { subject, html } = trialExpiredEmail({
        firstName: (tenant.owner_first_name as string | null) ?? (tenant.name as string),
        billingUrl,
      });

      const ok = await sendEmail({
        to: email,
        subject,
        html,
        from: "SoloHub <hello@solohub.nl>",
      });

      if (ok) {
        await pool.query(
          `UPDATE tenants SET trial_expired_email_sent_at = NOW() WHERE id = $1`,
          [tenant.id]
        );
        expiredSent++;
      }
    }

    return { warningSent, expiredSent };
  }
);
