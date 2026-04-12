import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StaffEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const result = await pool.query(
    `SELECT * FROM staff WHERE id = $1 AND tenant_id = $2`,
    [id, tenant.id]
  );

  const member = result.rows[0];
  if (!member) notFound();

  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <Link
          href={`/staff/${id}`}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back to staff member
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Edit staff member
        </h1>
      </div>

      <form action="/api/staff/update" method="POST" className="space-y-4">
        <input type="hidden" name="staff_id" value={id} />
        <input type="hidden" name="tenant_id" value={tenant.id} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={member.name}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            type="text"
            name="role"
            required
            defaultValue={member.role}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            defaultValue={member.email}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Avatar URL <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            name="avatar_url"
            defaultValue={member.avatar_url ?? ""}
            placeholder="https://example.com/avatar.jpg"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: brand }}
        >
          Save changes
        </button>
      </form>

      {/* Danger zone */}
      <div className="mt-6 bg-white rounded-xl border border-red-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Danger zone</h2>
        <p className="text-xs text-gray-400 mb-4">This cannot be undone</p>
        <form action="/api/staff/delete" method="POST">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="tenant_id" value={tenant.id} />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Delete staff member
          </button>
        </form>
      </div>
    </div>
  );
}
