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
  const safeDateOnly = escapeHtml(formatAmsterdamDateOnly(scheduledFor));
  const safeTimeRange = escapeHtml(formatAmsterdamTimeRange(scheduledFor, end));
  const safeDuration = escapeHtml(
    `${durationMins}-minute personalized walkthrough`
  );
  const safeMeetingLink = escapeHtml(meetingLink);

  const title = "SoloHub Demo Call";
  const details = `Your SoloHub demo is confirmed.\nMeeting type: ${focusLabel}\nJoin link: ${meetingLink}`;
  const location = meetingLink;
  const googleCalendarUrl = buildGoogleCalendarUrl({
    title,
    start: scheduledFor,
    end,
    details,
    location,
  });
  const outlookCalendarUrl = buildOutlookCalendarUrl({
    title,
    start: scheduledFor,
    end,
    details,
    location,
  });
  const appleCalendarUrl = buildAppleCalendarDataUrl({
    title,
    start: scheduledFor,
    end,
    details,
    location,
  });

  return {
    subject: "You're all set! Your SoloHub demo is confirmed",
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SoloHub Demo Confirmation</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#0f172a;">
    <div style="background:#f8fafc;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 10px 30px rgba(15,23,42,0.08);overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:linear-gradient(90deg,#14b8a6,#0ea5b7);padding:48px 32px;text-align:center;">
          <div style="width:64px;height:64px;background:#ffffff;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 10px 24px rgba(2,6,23,0.2);">
            <span style="font-size:28px;font-weight:700;color:#14b8a6;">S</span>
          </div>
          <h1 style="margin:0 0 8px;font-size:36px;line-height:1.2;color:#ffffff;font-weight:800;">You're all set!</h1>
          <p style="margin:0;font-size:18px;color:#dcfdf7;">Your demo is confirmed</p>
        </div>

        <div style="padding:40px 32px;">
          <div style="margin-bottom:28px;">
            <p style="margin:0 0 12px;font-size:20px;color:#334155;">Hi ${safeName},</p>
            <p style="margin:0;color:#475569;font-size:16px;line-height:1.7;">
              Thank you for scheduling a demo with SoloHub! We're excited to show you how our platform can streamline your independent business operations.
            </p>
          </div>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:28px;">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:18px;">
              <h3 style="margin:0;font-size:20px;color:#0f172a;">Meeting Details</h3>
              <span style="display:inline-flex;align-items:center;padding:6px 12px;border-radius:999px;background:#ecfdfb;color:#0f766e;font-size:13px;font-weight:700;">
                <span style="width:8px;height:8px;border-radius:999px;background:#14b8a6;margin-right:8px;display:inline-block;"></span>
                Confirmed
              </span>
            </div>

            <div style="margin:0 0 14px;">
              <p style="margin:0 0 4px;font-size:13px;color:#64748b;font-weight:600;">Date & Time</p>
              <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">${safeDateOnly}</p>
              <p style="margin:2px 0 0;color:#334155;font-size:15px;">${safeTimeRange}</p>
            </div>

            <div style="margin:0 0 14px;">
              <p style="margin:0 0 4px;font-size:13px;color:#64748b;font-weight:600;">Meeting Type</p>
              <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">${safeFocus}</p>
              <p style="margin:2px 0 0;color:#64748b;font-size:14px;">${safeDuration}</p>
            </div>

            <div style="margin:0;">
              <p style="margin:0 0 4px;font-size:13px;color:#64748b;font-weight:600;">Your Host</p>
              <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">Sarah Mitchell</p>
              <p style="margin:2px 0 0;color:#64748b;font-size:14px;">Product Specialist</p>
            </div>
          </div>

          <div style="text-align:center;margin-bottom:28px;">
            <a href="${safeMeetingLink}" style="display:inline-block;background:#14b8a6;color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:999px;font-size:18px;font-weight:700;box-shadow:0 10px 20px rgba(20,184,166,0.35);">
              Join Video Call
            </a>
            <p style="margin:14px 0 0;color:#64748b;font-size:13px;">
              Meeting Link: <a href="${safeMeetingLink}" style="color:#0ea5b7;text-decoration:none;font-weight:600;">${safeMeetingLink}</a>
            </p>
          </div>

          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:28px;">
            <h4 style="margin:0 0 8px;font-size:18px;color:#0f172a;">Add to Calendar</h4>
            <p style="margin:0 0 12px;color:#475569;font-size:14px;">Don't miss your demo! Add this meeting to your calendar.</p>
            <div>
              <a href="${escapeHtml(googleCalendarUrl)}" style="display:inline-block;margin:0 8px 8px 0;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#ffffff;color:#334155;font-size:13px;font-weight:600;text-decoration:none;">Google Calendar</a>
              <a href="${escapeHtml(outlookCalendarUrl)}" style="display:inline-block;margin:0 8px 8px 0;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#ffffff;color:#334155;font-size:13px;font-weight:600;text-decoration:none;">Outlook</a>
              <a href="${appleCalendarUrl}" style="display:inline-block;margin:0 8px 8px 0;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#ffffff;color:#334155;font-size:13px;font-weight:600;text-decoration:none;">Apple Calendar</a>
            </div>
          </div>

          <div style="border-top:1px solid #e2e8f0;padding-top:22px;margin-bottom:22px;">
            <h4 style="margin:0 0 12px;font-size:18px;color:#0f172a;">What to Expect</h4>
            <ul style="margin:0;padding-left:18px;color:#475569;line-height:1.7;">
              <li>A personalized tour of SoloHub's key features based on your goals</li>
              <li>Live demonstration of invoicing, scheduling, and client management tools</li>
              <li>Q&A session to address your specific needs and questions</li>
              <li>Next steps and special onboarding offer (if it's the right fit)</li>
            </ul>
          </div>

          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px;margin-bottom:18px;">
            <h4 style="margin:0 0 8px;font-size:17px;color:#0f172a;">Pro Tip</h4>
            <p style="margin:0;color:#475569;font-size:14px;">Have your current workflow or questions ready! The more specific you are, the more tailored we can make the demo.</p>
          </div>

          <div style="border-top:1px solid #e2e8f0;padding-top:18px;">
            <p style="margin:0 0 10px;color:#475569;">Need to reschedule or have questions before the demo?</p>
            <p style="margin:0;font-size:14px;">
              <a href="mailto:hello@solohub.com?subject=Reschedule%20Demo" style="color:#0ea5b7;text-decoration:none;font-weight:600;">Reschedule Meeting</a>
              <span style="color:#cbd5e1;margin:0 8px;">|</span>
              <a href="mailto:hello@solohub.com?subject=Cancel%20Demo" style="color:#0ea5b7;text-decoration:none;font-weight:600;">Cancel Meeting</a>
              <span style="color:#cbd5e1;margin:0 8px;">|</span>
              <a href="mailto:hello@solohub.com?subject=Demo%20Support" style="color:#0ea5b7;text-decoration:none;font-weight:600;">Contact Support</a>
            </p>
          </div>
        </div>

        <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:28px 32px;text-align:center;">
          <p style="margin:0 0 10px;color:#475569;">See you soon!</p>
          <p style="margin:0 0 8px;color:#0f172a;font-weight:700;">The SoloHub Team</p>
          <p style="margin:0;color:#94a3b8;font-size:12px;">SoloHub Inc. | San Francisco, CA</p>
          <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">
            <a href="https://solohub.nl/privacy" style="color:#94a3b8;text-decoration:none;">Privacy Policy</a> |
            <a href="https://solohub.nl/contact" style="color:#94a3b8;text-decoration:none;"> Help Center</a>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`,
  };
}
