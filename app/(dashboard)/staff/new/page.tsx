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

  const brand = tenant.primary_color ?? "#7C3AED";

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
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/staff"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#888",
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          ← Back to Staff
        </Link>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#111",
            margin: "0 0 6px",
          }}
        >
          Add a team member
        </h1>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
          We&apos;ll email them a secure link to set their password and open the
          staff portal.
        </p>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: "1px solid #f0f0f0",
          padding: "28px 24px",
          maxWidth: 560,
        }}
      >
        {inviteError ? (
          <div
            className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            role="alert"
          >
            {inviteError}
          </div>
        ) : null}
        <form action="/api/staff" method="POST" className="space-y-5">
          <input type="hidden" name="tenant_id" value={tenant.id} />

          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-800"
              htmlFor="staff-name"
            >
              Full name
            </label>
            <input
              id="staff-name"
              type="text"
              name="name"
              required
              placeholder="e.g. Maria Garcia"
              className="w-full rounded-[10px] border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-300"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-800"
              htmlFor="staff-role"
            >
              Role
            </label>
            <input
              id="staff-role"
              type="text"
              name="role"
              required
              placeholder="e.g. Senior Stylist"
              className="w-full rounded-[10px] border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-300"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-800"
              htmlFor="staff-email"
            >
              Work email
            </label>
            <input
              id="staff-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="maria@example.com"
              className="w-full rounded-[10px] border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-300"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              They must use this email to sign in after setting a password.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[10px] text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: brand }}
          >
            Send invite
          </button>
        </form>
      </div>
    </div>
  );
}
