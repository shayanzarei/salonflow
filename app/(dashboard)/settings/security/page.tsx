import { authOptions } from "@/lib/auth-options";
import { getTenant } from "@/lib/tenant";
import { getServerSession } from "next-auth/next";
import { notFound } from "next/navigation";

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();
  const brand = tenant.primary_color ?? "#7C3AED";

  const qp = await searchParams;
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account & security</h1>
        <p className="mt-1 text-gray-500">
          Update credentials and security preferences.
        </p>
      </div>

      {qp.success === "password_updated" ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Password updated successfully.
        </div>
      ) : null}
      {qp.error === "wrong_password" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Current password is incorrect.
        </div>
      ) : null}
      {qp.error === "password_mismatch" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          New password and confirmation do not match.
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Login
            </p>
            <p className="text-sm font-medium text-gray-900">
              {session?.user?.email ?? tenant.slug}
            </p>
            <p className="text-xs text-gray-500">
              You sign in with this ID and your password
            </p>
          </div>
        </div>

        <form
          action="/api/settings/password"
          method="POST"
          className="mt-6 space-y-4 border-t border-gray-100 pt-6"
        >
          <input type="hidden" name="redirect_to" value="/settings/security" />
          <h2 className="text-sm font-semibold text-gray-800">Change password</h2>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Current password
            </label>
            <input
              type="password"
              name="current_password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              New password
            </label>
            <input
              type="password"
              name="new_password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Confirm new password
            </label>
            <input
              type="password"
              name="confirm_password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: brand }}
          >
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
