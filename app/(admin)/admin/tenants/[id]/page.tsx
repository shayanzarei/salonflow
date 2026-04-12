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
        <div className="max-w-2xl">
            <div className="mb-8">

                <Link href="/admin/tenants"
                    className="text-sm text-gray-400 hover:text-gray-600"
                >
                    ← Back to tenants
                </Link>
                <div className="flex items-center gap-4 mt-4">
                    <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
                    >
                        {tenant.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                        <p className="text-gray-400 text-sm">{tenant.slug}.salonflow.xyz</p>
                    </div>
                </div>
            </div>

            {/* Site sections control */}
            <div className="bg-white rounded-xl border border-gray-100 mb-6">
                <div className="px-6 py-4 border-b border-gray-100">
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
                                className="px-6 py-4 flex items-center justify-between"
                            >
                                <div>
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
                                    <div style={{ width: 44, height: 24, borderRadius: 100, background: '#7C3AED', opacity: 0.4, flexShrink: 0, position: 'relative' }}>
                                        <span style={{ position: 'absolute', top: 3, left: 23, width: 18, height: 18, borderRadius: '50%', background: 'white' }} />
                                    </div>
                                ) : (
                                    <form action="/api/admin/sections" method="POST">
                                        <input type="hidden" name="tenant_id" value={id} />
                                        <input type="hidden" name="feature" value={section.key} />
                                        <input type="hidden" name="enabled" value={isEnabled ? 'false' : 'true'} />
                                        <button
                                            type="submit"
                                            style={{ width: 44, height: 24, borderRadius: 100, background: isEnabled ? '#7C3AED' : '#D1D5DB', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                                        >
                                            <span style={{ position: 'absolute', top: 3, left: isEnabled ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                                        </button>
                                    </form>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tenant content editor */}
            <div className="bg-white rounded-xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Site content</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Edit this salon&apos;s website content
                    </p>
                </div>
                <form action="/api/admin/tenants/content" method="POST" className="p-6 space-y-4">
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
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
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
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400 resize-none"
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
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
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
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
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
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <Link
                            href={`https://${tenant.slug}.salonflow.xyz`}
                            target="_blank"
                            className="text-sm text-purple-600 hover:text-purple-700"
                        >
                            Preview site →
                        </Link>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gray-900 hover:opacity-90 transition-opacity"
                        >
                            Save content
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}