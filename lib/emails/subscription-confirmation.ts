function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type SubscriptionConfirmationInput = {
  email?: string | null;
  plan?: string | null;
  billingCycle?: string | null;
  amountCents?: number | null;
  currency?: string | null;
};

export function subscriptionConfirmationEmail({
  email,
  plan,
  billingCycle,
  amountCents,
  currency,
}: SubscriptionConfirmationInput) {
  const safeEmail = email ? escapeHtml(email) : null;
  const safePlan = plan ? escapeHtml(plan) : "your selected";
  const cycleLabel =
    billingCycle === "annual"
      ? "Annual"
      : billingCycle === "monthly"
        ? "Monthly"
        : null;

  const amountLabel =
    amountCents != null && currency
      ? new Intl.NumberFormat("nl-NL", {
          style: "currency",
          currency: currency.toUpperCase(),
        }).format(amountCents / 100)
      : null;

  const subject = "Your SoloHub subscription is confirmed";

  return {
    subject,
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%);padding:28px 24px;text-align:center;">
              <p style="margin:0;font-size:12px;letter-spacing:.12em;color:#ccfbf1;font-weight:700;">SOLOHUB</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;">
              <p style="margin:0 0 14px;font-size:22px;font-weight:800;">Subscription confirmed</p>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#475569;">
                Thanks for subscribing to SoloHub. Your payment has been confirmed and we are preparing your workspace.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;color:#64748b;">Plan</td>
                  <td style="padding:14px 16px;text-align:right;font-size:13px;font-weight:700;color:#0f172a;text-transform:capitalize;">${safePlan}${cycleLabel ? ` (${cycleLabel})` : ""}</td>
                </tr>
                ${
                  amountLabel
                    ? `<tr>
                  <td style="padding:0 16px 14px;font-size:13px;color:#64748b;">Total</td>
                  <td style="padding:0 16px 14px;text-align:right;font-size:13px;font-weight:700;color:#0f172a;">${amountLabel}</td>
                </tr>`
                    : ""
                }
                ${
                  safeEmail
                    ? `<tr>
                  <td style="padding:0 16px 14px;font-size:13px;color:#64748b;">Account email</td>
                  <td style="padding:0 16px 14px;text-align:right;font-size:13px;font-weight:700;color:#0f172a;">${safeEmail}</td>
                </tr>`
                    : ""
                }
              </table>
              <p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
                If you have any questions, reply to this email or contact us at
                <a href="mailto:hello@solohub.nl" style="color:#6D28D9;text-decoration:none;">hello@solohub.nl</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}
