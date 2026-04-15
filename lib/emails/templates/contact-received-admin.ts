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

export function contactReceivedAdminEmail({
  firstName,
  lastName,
  email,
  topic,
  message,
}: {
  firstName: string;
  lastName: string;
  email: string;
  topic: string;
  message: string;
}) {
  const fullName = `${firstName} ${lastName}`.trim();
  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safeTopic = escapeHtml(TOPIC_LABELS[topic] ?? TOPIC_LABELS.other);
  const safeMessage = escapeHtml(message);

  return {
    subject: `New contact form submission: ${safeTopic}`,
    html: `<!DOCTYPE html>
<html lang="en">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="padding:16px 20px;background:#0f172a;color:#fff;font-weight:700;">New Contact Message</div>
      <div style="padding:20px;">
        <p style="margin:0 0 10px;"><strong>From:</strong> ${safeName}</p>
        <p style="margin:0 0 10px;"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin:0 0 14px;"><strong>Topic:</strong> ${safeTopic}</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;white-space:pre-wrap;">${safeMessage}</div>
      </div>
    </div>
  </body>
</html>`,
  };
}

