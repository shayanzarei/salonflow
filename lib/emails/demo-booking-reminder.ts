const DEMO_TIMEZONE = "Europe/Amsterdam";

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value: Date) {
  return value.toLocaleDateString("en-US", {
    timeZone: DEMO_TIMEZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeRange(start: Date, durationMins: number) {
  const end = new Date(start.getTime() + durationMins * 60 * 1000);
  const formattedStart = start.toLocaleTimeString("nl-NL", {
    timeZone: DEMO_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const formattedEnd = end.toLocaleTimeString("nl-NL", {
    timeZone: DEMO_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${formattedStart}–${formattedEnd}`;
}

export function demoBookingReminderEmail({
  firstName,
  focusArea,
  scheduledFor,
  meetingLink,
  durationMins,
  reminderType,
}: {
  firstName: string;
  focusArea: string;
  scheduledFor: Date;
  meetingLink: string;
  durationMins: number;
  reminderType: "24h" | "10m";
}) {
  const focusLabel =
    focusArea === "billing_invoicing"
      ? "Billing & Invoicing Demo"
      : "General Overview Demo";

  const safeName = escapeHtml(firstName);
  const safeFocus = escapeHtml(focusLabel);
  const safeDateDisplay = escapeHtml(formatDate(scheduledFor));
  const safeTimeDisplay = escapeHtml(formatTimeRange(scheduledFor, durationMins));
  const safeDurationMins = escapeHtml(String(durationMins));
  const safeMeetingLink = escapeHtml(meetingLink);

  const is24h = reminderType === "24h";

  const subject = is24h
    ? `Your SoloHub demo is tomorrow at ${formatTimeRange(scheduledFor, durationMins)} ⏰`
    : `🔔 10 minutes, ${firstName} — your SoloHub demo is starting now!`;

  const html24h = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>Your demo is tomorrow — SoloHub</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FCFF;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your SoloHub demo is tomorrow at ${safeTimeDisplay}, ${safeName}. Here's your link and everything you need. &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#F8FCFF;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#11C4B6 0%,#0EA5B7 100%);border-radius:16px 16px 0 0;padding:36px 32px;text-align:center;" align="center">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 14px;">
              <tr>
                <td width="48" height="48" style="width:48px;height:48px;background:#ffffff;border-radius:12px;text-align:center;vertical-align:middle;">
                  <span style="font-size:22px;font-weight:800;color:#11C4B6;font-family:Inter,Arial,Helvetica,sans-serif;line-height:48px;display:block;">S</span>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;color:rgba(255,255,255,0.75);text-transform:uppercase;font-family:Inter,Arial,Helvetica,sans-serif;">SOLOHUB</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 32px 28px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">

            <!-- Reminder badge -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
              <tr>
                <td style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:999px;padding:5px 14px;">
                  <span style="font-size:12px;font-weight:700;color:#9A3412;font-family:Inter,Arial,Helvetica,sans-serif;">&#128338;&nbsp; Reminder — tomorrow</span>
                </td>
              </tr>
            </table>

            <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.2;">See you tomorrow, ${safeName}!</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;font-family:Inter,Arial,Helvetica,sans-serif;">Just a friendly heads-up — your SoloHub demo is <strong style="color:#0F172A;">tomorrow</strong>. Your meeting link is ready below.</p>

            <!-- Meeting summary card -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:28px;">
              <tr>
                <td style="background:#F8FCFF;border:1px solid #E2E8F0;border-radius:12px;padding:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="border-bottom:1px solid #E2E8F0;padding-bottom:12px;">
                        <span style="font-size:13px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">Your demo</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="110" style="padding-top:14px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">When</span>
                      </td>
                      <td style="padding-top:14px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:14px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeDateDisplay}</span>
                        <span style="display:block;font-size:13px;color:#475569;font-family:Inter,Arial,Helvetica,sans-serif;">${safeTimeDisplay} · Amsterdam (CET/CEST)</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="110" style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">Topic</span>
                      </td>
                      <td style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:14px;font-weight:600;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeFocus}</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="110" style="border-top:1px solid #F1F5F9;padding-top:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">Duration</span>
                      </td>
                      <td style="border-top:1px solid #F1F5F9;padding-top:8px;vertical-align:top;">
                        <span style="font-size:14px;font-weight:600;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeDurationMins} minutes</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:16px;">
              <tr>
                <td style="background:#11C4B6;border-radius:999px;">
                  <a href="${safeMeetingLink}" style="display:block;padding:13px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;">View booking details &#8599;</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 24px;font-size:13px;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;">Your meeting link will be ready to join at the start time.</p>

            <!-- Tip block -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:14px 16px;">
                  <span style="font-size:12px;font-weight:700;color:#166534;font-family:Inter,Arial,Helvetica,sans-serif;display:block;margin-bottom:4px;">&#128161; Quick tip</span>
                  <span style="font-size:13px;color:#166534;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.5;">Think of 1–2 things you find most tedious in your current workflow — we'll show you exactly how SoloHub handles them.</span>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 16px 16px;padding:22px 32px;" align="center">
            <p style="margin:0 0 8px;font-size:16px;font-weight:800;color:#11C4B6;font-family:Inter,Arial,Helvetica,sans-serif;letter-spacing:-0.01em;">SoloHub</p>
            <p style="margin:0 0 6px;font-size:12px;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;">
              <a href="https://solohub.nl" style="color:#64748B;text-decoration:none;margin:0 6px;">solohub.nl</a>&nbsp;·&nbsp;
              <a href="https://solohub.nl/privacy" style="color:#64748B;text-decoration:none;margin:0 6px;">Privacy Policy</a>&nbsp;·&nbsp;
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

  const html10m = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>Your demo starts in 10 minutes — SoloHub</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FCFF;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">&#128680; 10 minutes, ${safeName}! Your SoloHub demo link is right here — click to join now. &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#F8FCFF;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#11C4B6 0%,#0EA5B7 100%);border-radius:16px 16px 0 0;padding:36px 32px;text-align:center;" align="center">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 14px;">
              <tr>
                <td width="48" height="48" style="width:48px;height:48px;background:#ffffff;border-radius:12px;text-align:center;vertical-align:middle;">
                  <span style="font-size:22px;font-weight:800;color:#11C4B6;font-family:Inter,Arial,Helvetica,sans-serif;line-height:48px;display:block;">S</span>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;color:rgba(255,255,255,0.75);text-transform:uppercase;font-family:Inter,Arial,Helvetica,sans-serif;">SOLOHUB</p>
          </td>
        </tr>

        <!-- Urgency banner -->
        <tr>
          <td style="background:#F97316;padding:12px 32px;" align="center">
            <p style="margin:0;font-size:14px;font-weight:800;color:#ffffff;font-family:Inter,Arial,Helvetica,sans-serif;">&#128680;&nbsp; Starting in 10 minutes — open your link now!</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 32px 28px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">

            <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.2;">Almost time, ${safeName}!</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;font-family:Inter,Arial,Helvetica,sans-serif;">Your SoloHub demo kicks off in <strong style="color:#F97316;">10 minutes</strong>. Click the button below to join — no download needed.</p>

            <!-- Big join CTA -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:#11C4B6;border-radius:999px;">
                  <a href="${safeMeetingLink}" style="display:block;padding:16px 36px;font-size:17px;font-weight:800;color:#ffffff;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;">&#127902;&nbsp; Join demo now &#8599;</a>
                </td>
              </tr>
            </table>

            <!-- Compact meeting info -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:#F8FCFF;border:1px solid #E2E8F0;border-radius:12px;padding:16px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td width="50%" style="padding-right:10px;border-right:1px solid #E2E8F0;">
                        <span style="display:block;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:3px;">Starting at</span>
                        <span style="font-size:15px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeTimeDisplay}</span>
                        <span style="display:block;font-size:12px;color:#64748B;font-family:Inter,Arial,Helvetica,sans-serif;">Amsterdam (CET/CEST)</span>
                      </td>
                      <td width="50%" style="padding-left:10px;">
                        <span style="display:block;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:3px;">Duration</span>
                        <span style="font-size:15px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeDurationMins} minutes</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Trouble alert -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:14px 16px;">
                  <span style="font-size:12px;font-weight:700;color:#9A3412;font-family:Inter,Arial,Helvetica,sans-serif;display:block;margin-bottom:4px;">&#9888;&#65039; Having trouble joining?</span>
                  <span style="font-size:13px;color:#7C2D12;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.5;">Simply reply to this email or send us a WhatsApp — we'll get you connected right away.</span>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 16px 16px;padding:22px 32px;" align="center">
            <p style="margin:0 0 8px;font-size:16px;font-weight:800;color:#11C4B6;font-family:Inter,Arial,Helvetica,sans-serif;letter-spacing:-0.01em;">SoloHub</p>
            <p style="margin:0 0 6px;font-size:12px;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;">
              <a href="https://solohub.nl" style="color:#64748B;text-decoration:none;margin:0 6px;">solohub.nl</a>&nbsp;·&nbsp;
              <a href="https://solohub.nl/privacy" style="color:#64748B;text-decoration:none;margin:0 6px;">Privacy Policy</a>&nbsp;·&nbsp;
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

  return {
    subject,
    html: is24h ? html24h : html10m,
  };
}
