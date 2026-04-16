import {
  PACKAGE_COMPARISON_CATEGORIES,
  PACKAGE_ENTITLEMENTS,
} from "@/config/packages";
import { getPackages } from "@/lib/packages";

export default async function AdminPackagesPage() {
  const packages = await getPackages();

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
        <p className="mt-1 text-gray-500">
          Adjust package pricing and limits. Marketing pricing reads from this
          same source.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {packages.map((pkg) => (
          <form
            key={pkg.id}
            action="/api/admin/packages"
            method="POST"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <input type="hidden" name="package_id" value={pkg.id} />

            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                  {pkg.id}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-gray-900">
                  {pkg.name}
                </h2>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={pkg.featured}
                />
                Featured
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Display name
                </label>
                <input
                  name="name"
                  defaultValue={pkg.name}
                  className="min-h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Subtitle
                </label>
                <input
                  name="subtitle"
                  defaultValue={pkg.subtitle}
                  className="min-h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-violet-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Monthly price
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="monthly_price"
                    defaultValue={pkg.monthlyPrice}
                    className="min-h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Annual price
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="annual_price"
                    defaultValue={pkg.annualPrice}
                    className="min-h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-violet-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Sort order
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="sort_order"
                    defaultValue={pkg.sortOrder}
                    className="min-h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-violet-400"
                  />
                </div>
                <label className="mt-7 flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={pkg.isActive}
                  />
                  Active
                </label>
              </div>

              {PACKAGE_COMPARISON_CATEGORIES.map((category) => (
                <div
                  key={category}
                  className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                >
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {PACKAGE_ENTITLEMENTS.filter(
                      (item) => item.category === category
                    ).map((item) => {
                      const value = pkg.entitlements[item.key];
                      return (
                        <div key={item.key}>
                          <label className="mb-1 block text-sm font-medium text-gray-800">
                            {item.label}
                          </label>
                          <p className="mb-2 text-xs text-gray-500">
                            {item.description}
                          </p>
                          {item.type === "boolean" ? (
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                name={`entitlement:${item.key}`}
                                defaultChecked={Boolean(value)}
                              />
                              Enabled
                            </label>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              name={`entitlement:${item.key}`}
                              defaultValue={value === null ? "" : String(value)}
                              placeholder="Leave empty for unlimited"
                              className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-violet-400"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                className="min-h-10 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white hover:opacity-90"
              >
                Save package
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
