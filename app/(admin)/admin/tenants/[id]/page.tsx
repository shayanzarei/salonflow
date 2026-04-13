import { SITE_SECTIONS } from '@/config/plans';
import pool from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function TenantDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const tenantResult = await pool.query(
        `SELECT * FROM tenants WHERE id = $1`,
        [id]
    );

    const tenant = tenantResult.rows[0];
    if (!tenant) notFound();

    // fetch current section flags for this tenant
    const flagsResult = await pool.query(
        `SELECT feature, enabled FROM feature_flags
     WHERE tenant_id = $1 AND feature LIKE 'section_%'`,
        [id]
    );

    // build a map of section -> enabled
    const flagMap: Record<string, boolean> = {};
    flagsResult.rows.forEach((row) => {
        flagMap[row.feature] = row.enabled;
    });

    return (
        <div className="w-full max-w-2xl min-w-0">
            <div className="mb-6 sm:mb-8">

                <Link href="/admin/tenants"
                    className="inline-flex min-h-10 items-center text-sm text-gray-400 hover:text-gray-600"
                >
                    ← Back to tenants
                </Link>
                <div className="mt-4 flex items-center gap-3 sm:gap-4">
                    <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
                    >
                        {tenant.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-balance text-xl font-bold text-gray-900 sm:text-2xl">{tenant.name}</h1>
                        <p className="truncate text-sm text-gray-400">{tenant.slug}.salonflow.xyz</p>
                    </div>
                </div>
            </div>

            {/* Site sections control */}
            <div className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white">
                <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
                    <h2 className="font-semibold text-gray-900">Website sections</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Enable or disable sections on this salon&apos;s public website
                    </p>
                </div>
                <div className="divide-y divide-gray-50">
                    {SITE_SECTIONS.map((section) => {
                        const isEnabled = section.required
                            ? true
                            : (flagMap[section.key] ?? true);

                        return (
                            <div
                                key={section.key}
                                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                            >
                                <div className="min-w-0 pr-0 sm:pr-4">
                                    <p className="text-sm font-medium text-gray-900">
                                        {section.label}
                                        {section.required && (
                                            <span className="ml-2 text-xs text-gray-400">
                                                (always on)
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {section.description}
                                    </p>
                                </div>
                                {section.required ? (
                                    <div className="relative h-6 w-11 shrink-0 self-start rounded-full bg-violet-600 opacity-40 sm:self-center" aria-hidden>
                                        <span className="absolute left-[23px] top-[3px] h-[18px] w-[18px] rounded-full bg-white" />
                                    </div>
                                ) : (
                                    <form action="/api/admin/sections" method="POST" className="shrink-0 self-start sm:self-center">
                                        <input type="hidden" name="tenant_id" value={id} />
                                        <input type="hidden" name="feature" value={section.key} />
                                        <input type="hidden" name="enabled" value={isEnabled ? 'false' : 'true'} />
                                        <button
                                            type="submit"
                                            className="relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors"
                                            style={{ background: isEnabled ? "#7C3AED" : "#D1D5DB" }}
                                            aria-label={isEnabled ? `Disable ${section.label}` : `Enable ${section.label}`}
                                        >
                                            <span
                                                className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-[left]"
                                                style={{ left: isEnabled ? 23 : 3 }}
                                            />
                                        </button>
                                    </form>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tenant content editor */}
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
                    <h2 className="font-semibold text-gray-900">Site content</h2>
                    <p className="mt-0.5 text-xs text-gray-400">
                        Edit this salon&apos;s website content
                    </p>
                </div>
                <form action="/api/admin/tenants/content" method="POST" className="space-y-4 p-4 sm:p-6">
                    <input type="hidden" name="tenant_id" value={id} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tagline
                        </label>
                        <input
                            type="text"
                            name="tagline"
                            defaultValue={tenant.tagline ?? ''}
                            placeholder="Where beauty meets craft"
                            className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-gray-900 focus:border-purple-400 focus:outline-none sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            About
                        </label>
                        <textarea
                            name="about"
                            defaultValue={tenant.about ?? ''}
                            placeholder="Tell the salon's story..."
                            rows={3}
                            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-gray-900 focus:border-purple-400 focus:outline-none sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            defaultValue={tenant.address ?? ''}
                            placeholder="123 Beauty Lane, Amsterdam"
                            className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-gray-900 focus:border-purple-400 focus:outline-none sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hours
                        </label>
                        <input
                            type="text"
                            name="hours"
                            defaultValue={tenant.hours ?? ''}
                            placeholder="Mon–Sat 9am–7pm"
                            className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-gray-900 focus:border-purple-400 focus:outline-none sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hero image URL
                        </label>
                        <input
                            type="url"
                            name="hero_image_url"
                            defaultValue={tenant.hero_image_url ?? ''}
                            placeholder="https://example.com/hero.jpg"
                            className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-gray-900 focus:border-purple-400 focus:outline-none sm:text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={`https://${tenant.slug}.salonflow.xyz`}
                            target="_blank"
                            className="order-2 text-sm text-purple-600 hover:text-purple-700 sm:order-1"
                        >
                            Preview site →
                        </Link>
                        <button
                            type="submit"
                            className="order-1 min-h-11 w-full rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:order-2 sm:w-auto"
                        >
                            Save content
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}