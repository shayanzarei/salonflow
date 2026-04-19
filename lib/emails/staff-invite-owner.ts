function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function staffInviteOwnerNoticeEmail({
  salonName,
  inviteeName,
  inviteeEmail,
}: {
  salonName: string;
  inviteeName: string;
  inviteeEmail: string;
}) {
  const safeSalon = escapeHtml(salonName);
  const safeName = escapeHtml(inviteeName);
  const safeEmail = escapeHtml(inviteeEmail);
  return {
    subject: `Team invite sent — ${salonName}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;text-align:left;">
      <tr><td>
        <p style="margin:0 0 12px;font-size:18px;font-weight:700;">You invited a team member</p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">
          This message was sent to the owner email on file for <strong>${safeSalon}</strong> so you can confirm the invite was started from your account.
        </p>
        <p style="margin:0 0 8px;font-size:14px;"><strong>Name:</strong> ${safeName}</p>
        <p style="margin:0;font-size:14px;"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
          They will receive a separate email with a link to set their password and access the staff portal. If you did not add this person, contact support immediately.
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`,
  };
}
