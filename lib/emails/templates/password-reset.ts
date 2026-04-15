type PasswordResetEmailArgs = {
  resetUrl: string;
};

export function passwordResetEmail({ resetUrl }: PasswordResetEmailArgs) {
  return {
    subject: "Reset your SoloHub password",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; background:#f8fcff; padding:24px; color:#0f172a;">
        <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
          <div style="padding:28px;">
            <h1 style="font-size:24px; margin:0 0 12px; color:#0f172a;">Reset your password</h1>
            <p style="margin:0 0 20px; color:#475569; line-height:1.6;">
              We received a request to reset your SoloHub account password.
              Click the button below to choose a new password.
            </p>
            <a
              href="${resetUrl}"
              style="display:inline-block; background:#0f172a; color:#ffffff; text-decoration:none; font-weight:600; padding:12px 18px; border-radius:12px;"
            >
              Reset Password
            </a>
            <p style="margin:20px 0 0; color:#64748b; font-size:13px; line-height:1.6;">
              This link will expire in 60 minutes. If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
  };
}
