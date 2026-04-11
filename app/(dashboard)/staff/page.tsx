import pool from '@/lib/db';
import { getTenant } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function StaffPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const result = await pool.query(
    `SELECT * FROM staff WHERE tenant_id = $1 ORDER BY name`,
    [tenant.id]
  );
  const staffList = result.rows;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-500 mt-1">Manage your team</p>
        </div>
        
        <a href="/staff/new"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
        >
          Add staff
        </a>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        {staffList.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No staff yet. Add your first team member.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {staffList.map((member) => (
              <div
                key={member.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-400">{member.role}</p>
                    <p className="text-xs text-gray-400">{member.email}</p>
                  </div>
                </div>
                <form action="/api/staff/delete" method="POST">
                  <input type="hidden" name="id" value={member.id} />
                  <input type="hidden" name="tenant_id" value={tenant.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}