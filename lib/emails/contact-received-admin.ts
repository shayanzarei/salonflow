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
  const topicLabel = TOPIC_LABELS[topic] ?? TOPIC_LABELS.other;
  const safeName = escapeHtml(`${firstName} ${lastName}`.trim());
  const safeFirstName = escapeHtml(firstName);
  const safeEmail = escapeHtml(email);
  const safeTopic = escapeHtml(topicLabel);
  const safeMessage = escapeHtml(message);
  const replySubject = encodeURIComponent("Re: Your SoloHub enquiry");
  const replyBody = encodeURIComponent(`Hi ${firstName},\n\nThanks for reaching out!`);

  return {
    subject: `New contact: ${topicLabel} from ${firstName} ${lastName}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>New contact: ${safeTopic} — SoloHub</title>
</head>
<body style="margin:0;padding:0;background-color:#F1F5F9;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${safeName} sent a message — topic: ${safeTopic}. Reply directly to this email. &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#F1F5F9;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- Header — dark navy (internal) -->
        <tr>
          <td style="background:#0F172A;border-radius:16px 16px 0 0;padding:24px 32px;" align="left">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td width="32" height="32" style="width:32px;height:32px;background:#11C4B6;border-radius:8px;text-align:center;vertical-align:middle;">
                        <span style="font-size:16px;font-weight:800;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;line-height:32px;display:block;">S</span>
                      </td>
                      <td style="padding-left:10px;vertical-align:middle;">
                        <span style="font-size:14px;font-weight:700;color:#ffffff;font-family:Inter,Arial,Helvetica,sans-serif;letter-spacing:-0.01em;">SoloHub</span>
                        <span style="font-size:12px;color:#64748B;font-family:Inter,Arial,Helvetica,sans-serif;margin-left:6px;">Internal</span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="background:#1E3A5F;border:1px solid #334155;border-radius:999px;padding:4px 12px;">
                        <span style="font-size:11px;font-weight:700;color:#93C5FD;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;">&#9679;&nbsp; New message</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Alert banner -->
        <tr>
          <td style="background:#11C4B6;padding:10px 32px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">&#128338;&nbsp; New contact form submission — reply within 4 hours</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">

            <!-- Sender details card -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td colspan="2" style="border-bottom:1px solid #E2E8F0;padding-bottom:12px;">
                        <span style="font-size:12px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;text-transform:uppercase;letter-spacing:0.06em;">Sender</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="110" style="padding-top:14px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">Name</span>
                      </td>
                      <td style="padding-top:14px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:14px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeName}</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="110" style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">Email</span>
                      </td>
                      <td style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <a href="mailto:${safeEmail}" style="font-size:14px;font-weight:600;color:#11C4B6;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;">${safeEmail}</a>
                      </td>
                    </tr>
                    <tr>
                      <td width="110" style="border-top:1px solid #F1F5F9;padding-top:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">Topic</span>
                      </td>
                      <td style="border-top:1px solid #F1F5F9;padding-top:8px;vertical-align:top;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                          <tr>
                            <td style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:999px;padding:3px 10px;">
                              <span style="font-size:12px;font-weight:700;color:#1D4ED8;font-family:Inter,Arial,Helvetica,sans-serif;">${safeTopic}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Message -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:28px;">
              <tr>
                <td>
                  <span style="display:block;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:10px;">Message</span>
                  <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-left:3px solid #11C4B6;border-radius:0 8px 8px 0;padding:16px 18px;">
                    <span style="font-size:15px;color:#334155;line-height:1.7;font-family:Inter,Arial,Helvetica,sans-serif;white-space:pre-wrap;">${safeMessage}</span>
                  </div>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:16px;">
              <tr>
                <td style="background:#0F172A;border-radius:999px;">
                  <a href="mailto:${safeEmail}?subject=${replySubject}&body=${replyBody}" style="display:block;padding:13px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;">Reply to ${safeFirstName} &#8599;</a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:12px;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;">Or copy the address above and reply from your preferred email client.</p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0F172A;border-radius:0 0 16px 16px;padding:18px 32px;" align="center">
            <p style="margin:0 0 4px;font-size:12px;color:#475569;font-family:Inter,Arial,Helvetica,sans-serif;">This is an internal SoloHub notification. Do not forward externally.</p>
            <p style="margin:0;font-size:11px;color:#334155;font-family:Inter,Arial,Helvetica,sans-serif;">SoloHub B.V. · KvK 12345678 · Herengracht 1, Amsterdam</p>
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
