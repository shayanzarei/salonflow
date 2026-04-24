import { formatEUR } from "@/lib/format-currency";

export function bookingReminderEmail({
    clientName,
    salonName,
    serviceName,
    staffName,
    bookedAt,
    salonAddress,
    price,
    cancellationToken,
    bookingId,
    salonSlug,
    reminderType,
}: {
    clientName: string;
    salonName: string;
    serviceName: string;
    staffName: string;
    bookedAt: Date;
    salonAddress: string | null;
    price: number;
    cancellationToken: string;
    bookingId: string;
    salonSlug: string;
    reminderType: "48h" | "24h" | "2h";
}) {
    const date = bookedAt.toLocaleDateString("nl-NL", {
        timeZone: "Europe/Amsterdam",
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const time = bookedAt.toLocaleTimeString("nl-NL", {
        timeZone: "Europe/Amsterdam",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const reminderText = {
        "48h": "Your appointment is in 2 days",
        "24h": "Your appointment is tomorrow",
        "2h": "Your appointment is in 2 hours",
    }[reminderType];

    const reminderBadge = {
        "48h": "&#128338;&nbsp; Reminder — in 2 days",
        "24h": "&#128338;&nbsp; Reminder — tomorrow",
        "2h": "&#128680;&nbsp; Starting in 2 hours",
    }[reminderType];

    const cancelUrl = `https://${salonSlug}.solohub.nl/book/cancel?booking=${bookingId}&token=${cancellationToken}`;
    const subject = `Reminder: ${serviceName} at ${salonName} — ${reminderType === "48h" ? "in 2 days" : reminderType === "24h" ? "tomorrow" : "in 2 hours"}`;

    const safeSalonName = salonName.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const safeClientName = clientName.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const safeServiceName = serviceName.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const safeStaffName = staffName.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const safeSalonAddress = salonAddress ? salonAddress.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;") : null;
    const mapsUrl = salonAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salonAddress)}`
        : null;
    const safeMapsUrl = mapsUrl ? mapsUrl.replaceAll("&", "&amp;").replaceAll('"', "&quot;") : null;
    const safeCancelUrl = cancelUrl.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
    const safeReminderText = reminderText.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

    return {
        subject,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>Appointment reminder — ${safeSalonName}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FCFF;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${safeReminderText} — ${safeServiceName} with ${safeStaffName}. See you soon! &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

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
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;color:rgba(255,255,255,0.75);text-transform:uppercase;font-family:Inter,Arial,Helvetica,sans-serif;">${safeSalonName}</p>
          </td>
        </tr>

        ${reminderType === "2h" ? `
        <!-- Urgency banner for 2h reminder -->
        <tr>
          <td style="background:#F97316;padding:10px 32px;" align="center">
            <p style="margin:0;font-size:13px;font-weight:700;color:#ffffff;font-family:Inter,Arial,Helvetica,sans-serif;">&#128680;&nbsp; Your appointment starts in 2 hours!</p>
          </td>
        </tr>
        ` : ""}

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 32px 28px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">

            <!-- Reminder badge -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
              <tr>
                <td style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:999px;padding:5px 14px;">
                  <span style="font-size:12px;font-weight:700;color:#9A3412;font-family:Inter,Arial,Helvetica,sans-serif;">${reminderBadge}</span>
                </td>
              </tr>
            </table>

            <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.2;">${safeReminderText}, ${safeClientName}!</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;font-family:Inter,Arial,Helvetica,sans-serif;">Just a reminder about your upcoming appointment at <strong style="color:#0F172A;">${safeSalonName}</strong>. We look forward to seeing you!</p>

            <!-- Appointment details card -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:#F8FCFF;border:1px solid #E2E8F0;border-radius:12px;padding:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="border-bottom:1px solid #E2E8F0;padding-bottom:12px;">
                        <span style="font-size:13px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">Your appointment</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="130" style="padding-top:14px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">Service</span>
                      </td>
                      <td style="padding-top:14px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:14px;font-weight:600;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeServiceName}</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="130" style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">With</span>
                      </td>
                      <td style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:14px;font-weight:600;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeStaffName}</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="130" style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">Date</span>
                      </td>
                      <td style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:14px;font-weight:600;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${date}</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="130" style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">Time</span>
                      </td>
                      <td style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:14px;font-weight:600;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${time}</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="130" style="border-top:2px solid #E2E8F0;padding-top:12px;vertical-align:top;">
                        <span style="font-size:13px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">Total</span>
                      </td>
                      <td style="border-top:2px solid #E2E8F0;padding-top:12px;vertical-align:top;">
                        <span style="font-size:16px;font-weight:800;color:#7C3AED;font-family:Inter,Arial,Helvetica,sans-serif;">${formatEUR(price)}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${safeSalonAddress ? `
            <!-- Location -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
                  <span style="display:block;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:4px;">&#128205;&nbsp; Location</span>
                  <span style="font-size:14px;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeSalonAddress}</span>
                  ${
                    safeMapsUrl
                      ? `<br /><a href="${safeMapsUrl}" style="font-size:13px;color:#6D28D9;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;">Get directions</a>`
                      : ""
                  }
                </td>
              </tr>
            </table>
            ` : ""}

            ${reminderType !== "2h" ? `
            <!-- Cancel link — only shown for 48h and 24h reminders -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td style="border-top:1px solid #F1F5F9;padding-top:20px;text-align:center;" align="center">
                  <p style="margin:0 0 10px;font-size:13px;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;">Need to cancel?</p>
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto;">
                    <tr>
                      <td style="border:1px solid #E2E8F0;border-radius:999px;">
                        <a href="${safeCancelUrl}" style="display:block;padding:10px 22px;font-size:13px;font-weight:600;color:#64748B;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;">Cancel appointment</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            ` : `
            <!-- 2h — no cancel, just a see-you-soon note -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td style="border-top:1px solid #F1F5F9;padding-top:18px;">
                  <p style="margin:0;font-size:13px;color:#64748B;line-height:1.6;font-family:Inter,Arial,Helvetica,sans-serif;">See you very soon! If you have any last-minute questions, feel free to reply to this email.</p>
                </td>
              </tr>
            </table>
            `}

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
