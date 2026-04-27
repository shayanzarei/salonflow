import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
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
        <h1 className="text-h2 font-bold text-ink-900">Packages</h1>
        <p className="mt-1 text-ink-500">
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
          >
            <Card variant="outlined" className="p-5">
              <input type="hidden" name="package_id" value={pkg.id} />

              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-caption font-semibold uppercase tracking-[0.18em] text-brand-600">
                    {pkg.id}
                  </p>
                  <h2 className="mt-1 text-h3 font-semibold text-ink-900">
                    {pkg.name}
                  </h2>
                </div>
                <label className="flex items-center gap-2 text-body-sm text-ink-700">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={pkg.featured}
                  />
                  Featured
                </label>
              </div>

              <div className="space-y-4">
                <Input
                  id={`pkg-${pkg.id}-name`}
                  name="name"
                  label="Display name"
                  defaultValue={pkg.name}
                />

                <Input
                  id={`pkg-${pkg.id}-subtitle`}
                  name="subtitle"
                  label="Subtitle"
                  defaultValue={pkg.subtitle}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id={`pkg-${pkg.id}-monthly`}
                    type="number"
                    min="0"
                    name="monthly_price"
                    label="Monthly price"
                    defaultValue={pkg.monthlyPrice}
                  />
                  <Input
                    id={`pkg-${pkg.id}-annual`}
                    type="number"
                    min="0"
                    name="annual_price"
                    label="Annual price"
                    defaultValue={pkg.annualPrice}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id={`pkg-${pkg.id}-sort`}
                    type="number"
                    min="1"
                    name="sort_order"
                    label="Sort order"
                    defaultValue={pkg.sortOrder}
                  />
                  <label className="mt-7 flex items-center gap-2 text-body-sm text-ink-700">
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
                    className="rounded-md border border-ink-100 bg-ink-50 p-4"
                  >
                    <h3 className="mb-3 text-caption font-semibold uppercase tracking-[0.16em] text-ink-500">
                      {category}
                    </h3>
                    <div className="space-y-3">
                      {PACKAGE_ENTITLEMENTS.filter(
                        (item) => item.category === category
                      ).map((item) => {
                        const value = pkg.entitlements[item.key];
                        return (
                          <div key={item.key}>
                            <label className="mb-1 block text-body-sm font-medium text-ink-900">
                              {item.label}
                            </label>
                            <p className="mb-2 text-caption text-ink-500">
                              {item.description}
                            </p>
                            {item.type === "boolean" ? (
                              <label className="flex items-center gap-2 text-body-sm text-ink-700">
                                <input
                                  type="checkbox"
                                  name={`entitlement:${item.key}`}
                                  defaultChecked={Boolean(value)}
                                />
                                Enabled
                              </label>
                            ) : (
                              <Input
                                id={`pkg-${pkg.id}-ent-${item.key}`}
                                type="number"
                                min="0"
                                name={`entitlement:${item.key}`}
                                defaultValue={value === null ? "" : String(value)}
                                placeholder="Leave empty for unlimited"
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
                <Button type="submit" variant="primary" size="md">
                  Save package
                </Button>
              </div>
            </Card>
          </form>
        ))}
      </div>
    </div>
  );
}
