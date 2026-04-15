function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const DEMO_TIMEZONE = "Europe/Amsterdam";

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
  const formattedStart = start.toLocaleTimeString("en-US", {
    timeZone: DEMO_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const formattedEnd = end.toLocaleTimeString("en-US", {
    timeZone: DEMO_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${formattedStart} - ${formattedEnd} (Amsterdam Time)`;
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
    focusArea === "billing_invoicing" ? "Billing & Invoicing Demo" : "General Overview Demo";
  const whenTitle =
    reminderType === "24h" ? "Tomorrow's the Day!" : "Your Demo Starts in 10 Minutes";
  const subtitle =
    reminderType === "24h"
      ? "Your SoloHub demo is in 24 hours"
      : "Join now so we can start on time";

  const safeName = escapeHtml(firstName);
  const safeFocus = escapeHtml(focusLabel);
  const safeDate = escapeHtml(formatDate(scheduledFor));
  const safeTimeRange = escapeHtml(formatTimeRange(scheduledFor, durationMins));
  const safeMeetingLink = escapeHtml(meetingLink);

  return {
    subject:
      reminderType === "24h"
        ? "Reminder: Your SoloHub demo is tomorrow"
        : "Reminder: Your SoloHub demo starts in 10 minutes",
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SoloHub Demo Reminder</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#0f172a;">
    <div style="padding:24px;background:#f8fafc;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#14b8a6,#f97316);padding:36px 28px;text-align:center;">
          <div style="width:52px;height:52px;background:#ffffff;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
            <span style="font-size:24px;font-weight:700;color:#14b8a6;">S</span>
          </div>
          <h1 style="margin:0 0 6px;font-size:32px;line-height:1.2;color:#ffffff;font-weight:800;">${escapeHtml(whenTitle)}</h1>
          <p style="margin:0;font-size:16px;color:#ffedd5;">${escapeHtml(subtitle)}</p>
        </div>

        <div style="padding:28px;">
          <p style="margin:0 0 12px;font-size:18px;color:#334155;">Hi ${safeName},</p>
          <p style="margin:0 0 18px;color:#475569;line-height:1.7;">
            Just a reminder about your personalized SoloHub demo. We’re excited to show how we can help streamline your business.
          </p>

          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px;margin-bottom:20px;">
            <h3 style="margin:0 0 10px;font-size:18px;color:#0f172a;">Tomorrow's Meeting</h3>
            <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Date & Time</p>
            <p style="margin:0 0 10px;font-size:15px;color:#0f172a;font-weight:700;">${safeDate}</p>
            <p style="margin:0 0 10px;font-size:14px;color:#334155;">${safeTimeRange}</p>
            <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Meeting Type</p>
            <p style="margin:0;color:#0f172a;font-weight:700;">${safeFocus}</p>
          </div>

          <div style="text-align:center;margin:0 0 18px;">
            <a href="${safeMeetingLink}" style="display:inline-block;background:#14b8a6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;">
              Join Video Call
            </a>
            <p style="margin:10px 0 0;color:#64748b;font-size:12px;">Meeting link: ${safeMeetingLink}</p>
          </div>

          <div style="border-top:1px solid #e2e8f0;padding-top:16px;">
            <p style="margin:0;color:#475569;font-size:14px;">
              Need changes?
              <a href="mailto:hello@solohub.com?subject=Reschedule%20Demo" style="color:#0ea5b7;text-decoration:none;font-weight:600;"> Reschedule</a>
              <span style="color:#cbd5e1;margin:0 6px;">|</span>
              <a href="mailto:hello@solohub.com?subject=Cancel%20Demo" style="color:#0ea5b7;text-decoration:none;font-weight:600;">Cancel</a>
              <span style="color:#cbd5e1;margin:0 6px;">|</span>
              <a href="mailto:hello@solohub.com?subject=Demo%20Support" style="color:#0ea5b7;text-decoration:none;font-weight:600;">Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`,
  };
}

