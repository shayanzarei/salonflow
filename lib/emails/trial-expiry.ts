/**
 * Trial lifecycle emails sent by the daily Inngest cron job.
 *
 * trialWarningEmail   — sent 3 days before trial_ends_at
 * trialExpiredEmail   — sent on the day trial_ends_at passes
 */

function baseLayout(preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>SoloHub</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FCFF;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#F8FCFF;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 10px;">
              <tr>
                <td width="48" height="48" style="width:48px;height:48px;background:#ffffff;border-radius:12px;text-align:center;vertical-align:middle;">
                  <span style="font-size:22px;font-weight:800;color:#7C3AED;font-family:Inter,Arial,Helvetica,sans-serif;line-height:48px;display:block;">S</span>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:18px;font-weight:800;color:#ffffff;font-family:Inter,Arial,Helvetica,sans-serif;letter-spacing:-0.01em;">SoloHub</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 32px 32px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 16px 16px;padding:20px 32px;" align="center">
            <p style="margin:0 0 6px;font-size:12px;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;">
              <a href="https://app.solohub.nl/settings/billing" style="color:#64748B;text-decoration:none;">Billing settings</a>&nbsp;·&nbsp;
              <a href="https://solohub.nl/privacy" style="color:#64748B;text-decoration:none;">Privacy Policy</a>
            </p>
            <p style="margin:0;font-size:11px;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;">SoloHub B.V. · KvK 12345678 · Herengracht 1, Amsterdam</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function trialWarningEmail({
  firstName,
  trialEndsAt,
  billingUrl,
}: {
  firstName: string;
  trialEndsAt: Date;
  billingUrl: string;
}) {
  const daysLeft = Math.ceil(
    (trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const endDate = trialEndsAt.toLocaleDateString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const safeFirst = firstName.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const safeBillingUrl = billingUrl.replaceAll('"', "&quot;");

  const body = `
    <!-- Warning badge -->
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
      <tr>
        <td style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:999px;padding:5px 14px;">
          <span style="font-size:12px;font-weight:700;color:#92400E;font-family:Inter,Arial,Helvetica,sans-serif;">&#9200;&nbsp; ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left in your trial</span>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 10px;font-size:24px;font-weight:800;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.25;">
      Your free trial ends ${daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`}, ${safeFirst}
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;font-family:Inter,Arial,Helvetica,sans-serif;">
      Your SoloHub trial runs until <strong>${endDate}</strong>. After that, your booking page will go offline and you'll lose access to your dashboard. Subscribe now to keep everything running without interruption.
    </p>

    <!-- What you keep -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td style="background:#F0FDFC;border:1px solid #CCFBF1;border-radius:12px;padding:20px;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">What stays with you when you subscribe</p>
          ${[
            "All your bookings and client history",
            "Your live booking website",
            "Automated reminders and confirmations",
            "Revenue reports and invoicing",
          ]
            .map(
              (item) =>
                `<p style="margin:0 0 8px;font-size:13px;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">
                  <span style="color:#7C3AED;font-weight:700;margin-right:8px;">&#10003;</span>${item}
                </p>`
            )
            .join("")}
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0" role="presentation">
            <tr>
              <td style="border-radius:12px;background:linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%);">
                <a href="${safeBillingUrl}" style="display:block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;border-radius:12px;">
                  Choose a plan &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#94A3B8;text-align:center;font-family:Inter,Arial,Helvetica,sans-serif;">No credit card surprises — cancel any time.</p>
  `;

  return {
    subject: `⏳ Your SoloHub trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""} — keep your momentum`,
    html: baseLayout(
      `Your trial ends ${endDate}. Subscribe now to keep your booking site live.`,
      body
    ),
  };
}

export function trialExpiredEmail({
  firstName,
  billingUrl,
}: {
  firstName: string;
  billingUrl: string;
}) {
  const safeFirst = firstName.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const safeBillingUrl = billingUrl.replaceAll('"', "&quot;");

  const body = `
    <!-- Expired badge -->
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
      <tr>
        <td style="background:#FEE2E2;border:1px solid #FECACA;border-radius:999px;padding:5px 14px;">
          <span style="font-size:12px;font-weight:700;color:#991B1B;font-family:Inter,Arial,Helvetica,sans-serif;">&#128683;&nbsp; Trial ended — booking site is offline</span>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 10px;font-size:24px;font-weight:800;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.25;">
      Your trial has ended, ${safeFirst}
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;font-family:Inter,Arial,Helvetica,sans-serif;">
      Your free trial period is over. Your booking page is currently offline and clients can no longer book appointments. The good news: all your data is safe and a subscription gets you back up in seconds.
    </p>

    <!-- Impact callout -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td style="background:#FFF7ED;border:1px solid #FED7AA;border-left:4px solid #F97316;border-radius:0 12px 12px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#7C2D12;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.6;">
            Every day without a subscription is a day clients who visit your booking page bounce — and book somewhere else.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0" role="presentation">
            <tr>
              <td style="border-radius:12px;background:linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%);">
                <a href="${safeBillingUrl}" style="display:block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;border-radius:12px;">
                  Reactivate my account &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#94A3B8;text-align:center;font-family:Inter,Arial,Helvetica,sans-serif;">
      Plans start from €29/month · Cancel any time
    </p>
  `;

  return {
    subject: `Your SoloHub trial has ended — reactivate to get back online`,
    html: baseLayout(
      "Your booking site is currently offline. Choose a plan to reactivate in seconds.",
      body
    ),
  };
}
