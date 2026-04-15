function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const TOPIC_LABELS: Record<string, string> = {
  sales: "Sales Inquiry",
  support: "Technical Support",
  billing: "Billing Question",
  other: "Other",
};

export function contactReceivedUserEmail({
  firstName,
  topic,
  message,
}: {
  firstName: string;
  topic: string;
  message: string;
}) {
  const safeName = escapeHtml(firstName);
  const topicLabel = TOPIC_LABELS[topic] ?? TOPIC_LABELS.other;
  const safeTopic = escapeHtml(topicLabel);
  const safeMessage = escapeHtml(message);

  return {
    subject: "We received your message - SoloHub",
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:620px;margin:24px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="padding:24px;background:linear-gradient(90deg,#14b8a6,#0ea5b7);text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:26px;">Thanks, we got your message</h1>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 10px;">Hi ${safeName},</p>
        <p style="margin:0 0 16px;color:#475569;">
          Our team received your message and will reply as soon as possible.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
          <p style="margin:0 0 8px;"><strong>Topic:</strong> ${safeTopic}</p>
          <p style="margin:0;"><strong>Your message:</strong><br/>${safeMessage}</p>
        </div>
        <p style="margin:16px 0 0;color:#64748b;font-size:13px;">
          If urgent, reply directly to this email.
        </p>
      </div>
    </div>
  </body>
</html>`,
  };
}

