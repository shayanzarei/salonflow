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

export default async function SocialMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();
  const brand = tenant.primary_color ?? 'var(--color-brand-600)';
  const qp = await searchParams;
  const justSaved = qp.saved === "1";
  const hasError = qp.error === "invalid_url";

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

      {justSaved ? (
        <div
          role="status"
          className="mb-4 rounded-md border border-success-600/30 bg-success-50 px-4 py-3 text-body-sm text-success-700"
        >
          Social links saved.
        </div>
      ) : null}
      {hasError ? (
        <div
          role="alert"
          className="mb-4 rounded-md border border-danger-600/30 bg-danger-50 px-4 py-3 text-body-sm text-danger-700"
        >
          One of your links isn’t a valid URL. Make sure each starts with
          {" "}<code className="font-mono">https://</code> and try again.
        </div>
      ) : null}

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
