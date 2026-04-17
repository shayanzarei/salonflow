export function emailVerificationEmail({ verifyUrl }: { verifyUrl: string }) {
  const safeUrl = verifyUrl.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

  const subject = "Verify your SoloHub email address";

  return {
    subject,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FCFF;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<!-- Preheader (hidden preview text in inbox) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">One click to activate your SoloHub account — link expires in 24 hours. &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#F8FCFF;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#11C4B6 0%,#0EA5B7 100%);border-radius:16px 16px 0 0;padding:36px 32px;text-align:center;" align="center">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 14px;">
              <tr>
                <td width="48" height="48" style="width:48px;height:48px;background:rgba(255,255,255,0.25);border-radius:12px;text-align:center;vertical-align:middle;">
                  <span style="font-size:22px;font-weight:800;color:#ffffff;font-family:Inter,Arial,Helvetica,sans-serif;line-height:48px;display:block;">S</span>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;color:rgba(255,255,255,0.85);text-transform:uppercase;font-family:Inter,Arial,Helvetica,sans-serif;">SOLOHUB</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 32px 28px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">

            <!-- Badge -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
              <tr>
                <td style="background:#F0FDFC;border:1px solid #99F6E4;border-radius:999px;padding:5px 14px;">
                  <span style="font-size:12px;font-weight:700;color:#0F766E;font-family:Inter,Arial,Helvetica,sans-serif;">&#9993;&nbsp; Email verification</span>
                </td>
              </tr>
            </table>

            <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.2;">Verify your email address</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;font-family:Inter,Arial,Helvetica,sans-serif;">
              Thanks for signing up for SoloHub! Click the button below to confirm your email address and activate your 14-day free trial.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:linear-gradient(135deg,#11C4B6 0%,#0EA5B7 100%);border-radius:999px;">
                  <a href="${safeUrl}" style="display:block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Inter,Arial,Helvetica,sans-serif;white-space:nowrap;">Verify my email &#8599;</a>
                </td>
              </tr>
            </table>

            <!-- Expiry note -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:14px 16px;">
                  <span style="font-size:13px;font-weight:700;color:#9A3412;font-family:Inter,Arial,Helvetica,sans-serif;">&#8987;&nbsp; This link expires in 24 hours</span>
                </td>
              </tr>
            </table>

            <!-- Fallback link -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
              <tr>
                <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
                  <span style="display:block;font-size:12px;font-weight:600;color:#94A3B8;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:6px;">Button not working? Copy and paste this link:</span>
                  <span style="font-size:12px;color:#11C4B6;font-family:Inter,Arial,Helvetica,sans-serif;word-break:break-all;">${safeUrl}</span>
                </td>
              </tr>
            </table>

            <!-- Security notice -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td style="border-top:1px solid #F1F5F9;padding-top:20px;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0F172A;font-family:Inter,Arial,Helvetica,sans-serif;">&#128274; Didn't sign up?</p>
                  <p style="margin:0 0 6px;font-size:13px;color:#64748B;line-height:1.6;font-family:Inter,Arial,Helvetica,sans-serif;">If you didn't create a SoloHub account, you can safely ignore this email — no account will be activated.</p>
                  <p style="margin:0;font-size:13px;color:#64748B;line-height:1.6;font-family:Inter,Arial,Helvetica,sans-serif;">If you're concerned, <a href="mailto:hello@solohub.nl" style="color:#11C4B6;text-decoration:none;font-weight:600;">contact our support team</a>.</p>
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
