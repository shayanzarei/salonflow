function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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
  const safeClientName = escapeHtml(clientName);
  const safeSalonName = escapeHtml(salonName);
  const safeServiceName = escapeHtml(serviceName);
  const safeStaffName = escapeHtml(staffName);
  const safeReviewUrl = escapeHtml(reviewUrl);

  return {
    subject: `How was your ${serviceName} at ${salonName}, ${clientName}? ⭐`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>How was your visit? — SoloHub</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FCFF;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${safeClientName}, how was your ${safeServiceName} with ${safeStaffName}? Tap a star to leave your review &#11088; &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

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

            <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.2;">How was your visit, ${safeClientName}?</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;font-family:Inter,Arial,Helvetica,sans-serif;">We hope you loved your <strong style="color:#0F172A;">${safeServiceName}</strong> with <strong style="color:#0F172A;">${safeStaffName}</strong> at <strong style="color:#0F172A;">${safeSalonName}</strong>. Your honest feedback means a lot — it takes just 10 seconds!</p>

            <!-- Star rating section -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:28px;">
              <tr>
                <td style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:24px;text-align:center;" align="center">
                  <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#92400E;font-family:Inter,Arial,Helvetica,sans-serif;">Tap a star to leave your review</p>
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto;">
                    <tr>
                      <td style="padding:0 4px;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                          <tr>
                            <td style="background:#ffffff;border:1px solid #FDE68A;border-radius:10px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                              <a href="${safeReviewUrl}&amp;rating=1" style="display:block;width:48px;height:48px;line-height:48px;font-size:22px;text-decoration:none;">&#11088;</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="padding:0 4px;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                          <tr>
                            <td style="background:#ffffff;border:1px solid #FDE68A;border-radius:10px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                              <a href="${safeReviewUrl}&amp;rating=2" style="display:block;width:48px;height:48px;line-height:48px;font-size:22px;text-decoration:none;">&#11088;</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="padding:0 4px;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                          <tr>
                            <td style="background:#ffffff;border:1px solid #FDE68A;border-radius:10px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                              <a href="${safeReviewUrl}&amp;rating=3" style="display:block;width:48px;height:48px;line-height:48px;font-size:22px;text-decoration:none;">&#11088;</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="padding:0 4px;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                          <tr>
                            <td style="background:#ffffff;border:1px solid #FDE68A;border-radius:10px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                              <a href="${safeReviewUrl}&amp;rating=4" style="display:block;width:48px;height:48px;line-height:48px;font-size:22px;text-decoration:none;">&#11088;</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="padding:0 4px;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                          <tr>
                            <td style="background:#11C4B6;border:1px solid #0EA5B7;border-radius:10px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                              <a href="${safeReviewUrl}&amp;rating=5" style="display:block;width:48px;height:48px;line-height:48px;font-size:22px;text-decoration:none;">&#11088;</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top:8px;text-align:left;">
                        <span style="font-size:11px;color:#B45309;font-family:Inter,Arial,Helvetica,sans-serif;">Poor</span>
                      </td>
                      <td style="padding-top:8px;text-align:center;">
                        <span style="font-size:11px;color:#B45309;font-family:Inter,Arial,Helvetica,sans-serif;">OK</span>
                      </td>
                      <td colspan="2" style="padding-top:8px;text-align:right;">
                        <span style="font-size:11px;color:#B45309;font-family:Inter,Arial,Helvetica,sans-serif;">Excellent</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Fallback CTA -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
              <tr>
                <td style="background:#11C4B6;border-radius:999px;">
                  <a href="${safeReviewUrl}" style="display:block;padding:13px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;">Leave a review &#8599;</a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 24px;font-size:13px;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;">Can't see the stars? <a href="${safeReviewUrl}" style="color:#11C4B6;text-decoration:none;font-weight:600;">Click here to open the review page</a>.</p>

            <!-- Polite note -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td style="border-top:1px solid #F1F5F9;padding-top:18px;">
                  <p style="margin:0;font-size:13px;color:#64748B;line-height:1.6;font-family:Inter,Arial,Helvetica,sans-serif;">Your feedback is entirely voluntary. It helps ${safeSalonName} improve and helps other clients know what to expect. Thank you for being a valued client! &#128149;</p>
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
            <p style="margin:0 0 4px;font-size:11px;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;">SoloHub B.V. · KvK 12345678 · Herengracht 1, Amsterdam</p>
            <p style="margin:0;font-size:11px;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;">This review request was sent on behalf of <strong style="color:#64748B;">${safeSalonName}</strong>.</p>
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
