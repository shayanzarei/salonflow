import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import pool from "@/lib/db";
import { getPackageLimit } from "@/lib/packages";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function NewStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: inviteError } = await searchParams;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? 'var(--color-brand-600)';

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS c FROM staff WHERE tenant_id = $1`,
    [tenant.id]
  );
  const staffCount = countResult.rows[0]?.c ?? 0;
  const maxStaff = await getPackageLimit(tenant, "max_staff");
  const canAddStaff = maxStaff === null || staffCount < maxStaff;
  if (!canAddStaff) {
    redirect("/staff");
  }

  return (
    <div>
      <div className="mb-7">
        <Link
          href="/staff"
          className="mb-3 inline-flex items-center gap-1.5 text-body-sm text-ink-500 no-underline"
        >
          ← Back to Staff
        </Link>
        <h1 className="mb-1.5 text-h1 font-bold text-ink-900">
          Add a team member
        </h1>
        <p className="text-body-sm text-ink-500">
          We&apos;ll email them a secure link to set their password and open the
          staff portal.
        </p>
      </div>

      <Card variant="outlined" className="max-w-[560px] p-6">
        {inviteError ? (
          <div
            className="mb-5 rounded-sm bg-danger-50 px-4 py-3 text-body-sm text-danger-700"
            role="alert"
          >
            {inviteError}
          </div>
        ) : null}
        <form action="/api/staff" method="POST" className="space-y-5">
          <input type="hidden" name="tenant_id" value={tenant.id} />

          <Input
            id="staff-name"
            type="text"
            name="name"
            label="Full name"
            required
            placeholder="e.g. Maria Garcia"
          />

          <Input
            id="staff-role"
            type="text"
            name="role"
            label="Role"
            required
            placeholder="e.g. Senior Stylist"
          />

          <div>
            <Input
              id="staff-email"
              type="email"
              name="email"
              label="Work email"
              required
              autoComplete="email"
              placeholder="maria@example.com"
            />
            <p className="mt-1.5 text-caption text-ink-500">
              They must use this email to sign in after setting a password.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            style={{ backgroundColor: brand }}
          >
            Send invite
          </Button>
        </form>
      </Card>
    </div>
  );
}
