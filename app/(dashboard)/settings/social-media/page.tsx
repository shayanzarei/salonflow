import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YoutubeIcon,
} from "@/components/ui/Icons";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function SocialMediaPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();
  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Social media</h1>
        <p className="mt-1 text-gray-500">
          Manage links shown in your booking site footer.
        </p>
      </div>

      <form
        action="/api/settings"
        method="POST"
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="action" value="social" />
        <input type="hidden" name="redirect_to" value="/settings/social-media" />
        <div className="space-y-4">
          {[
            {
              name: "social_instagram",
              label: "Instagram",
              placeholder: "https://instagram.com/yoursalon",
              icon: <InstagramIcon size={15} />,
            },
            {
              name: "social_facebook",
              label: "Facebook",
              placeholder: "https://facebook.com/yoursalon",
              icon: <FacebookIcon size={15} />,
            },
            {
              name: "social_tiktok",
              label: "TikTok",
              placeholder: "https://tiktok.com/@yoursalon",
              icon: <TikTokIcon size={15} />,
            },
            {
              name: "social_youtube",
              label: "YouTube",
              placeholder: "https://youtube.com/@yoursalon",
              icon: <YoutubeIcon size={15} />,
            },
          ].map((s) => (
            <div key={s.name}>
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <span className="text-gray-400">{s.icon}</span> {s.label}
              </label>
              <input
                type="url"
                name={s.name}
                defaultValue={
                  (tenant as unknown as Record<string, string | null>)[s.name] ?? ""
                }
                placeholder={s.placeholder}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
          <button
            type="submit"
            className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: brand }}
          >
            Save social links
          </button>
        </div>
      </form>
    </div>
  );
}
