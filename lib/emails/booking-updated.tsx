import { formatEUR } from "@/lib/format-currency";
import {
  DEFAULT_FALLBACK_TIMEZONE,
  formatWithZoneLabel,
  isValidIanaTimezone,
} from "@/lib/timezone";

/**
 * Email sent to the client when the salon owner edits an existing booking
 * (date / time / service / staff / status). Visually mirrors
 * booking-confirmation.tsx so the customer sees a consistent look across the
 * lifecycle of a booking.
 *
 * `changes` is rendered as a compact "what changed" block at the top.
 * Pass already-stringified before/after values so this template stays formatting-free.
 */
export type BookingChange = {
  label: string;
  /** Old human value, e.g. "14:00 CEST" or "Hair Cut". May be null. */
  before: string | null;
  /** New human value. */
  after: string;
};

export function bookingUpdatedEmail({
  clientName,
  salonName,
  serviceName,
  staffName,
  bookedAt,
  price,
  salonAddress,
  cancellationToken,
  bookingId,
  salonSlug,
  cancelBaseUrl,
  brandColor,
  salonTimezone,
  changes,
}: {
  clientName: string;
  salonName: string;
  serviceName: string;
  staffName: string;
  bookedAt: Date;
  price: number;
  salonAddress: string | null;
  cancellationToken: string;
  bookingId: string;
  salonSlug: string;
  cancelBaseUrl?: string | null;
  brandColor?: string | null;
  salonTimezone?: string | null;
  /** What changed in this update — surfaced at the top of the email. */
  changes: BookingChange[];
}) {
  const color = /^#[0-9A-Fa-f]{6}$/.test(brandColor ?? "")
    ? (brandColor as string)
    : "#7C3AED";
  const colorDark = "#6D28D9";
  const colorTint = `${color}22`;

  const tz =
    salonTimezone && isValidIanaTimezone(salonTimezone)
      ? salonTimezone
      : DEFAULT_FALLBACK_TIMEZONE;

  const date = bookedAt.toLocaleDateString("nl-NL", {
    timeZone: tz,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = formatWithZoneLabel(bookedAt, tz, "nl-NL");

  const cancelHost =
    (cancelBaseUrl ?? "").replace(/\/$/, "") ||
    `https://${salonSlug}.solohub.nl`;
  const cancelUrl = `${cancelHost}/book/cancel?booking=${bookingId}&token=${cancellationToken}`;

  const escape = (v: string) =>
    v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  const safeSalonName = escape(salonName);
  const safeClientName = escape(clientName);
  const safeServiceName = escape(serviceName);
  const safeStaffName = escape(staffName);
  const safeSalonAddress = salonAddress ? escape(salonAddress) : null;
  const mapsUrl = salonAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salonAddress)}`
    : null;
  const safeMapsUrl = mapsUrl
    ? mapsUrl.replaceAll("&", "&amp;").replaceAll('"', "&quot;")
    : null;
  const safeCancelUrl = cancelUrl
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;");

  const changesRows = changes
    .map(
      (c, idx) => `
              <tr>
                <td width="130" style="${idx === 0 ? "" : "border-top:1px solid #F1F5F9;"}padding-top:8px;padding-bottom:8px;vertical-align:top;">
                  <span style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;">${escape(c.label)}</span>
                </td>
                <td style="${idx === 0 ? "" : "border-top:1px solid #F1F5F9;"}padding-top:8px;padding-bottom:8px;vertical-align:top;">
                  ${
                    c.before
                      ? `<span style="font-size:13px;color:#94A3B8;text-decoration:line-through;font-family:Inter,Arial,Helvetica,sans-serif;">${escape(c.before)}</span><br />`
                      : ""
                  }
                  <span style="font-size:14px;font-weight:600;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${escape(c.after)}</span>
                </td>
              </tr>`
    )
    .join("");

  return {
    subject: `Booking updated — ${serviceName} at ${salonName}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>Booking updated — ${safeServiceName} at ${safeSalonName}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FCFF;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your booking at ${safeSalonName} has been updated. Here are the latest details. &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#F8FCFF;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;">

        <tr>
          <td style="background:linear-gradient(135deg,${color} 0%,${colorDark} 100%);border-radius:16px 16px 0 0;padding:36px 32px;text-align:center;" align="center">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 14px;">
              <tr>
                <td width="48" height="48" style="width:48px;height:48px;background:#ffffff;border-radius:12px;text-align:center;vertical-align:middle;">
                  <span style="font-size:22px;font-weight:800;color:${color};font-family:Inter,Arial,Helvetica,sans-serif;line-height:48px;display:block;">S</span>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.1em;color:rgba(255,255,255,0.75);text-transform:uppercase;font-family:Inter,Arial,Helvetica,sans-serif;">${safeSalonName}</p>
          </td>
        </tr>

        <tr>
          <td style="background:#ffffff;padding:36px 32px 28px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">

            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
              <tr>
                <td style="background:${colorTint};border:1px solid ${color};border-radius:999px;padding:5px 14px;">
                  <span style="font-size:12px;font-weight:700;color:${color};font-family:Inter,Arial,Helvetica,sans-serif;">&#9998;&nbsp; Booking updated</span>
                </td>
              </tr>
            </table>

            <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.2;">Your booking has changed, ${safeClientName}</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;font-family:Inter,Arial,Helvetica,sans-serif;">${safeSalonName} updated your appointment. Please review the latest details below — if anything looks off, get in touch with the salon.</p>

            ${
              changes.length > 0
                ? `
            <!-- What changed -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:20px;">
                  <span style="display:block;font-size:13px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:10px;">What changed</span>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    ${changesRows}
                  </table>
                </td>
              </tr>
            </table>
            `
                : ""
            }

            <!-- Booking details card (latest) -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:#F8FCFF;border:1px solid #E2E8F0;border-radius:12px;padding:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="border-bottom:1px solid #E2E8F0;padding-bottom:12px;">
                        <span style="font-size:13px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">Updated appointment details</span>
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
                        <span style="font-size:16px;font-weight:800;color:${color};font-family:Inter,Arial,Helvetica,sans-serif;">${formatEUR(price)}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${
              safeSalonAddress
                ? `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
                  <span style="display:block;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.07em;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:4px;">&#128205;&nbsp; Location</span>
                  <span style="font-size:14px;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">${safeSalonAddress}</span>
                  ${
                    safeMapsUrl
                      ? `<br /><a href="${safeMapsUrl}" style="font-size:13px;color:${colorDark};text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;">Get directions</a>`
                      : ""
                  }
                </td>
              </tr>
            </table>
            `
                : ""
            }

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

          </td>
        </tr>

        <tr>
          <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 16px 16px;padding:22px 32px;" align="center">
            <p style="margin:0 0 8px;font-size:16px;font-weight:800;color:${color};font-family:Inter,Arial,Helvetica,sans-serif;letter-spacing:-0.01em;">SoloHub</p>
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
