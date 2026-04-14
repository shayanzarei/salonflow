export function reviewRequestEmail({
    clientName,
    salonName,
    serviceName,
    staffName,
    bookingId,
    reviewToken,
    salonSlug,
}: {
    clientName: string;
    salonName: string;
    serviceName: string;
    staffName: string;
    bookingId: string;
    reviewToken: string;
    salonSlug: string;
}) {
    const reviewUrl = `https://${salonSlug}.solohub.nl/review?booking=${bookingId}&token=${reviewToken}`;

    return {
        subject: `How was your visit to ${salonName}?`,
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
          We'd love your feedback
        </p>
      </div>
  
      <div style="background:white;border-radius:20px;overflow:hidden;border:1px solid #F0EBE4;">
  
        <div style="background:#1a1a1a;padding:32px;text-align:center;">
          <p style="color:#9C7B5A;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px;">
            ${salonName}
          </p>
          <h1 style="color:white;font-size:24px;font-weight:500;margin:0;">
            How was your visit?
          </h1>
        </div>
  
        <div style="padding:32px;text-align:center;">
          <p style="color:#666;font-size:15px;margin:0 0 8px;">
            Hi ${clientName}, we hope you enjoyed your ${serviceName} with ${staffName}.
          </p>
          <p style="color:#999;font-size:14px;margin:0 0 32px;">
            Your feedback helps ${salonName} improve and helps other clients make better decisions.
          </p>
  
          <!-- Star rating buttons -->
          <div style="margin-bottom:28px;">
            <p style="color:#1a1a1a;font-size:14px;font-weight:500;margin:0 0 16px;">
              How would you rate your experience?
            </p>
            <div style="display:flex;justify-content:center;gap:8px;">
              ${[1, 2, 3, 4, 5]
                .map(
                    (star) => `
                <a href="${reviewUrl}&rating=${star}"
                  style="display:inline-block;width:48px;height:48px;border-radius:50%;background:#FAF7F4;border:1px solid #F0EBE4;text-align:center;line-height:48px;font-size:20px;text-decoration:none;">
                  ★
                </a>
              `
                )
                .join("")}
            </div>
            <div style="display:flex;justify-content:center;gap:8px;margin-top:6px;">
              ${[1, 2, 3, 4, 5]
                .map(
                    (star) => `
                <span style="display:inline-block;width:48px;text-align:center;font-size:11px;color:#bbb;">${star}</span>
              `
                )
                .join("")}
            </div>
          </div>
  
          <a href="${reviewUrl}"
            style="display:inline-block;padding:14px 32px;background:#7C3AED;color:white;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;">
            Leave a review
          </a>
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
