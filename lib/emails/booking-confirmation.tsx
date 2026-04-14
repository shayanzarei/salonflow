import { formatEUR } from "@/lib/format-currency";

export function bookingConfirmationEmail({
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
}) {
    const date = bookedAt.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const time = bookedAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

    const cancelUrl = `https://${salonSlug}.solohub.nl/book/cancel?booking=${bookingId}&token=${cancellationToken}`;

    return {
        subject: `Booking confirmed — ${serviceName} at ${salonName}`,
        html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background:#FAF7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:560px;margin:40px auto;padding:0 20px;">
  
      <div style="text-align:center;margin-bottom:32px;">
        <p style="font-size:13px;color:#9C7B5A;letter-spacing:0.08em;text-transform:uppercase;margin:0;">
          Booking confirmed
        </p>
      </div>
  
      <div style="background:white;border-radius:20px;overflow:hidden;border:1px solid #F0EBE4;">
  
        <div style="background:#1a1a1a;padding:32px;text-align:center;">
          <p style="color:#9C7B5A;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px;">
            ${salonName}
          </p>
          <h1 style="color:white;font-size:28px;font-weight:500;margin:0;">
            You're booked!
          </h1>
        </div>
  
        <div style="padding:32px;">
          <p style="color:#666;font-size:15px;margin:0 0 24px;">
            Hi ${clientName}, your appointment is confirmed. Here are your details:
          </p>
  
          <div style="background:#FAF7F4;border-radius:12px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#999;font-size:13px;">Service</td>
                <td style="padding:8px 0;color:#1a1a1a;font-size:13px;font-weight:500;text-align:right;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#999;font-size:13px;">With</td>
                <td style="padding:8px 0;color:#1a1a1a;font-size:13px;font-weight:500;text-align:right;">${staffName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#999;font-size:13px;">Date</td>
                <td style="padding:8px 0;color:#1a1a1a;font-size:13px;font-weight:500;text-align:right;">${date}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#999;font-size:13px;">Time</td>
                <td style="padding:8px 0;color:#1a1a1a;font-size:13px;font-weight:500;text-align:right;">${time}</td>
              </tr>
              <tr style="border-top:1px solid #F0EBE4;">
                <td style="padding:12px 0 4px;color:#1a1a1a;font-size:14px;font-weight:500;">Total</td>
                <td style="padding:12px 0 4px;color:#7C3AED;font-size:16px;font-weight:600;text-align:right;">${formatEUR(price)}</td>
              </tr>
            </table>
          </div>
  
          ${salonAddress ? `
          <div style="border-top:1px solid #F0EBE4;padding-top:20px;margin-bottom:24px;">
            <p style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Location</p>
            <p style="color:#1a1a1a;font-size:14px;margin:0;">${salonAddress}</p>
          </div>
          ` : ''}
  
          <!-- Cancel button -->
          <div style="border-top:1px solid #F0EBE4;padding-top:24px;text-align:center;">
            <p style="color:#999;font-size:13px;margin:0 0 12px;">Need to cancel?</p>
            <a href="${cancelUrl}"
              style="display:inline-block;padding:10px 24px;border:1px solid #E5E7EB;border-radius:100px;color:#666;font-size:13px;text-decoration:none;">
              Cancel appointment
            </a>
          </div>
        </div>
      </div>
  
      <div style="text-align:center;margin-top:24px;">
        <p style="color:#bbb;font-size:12px;margin:0;">Powered by SoloHub</p>
      </div>
  
    </div>
  </body>
  </html>
      `,
    };
}