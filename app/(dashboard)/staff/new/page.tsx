import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function NewStaffPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <a href="/staff" className="text-sm text-gray-400 hover:text-gray-600">
          ← Back
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Add a team member
        </h1>
      </div>

      <form action="/api/staff" method="POST" className="space-y-4">
        <input type="hidden" name="tenant_id" value={tenant.id} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Maria Garcia"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
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
            placeholder="e.g. Senior Stylist"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
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
            placeholder="maria@lucys.com"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: tenant.primary_color ?? "#7C3AED" }}>
          Add team member
        </button>
      </form>
    </div>
  );
}
