const DEMO_TIMEZONE = "Europe/Amsterdam";

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toUtcIcsDate(value: Date) {
  return value
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".000", "");
}

function formatAmsterdamDateOnly(value: Date) {
  return value.toLocaleDateString("en-US", {
    timeZone: DEMO_TIMEZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmsterdamTimeRange(start: Date, end: Date) {
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

function buildGoogleCalendarUrl({
  title,
  start,
  end,
  details,
  location,
}: {
  title: string;
  start: Date;
  end: Date;
  details: string;
  location: string;
}) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toUtcIcsDate(start)}/${toUtcIcsDate(end)}`,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildOutlookCalendarUrl({
  title,
  start,
  end,
  details,
  location,
}: {
  title: string;
  start: Date;
  end: Date;
  details: string;
  location: string;
}) {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: details,
    location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function buildAppleCalendarDataUrl({
  title,
  start,
  end,
  details,
  location,
}: {
  title: string;
  start: Date;
  end: Date;
  details: string;
  location: string;
}) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SoloHub//Demo Booking//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}`,
    `DTSTAMP:${toUtcIcsDate(new Date())}`,
    `DTSTART:${toUtcIcsDate(start)}`,
    `DTEND:${toUtcIcsDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details.replaceAll("\n", "\\n")}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export function demoBookingConfirmationEmail({
  firstName,
  focusArea,
  scheduledFor,
  meetingLink,
  durationMins,
}: {
  firstName: string;
  focusArea: string;
  scheduledFor: Date;
  meetingLink: string;
  durationMins: number;
}) {
  const end = new Date(scheduledFor.getTime() + durationMins * 60 * 1000);
  const focusLabel =
    focusArea === "billing_invoicing"
      ? "Billing & Invoicing Demo"
      : "General Overview Demo";

  const safeName = escapeHtml(firstName);
  const safeFocus = escapeHtml(focusLabel);
  const safeDateDisplay = escapeHtml(formatAmsterdamDateOnly(scheduledFor));
  const safeTimeDisplay = escapeHtml(formatAmsterdamTimeRange(scheduledFor, end));
  const safeDurationMins = escapeHtml(String(durationMins));
  const safeMeetingLink = escapeHtml(meetingLink);

  const title = "SoloHub Demo Call";
  const details = `Your SoloHub demo is confirmed.\nMeeting type: ${focusLabel}\nJoin link: ${meetingLink}`;
  const location = meetingLink;

  const googleCalendarUrl = escapeHtml(buildGoogleCalendarUrl({ title, start: scheduledFor, end, details, location }));
  const outlookCalendarUrl = escapeHtml(buildOutlookCalendarUrl({ title, start: scheduledFor, end, details, location }));
  const appleCalendarUrl = buildAppleCalendarDataUrl({ title, start: scheduledFor, end, details, location });

  return {
    subject: `Your SoloHub demo is confirmed — ${formatAmsterdamDateOnly(scheduledFor)} 🎉`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>Your SoloHub demo is confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FCFF;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your demo is locked in, ${safeName}! ${safeDateDisplay} at ${safeTimeDisplay} (Amsterdam). Add to your calendar so you don't miss it. &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#F8FCFF;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%);border-radius:16px 16px 0 0;padding:36px 32px;text-align:center;" align="center">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 14px;">
              <tr>
                <td width="48" height="48" style="width:48px;height:48px;background:#ffffff;border-radius:12px;text-align:center;vertical-align:middle;">
                  <span style="font-size:22px;font-weight:800;color:#7C3AED;font-family:Inter,Arial,Helvetica,sans-serif;line-height:48px;display:block;">S</span>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;color:rgba(255,255,255,0.75);text-transform:uppercase;font-family:Inter,Arial,Helvetica,sans-serif;">SOLOHUB</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 32px 28px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">

            <!-- Confirmed badge -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
              <tr>
                <td style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:999px;padding:5px 14px;">
                  <span style="font-size:12px;font-weight:700;color:#065F46;font-family:Inter,Arial,Helvetica,sans-serif;">&#10003;&nbsp; Demo confirmed</span>
                </td>
              </tr>
            </table>

            <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.2;">You're all set, ${safeName}! &#127881;</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;font-family:Inter,Arial,Helvetica,sans-serif;">Your SoloHub demo is confirmed. We'll walk you through <strong style="color:#0F172A;">${safeFocus}</strong> and show you exactly how SoloHub can save you hours every week.</p>

            <!-- Meeting details card -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:#F8FCFF;border:1px solid #E2E8F0;border-radius:12px;padding:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="border-bottom:1px solid #E2E8F0;padding-bottom:12px;">
                        <span style="font-size:13px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">Meeting details</span>
                      </td>
                    </tr>
                    <!-- Date/time row -->
                    <tr>
                      <td style="padding-top:14px;padding-bottom:10px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                          <tr>
                            <td width="36" style="vertical-align:top;">
                              <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                                <tr>
                                  <td width="32" height="32" style="width:32px;height:32px;background:#E0F9F7;border-radius:8px;text-align:center;vertical-align:middle;">
                                    <span style="font-size:16px;line-height:32px;display:block;">&#128197;</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td style="padding-left:12px;vertical-align:top;">
                              <span style="display:block;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:2px;">Date &amp; time</span>
                              <span style="display:block;font-size:15px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeDateDisplay}</span>
                              <span style="display:block;font-size:13px;color:#475569;font-family:Inter,Arial,Helvetica,sans-serif;">${safeTimeDisplay} · Amsterdam (CET/CEST)</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- Duration row -->
                    <tr>
                      <td style="border-top:1px solid #F1F5F9;padding-top:10px;padding-bottom:10px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                          <tr>
                            <td width="36" style="vertical-align:top;">
                              <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                                <tr>
                                  <td width="32" height="32" style="width:32px;height:32px;background:#E0F9F7;border-radius:8px;text-align:center;vertical-align:middle;">
                                    <span style="font-size:16px;line-height:32px;display:block;">&#9201;</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td style="padding-left:12px;vertical-align:top;">
                              <span style="display:block;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:2px;">Duration</span>
                              <span style="display:block;font-size:15px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeDurationMins} minutes</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- Focus row -->
                    <tr>
                      <td style="border-top:1px solid #F1F5F9;padding-top:10px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                          <tr>
                            <td width="36" style="vertical-align:top;">
                              <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                                <tr>
                                  <td width="32" height="32" style="width:32px;height:32px;background:#E0F9F7;border-radius:8px;text-align:center;vertical-align:middle;">
                                    <span style="font-size:16px;line-height:32px;display:block;">&#127775;</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td style="padding-left:12px;vertical-align:top;">
                              <span style="display:block;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:2px;">Focus area</span>
                              <span style="display:block;font-size:15px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeFocus}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Calendar buttons -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td>
                  <span style="display:block;font-size:13px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:10px;">Add to your calendar</span>
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="padding-right:8px;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                          <tr>
                            <td style="background:#F1F5F9;border:1px solid #E2E8F0;border-radius:8px;">
                              <a href="${googleCalendarUrl}" style="display:block;padding:8px 14px;font-size:12px;font-weight:700;color:#334155;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;">&#128197; Google</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="padding-right:8px;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                          <tr>
                            <td style="background:#F1F5F9;border:1px solid #E2E8F0;border-radius:8px;">
                              <a href="${outlookCalendarUrl}" style="display:block;padding:8px 14px;font-size:12px;font-weight:700;color:#334155;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;">&#128197; Outlook</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                          <tr>
                            <td style="background:#F1F5F9;border:1px solid #E2E8F0;border-radius:8px;">
                              <a href="${appleCalendarUrl}" style="display:block;padding:8px 14px;font-size:12px;font-weight:700;color:#334155;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;">&#128197; Apple / ICS</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Primary CTA -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:28px;">
              <tr>
                <td style="background:#7C3AED;border-radius:999px;">
                  <a href="${safeMeetingLink}" style="display:block;padding:13px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;">Join demo meeting &#8599;</a>
                </td>
              </tr>
            </table>

            <!-- What to expect -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:18px 20px;">
                  <span style="display:block;font-size:12px;font-weight:700;color:#9A3412;text-transform:uppercase;letter-spacing:0.06em;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:10px;">What to expect</span>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr><td style="padding-bottom:6px;"><span style="font-size:13px;color:#7C2D12;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.5;">&#10003;&nbsp; A <strong>live walkthrough</strong> of SoloHub tailored to your business type</span></td></tr>
                    <tr><td style="padding-bottom:6px;"><span style="font-size:13px;color:#7C2D12;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.5;">&#10003;&nbsp; See <strong>bookings, services &amp; calendar</strong> in action — no slides, just the real product</span></td></tr>
                    <tr><td style="padding-bottom:6px;"><span style="font-size:13px;color:#7C2D12;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.5;">&#10003;&nbsp; Time for <strong>your questions</strong> at the end</span></td></tr>
                    <tr><td><span style="font-size:13px;color:#7C2D12;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.5;">&#10003;&nbsp; No obligation — just a look at what SoloHub can do for you</span></td></tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;">Need to reschedule? Just reply to this email and we'll find a new time.</p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 16px 16px;padding:22px 32px;" align="center">
            <p style="margin:0 0 8px;font-size:16px;font-weight:800;color:#7C3AED;font-family:Inter,Arial,Helvetica,sans-serif;letter-spacing:-0.01em;">SoloHub</p>
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
</html>`,
  };
}
