import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import { authOptions } from "@/lib/auth-options";
import { getTenant } from "@/lib/tenant";
import DeleteAccountSection from "@/components/settings/DeleteAccountSection";
import { getServerSession } from "next-auth/next";
import { notFound } from "next/navigation";

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();
  const brand = tenant.primary_color ?? 'var(--color-brand-600)';

  const qp = await searchParams;
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-h2 font-bold text-ink-900">Account & security</h1>
        <p className="mt-1 text-ink-500">
          Update credentials and security preferences.
        </p>
      </div>

      {qp.success === "password_updated" ? (
        <div className="rounded-md border border-success-600/30 bg-success-50 px-4 py-3 text-body-sm text-success-700">
          Password updated successfully.
        </div>
      ) : null}
      {qp.error === "wrong_password" ? (
        <div className="rounded-md border border-danger-600/30 bg-danger-50 px-4 py-3 text-body-sm text-danger-700">
          Current password is incorrect.
        </div>
      ) : null}
      {qp.error === "password_mismatch" ? (
        <div className="rounded-md border border-danger-600/30 bg-danger-50 px-4 py-3 text-body-sm text-danger-700">
          New password and confirmation do not match.
        </div>
      ) : null}

      <Card id="password">
        <div className="flex items-center justify-between gap-4 rounded-md border border-ink-100 bg-ink-50 px-4 py-3">
          <div className="flex flex-col gap-1">
            <p className="text-caption font-medium uppercase tracking-wide text-ink-400">
              Login
            </p>
            <p className="text-body-sm font-medium text-ink-900">
              {tenant.owner_email}
            </p>
            <p className="text-caption text-ink-500">
              You sign in with this ID and your password
            </p>
          </div>
        </div>

        <form
          action="/api/settings/password"
          method="POST"
          className="mt-6 space-y-4 border-t border-ink-100 pt-6"
        >
          <input type="hidden" name="redirect_to" value="/settings/security" />
          <h2 className="text-body-sm font-semibold text-ink-900">
            Change password
          </h2>
          <Input
            id="current_password"
            type="password"
            name="current_password"
            label="Current password"
            required
            autoComplete="current-password"
          />
          <Input
            id="new_password"
            type="password"
            name="new_password"
            label="New password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Input
            id="confirm_password"
            type="password"
            name="confirm_password"
            label="Confirm new password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            style={{ backgroundColor: brand }}
          >
            Update password
          </Button>
        </form>
      </Card>
      {/* Danger zone */}
      <DeleteAccountSection
        slug={tenant.slug as string}
        tenantName={tenant.name as string}
      />
    </div>
  );
}
