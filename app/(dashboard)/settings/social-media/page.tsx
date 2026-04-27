import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
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
  const brand = tenant.primary_color ?? 'var(--color-brand-600)';

  const socials = [
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
  ];

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mb-8">
        <h1 className="text-h2 font-bold text-ink-900">Social media</h1>
        <p className="mt-1 text-ink-500">
          Manage links shown in your booking site footer.
        </p>
      </div>

      <form
        action="/api/settings"
        method="POST"
      >
        <input type="hidden" name="action" value="social" />
        <input type="hidden" name="redirect_to" value="/settings/social-media" />
        <Card>
          <div className="space-y-4">
            {socials.map((s) => (
              <Input
                key={s.name}
                id={`settings-${s.name}`}
                type="url"
                name={s.name}
                label={s.label}
                leading={<span className="text-ink-400">{s.icon}</span>}
                defaultValue={
                  (tenant as unknown as Record<string, string | null>)[s.name] ?? ""
                }
                placeholder={s.placeholder}
              />
            ))}
          </div>

          <div className="mt-6 flex justify-end border-t border-ink-100 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="md"
              style={{ backgroundColor: brand }}
            >
              Save social links
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
