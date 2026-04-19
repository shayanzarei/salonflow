import { formatEUR } from "@/lib/format-currency";

/**
 * Email sent to the salon owner and/or the assigned staff member
 * whenever a new booking is confirmed.
 *
 * `recipientRole`:
 *   "owner" → subject reads "New booking at your salon"
 *   "staff" → subject reads "You have a new appointment"
 */
export function bookingStaffNotificationEmail({
  recipientName,
  recipientRole,
  salonName,
  clientName,
  clientEmail,
  clientPhone,
  serviceName,
  staffName,
  bookedAt,
  durationMins,
  price,
  dashboardUrl,
}: {
  recipientName: string;
  recipientRole: "owner" | "staff";
  salonName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  serviceName: string;
  staffName: string;
  bookedAt: Date;
  durationMins: number;
  price: number;
  dashboardUrl: string;
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

  function esc(str: string) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  const subject =
    recipientRole === "staff"
      ? `New appointment: ${serviceName} — ${date} at ${time}`
      : `New booking at ${salonName}: ${clientName} — ${date} at ${time}`;

  const headline =
    recipientRole === "staff"
      ? `You have a new appointment, ${esc(recipientName)}!`
      : `New booking at ${esc(salonName)}!`;

  const intro =
    recipientRole === "staff"
      ? `A client has booked an appointment with you. Here are the details.`
      : `A new booking has just been confirmed. View it in your dashboard.`;

  const safeDashboardUrl = dashboardUrl.replaceAll('"', "&quot;");

  return {
    subject,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FCFF;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
  ${esc(clientName)} booked ${esc(serviceName)} — ${date} at ${time} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#F8FCFF;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#11C4B6 0%,#0EA5B7 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center;" align="center">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 14px;">
              <tr>
                <td width="48" height="48" style="width:48px;height:48px;background:#ffffff;border-radius:12px;text-align:center;vertical-align:middle;">
                  <span style="font-size:22px;font-weight:800;color:#11C4B6;font-family:Inter,Arial,Helvetica,sans-serif;line-height:48px;display:block;">S</span>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;color:rgba(255,255,255,0.75);text-transform:uppercase;font-family:Inter,Arial,Helvetica,sans-serif;">${esc(salonName)}</p>
            <!-- New booking badge -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:8px auto 0;">
              <tr>
                <td style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);border-radius:999px;padding:5px 14px;">
                  <span style="font-size:12px;font-weight:700;color:#ffffff;font-family:Inter,Arial,Helvetica,sans-serif;">&#128197;&nbsp; New booking</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 32px 28px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">

            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.25;">${headline}</h1>
            <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.7;font-family:Inter,Arial,Helvetica,sans-serif;">${intro}</p>

            <!-- Appointment details card -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
              <tr>
                <td style="background:#F8FCFF;border:1px solid #E2E8F0;border-radius:12px;padding:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="border-bottom:1px solid #E2E8F0;padding-bottom:12px;">
                        <span style="font-size:13px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">Appointment details</span>
                      </td>
                    </tr>

                    <tr>
                      <td width="130" style="padding-top:14px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">Service</span>
                      </td>
                      <td style="padding-top:14px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:14px;font-weight:600;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${esc(serviceName)}</span>
                      </td>
                    </tr>
                    ${
                      recipientRole === "owner"
                        ? `<tr>
                      <td width="130" style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">Staff</span>
                      </td>
                      <td style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:14px;font-weight:600;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${esc(staffName)}</span>
                      </td>
                    </tr>`
                        : ""
                    }
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
                      <td width="130" style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">Duration</span>
                      </td>
                      <td style="border-top:1px solid #F1F5F9;padding-top:8px;padding-bottom:8px;vertical-align:top;">
                        <span style="font-size:14px;font-weight:600;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${durationMins} min</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="130" style="border-top:2px solid #E2E8F0;padding-top:12px;vertical-align:top;">
                        <span style="font-size:13px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">Price</span>
                      </td>
                      <td style="border-top:2px solid #E2E8F0;padding-top:12px;vertical-align:top;">
                        <span style="font-size:16px;font-weight:800;color:#11C4B6;font-family:Inter,Arial,Helvetica,sans-serif;">${formatEUR(price)}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Client info card -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:28px;">
              <tr>
                <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px 20px;">
                  <span style="display:block;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:10px;">&#128100;&nbsp; Client</span>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="padding-bottom:4px;">
                        <span style="font-size:15px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${esc(clientName)}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:${clientPhone ? "4px" : "0"};">
                        <a href="mailto:${esc(clientEmail)}" style="font-size:13px;color:#0EA5B7;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;">&#9993;&nbsp; ${esc(clientEmail)}</a>
                      </td>
                    </tr>
                    ${
                      clientPhone
                        ? `<tr>
                      <td>
                        <a href="tel:${esc(clientPhone)}" style="font-size:13px;color:#64748B;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;">&#128222;&nbsp; ${esc(clientPhone)}</a>
                      </td>
                    </tr>`
                        : ""
                    }
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA button -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="border-radius:12px;background:linear-gradient(135deg,#11C4B6 0%,#0EA5B7 100%);">
                        <a href="${safeDashboardUrl}" style="display:block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;border-radius:12px;">
                          View booking in dashboard &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 16px 16px;padding:22px 32px;" align="center">
            <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#11C4B6;font-family:Inter,Arial,Helvetica,sans-serif;letter-spacing:-0.01em;">SoloHub</p>
            <p style="margin:0 0 6px;font-size:12px;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;">
              <a href="https://solohub.nl" style="color:#64748B;text-decoration:none;margin:0 6px;">solohub.nl</a>&nbsp;·&nbsp;
              <a href="https://solohub.nl/privacy" style="color:#64748B;text-decoration:none;margin:0 6px;">Privacy Policy</a>
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
