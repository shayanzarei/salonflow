import { getTenant } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function NewServicePage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <a
          href="/services"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Add a service
        </h1>
      </div>

      <form action="/api/services" method="POST" className="space-y-4">
        <input type="hidden" name="tenant_id" value={tenant.id} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service name
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Haircut"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            name="description"
            placeholder="e.g. Classic cut and style"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (€)
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              placeholder="35.00"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (mins)
            </label>
            <input
              type="number"
              name="duration_mins"
              required
              min="5"
              step="5"
              placeholder="45"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
        >
          Add service
        </button>
      </form>
    </div>
  );
}