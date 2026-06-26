import { ProfessionalCarousel } from "@/components/booking/templates/professional/ProfessionalCarousel";
import { NewsletterForm } from "@/components/booking/templates/professional/NewsletterForm";
import {
  ProfessionalNav,
  type ProfessionalNavLink,
} from "@/components/booking/templates/professional/ProfessionalNav";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YoutubeIcon,
} from "@/components/ui/Icons";
import type { Locale } from "@/lib/i18n/translations";
import {
  localized,
  mergeProfessionalContent,
  type ProfessionalContent,
} from "@/lib/professional-template";
import type { Tenant } from "@/types/tenant";
import { Cormorant_Garamond } from "next/font/google";

const proSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pro-serif",
  display: "swap",
});

// Scoped palette — kept faithful to the supplied design (warm taupe + cream,
// muted gold accents). Defined on the template root so nothing leaks into the
// rest of the app, and so we don't touch the global design tokens.
const PALETTE = {
  "--pro-cream": "#f5f2ea",
  "--pro-cream-2": "#ece5d9",
  "--pro-taupe": "#b1a489",
  "--pro-taupe-2": "#c9bca8",
  "--pro-gold": "#a98a5c",
  "--pro-ink": "#2b2926",
  "--pro-muted": "#6f6a61",
  "--pro-line": "#e4ddd0",
  "--pro-dark": "#22201d",
} as React.CSSProperties;

export interface ProfessionalService {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  category_name?: string | null;
}

export interface ProfessionalGalleryItem {
  id: string;
  before_url: string | null;
  after_url: string | null;
  caption: string | null;
}

/** Small interlaced ornament used as the default "unique" column mark and the
 *  footer flourish when the salon hasn't uploaded its own icon. */
function DecorativeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.4">
        <circle cx="24" cy="24" r="21" opacity="0.5" />
        <path d="M24 8c6 4 6 12 0 16-6-4-6-12 0-16Z" />
        <path d="M24 40c-6-4-6-12 0-16 6 4 6 12 0 16Z" />
        <path d="M8 24c4-6 12-6 16 0-4 6-12 6-16 0Z" />
        <path d="M40 24c-4 6-12 6-16 0 4-6 12-6 16 0Z" />
      </g>
    </svg>
  );
}

export function ProfessionalTemplate({
  tenant,
  content: contentProp,
  locale,
  services,
  galleryItems,
  bookHref = "/book",
}: {
  tenant: Tenant;
  content?: ProfessionalContent;
  locale: Locale;
  services: ProfessionalService[];
  galleryItems: ProfessionalGalleryItem[];
  bookHref?: string;
}) {
  // Accept pre-merged content from the page, but fall back to merging here so
  // the component is safe to render in isolation (previews, tests).
  const content = contentProp ?? mergeProfessionalContent(tenant.professional_content);
  const L = (v: Parameters<typeof localized>[0]) => localized(v, locale);

  const navLinks: ProfessionalNavLink[] = [
    { label: L(content.nav.treatments), href: "#treatments" },
    { label: L(content.nav.about), href: "#about" },
    { label: L(content.nav.pricing), href: "#treatments" },
    { label: L(content.nav.contact), href: "#contact" },
  ];

  const aboutParagraphs = L(content.about.body)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const carouselImages = galleryItems
    .map((g) => ({
      src: (g.after_url || g.before_url || "") as string,
      alt: g.caption || tenant.name,
    }))
    .filter((g) => g.src);

  const socials = [
    { url: tenant.social_instagram, Icon: InstagramIcon, label: "Instagram" },
    { url: tenant.social_facebook, Icon: FacebookIcon, label: "Facebook" },
    { url: tenant.social_tiktok, Icon: TikTokIcon, label: "TikTok" },
    { url: tenant.social_youtube, Icon: YoutubeIcon, label: "YouTube" },
  ].filter((s) => s.url);

  const contactLines = [
    tenant.address,
    content.contactBar.email || null,
    tenant.phone || null,
    content.contactBar.phone2 || null,
  ].filter(Boolean) as string[];

  const year = new Date().getFullYear();

  return (
    <div
      className={`${proSerif.variable} font-[family-name:var(--font-geist-sans)] text-[var(--pro-ink)]`}
      style={{ ...PALETTE, background: "var(--pro-cream)" }}
    >
      <ProfessionalNav
        salonName={tenant.name}
        logoUrl={tenant.logo_url}
        tagline={L(content.footer.tagline)}
        links={navLinks}
        bookLabel={L(content.nav.book)}
        bookHref={bookHref}
        contactBar={{
          address: tenant.address ?? null,
          phone: tenant.phone ?? null,
          phone2: content.contactBar.phone2,
          email: content.contactBar.email,
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden sm:min-h-[72vh]">
        {tenant.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tenant.hero_image_url}
            alt={tenant.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: "var(--pro-taupe)" }} />
        )}
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center text-white">
          {L(content.hero.eyebrow) && (
            <p className="mb-5 text-[12px] uppercase tracking-[0.34em] sm:text-[13px]">
              {L(content.hero.eyebrow)}
            </p>
          )}
          <h1
            className="mb-8 text-4xl uppercase leading-[1.1] tracking-[0.04em] sm:text-5xl md:text-6xl"
            style={{ fontFamily: "var(--font-pro-serif)" }}
          >
            {L(content.hero.title)}
          </h1>
          <a
            href={bookHref}
            className="inline-block border border-white/70 px-9 py-3.5 text-[12px] uppercase tracking-[0.18em] text-white no-underline backdrop-blur-sm transition-colors hover:bg-white hover:text-[var(--pro-ink)]"
            style={{ background: "rgba(177,164,137,0.55)" }}
          >
            {L(content.hero.ctaLabel)}
          </a>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      {aboutParagraphs.length > 0 && (
        <section id="about" className="px-6 py-20 sm:py-28" style={{ background: "var(--pro-cream)" }}>
          <div className="mx-auto max-w-2xl text-center">
            {tenant.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.logo_url} alt={tenant.name} className="mx-auto mb-8 h-14 w-auto object-contain" />
            ) : (
              <DecorativeMark className="mx-auto mb-8 h-12 w-12 text-[var(--pro-gold)]" />
            )}
            {aboutParagraphs.map((p, i) => (
              <p key={i} className="mb-5 text-[15px] leading-[1.9] text-[var(--pro-muted)] last:mb-0">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ── What makes us unique ─────────────────────────────────────────── */}
      {content.unique.items.length > 0 && (
        <section className="px-6 py-20 sm:py-24" style={{ background: "var(--pro-cream)" }}>
          <div className="mx-auto max-w-5xl">
            <h2
              className="mb-16 text-center text-3xl uppercase tracking-[0.12em] text-[var(--pro-gold)] sm:text-4xl"
              style={{ fontFamily: "var(--font-pro-serif)" }}
            >
              {L(content.unique.heading)}
            </h2>
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
              {content.unique.items.map((item, i) => (
                <div key={i} className="text-center">
                  {item.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.iconUrl} alt="" className="mx-auto mb-6 h-12 w-12 object-contain" />
                  ) : (
                    <DecorativeMark className="mx-auto mb-6 h-12 w-12 text-[var(--pro-ink)]" />
                  )}
                  <p className="mb-4 text-[12px] uppercase tracking-[0.16em] text-[var(--pro-gold)]">
                    — {L(item.title)} —
                  </p>
                  <p className="mx-auto max-w-xs text-[14px] leading-[1.8] text-[var(--pro-muted)]">
                    {L(item.body)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Treatments (from Services) ───────────────────────────────────── */}
      {services.length > 0 && (
        <section id="treatments" className="px-6 py-20 sm:py-24" style={{ background: "var(--pro-cream)" }}>
          <div className="mx-auto max-w-5xl">
            <h2
              className="mb-16 text-center text-3xl uppercase tracking-[0.12em] text-[var(--pro-gold)] sm:text-4xl"
              style={{ fontFamily: "var(--font-pro-serif)" }}
            >
              {L(content.treatments.heading)}
            </h2>
            <div className="space-y-8 sm:space-y-12">
              {services.map((service, i) => {
                const imageRight = i % 2 === 0;
                const imageBlock = (
                  <div className="overflow-hidden bg-[var(--pro-cream-2)] sm:w-2/5">
                    {service.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="h-56 w-full object-cover sm:h-full"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center sm:h-full">
                        <DecorativeMark className="h-12 w-12 text-[var(--pro-taupe)]" />
                      </div>
                    )}
                  </div>
                );
                const textBlock = (
                  <div className="flex flex-col justify-center p-7 sm:w-3/5 sm:p-12">
                    <h3
                      className="mb-4 text-xl uppercase tracking-[0.08em] text-[var(--pro-ink)] sm:text-2xl"
                      style={{ fontFamily: "var(--font-pro-serif)" }}
                    >
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="mb-7 text-[14px] leading-[1.8] text-[var(--pro-muted)]">
                        {service.description}
                      </p>
                    )}
                    <a
                      href={`/book/staff?service=${service.id}`}
                      className="group inline-flex w-fit items-center gap-2 border-b border-[var(--pro-ink)] pb-1 text-[12px] uppercase tracking-[0.16em] text-[var(--pro-ink)] no-underline"
                    >
                      {service.name}
                      <span className="transition-transform group-hover:translate-x-1">➔</span>
                    </a>
                  </div>
                );
                return (
                  <div
                    key={service.id}
                    className={`flex flex-col overflow-hidden bg-white shadow-[0_10px_40px_rgba(43,41,38,0.06)] sm:flex-row ${
                      imageRight ? "sm:flex-row-reverse" : ""
                    }`}
                  >
                    {imageBlock}
                    {textBlock}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonial banner ───────────────────────────────────────────── */}
      {L(content.testimonial.quote) && (
        <section
          className="relative px-6 py-20 text-center sm:py-24"
          style={{
            background: content.testimonial.backgroundImageUrl
              ? `url(${content.testimonial.backgroundImageUrl}) center/cover`
              : "var(--pro-taupe)",
          }}
        >
          <div className="absolute inset-0 bg-[var(--pro-taupe)]/35" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="text-[15px] uppercase leading-[1.9] tracking-[0.1em] text-white sm:text-[17px]">
              {L(content.testimonial.quote)}
            </p>
            {L(content.testimonial.author) && (
              <p className="mt-6 text-[12px] uppercase tracking-[0.18em] text-white/90">
                — {L(content.testimonial.author)}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Gallery carousel ─────────────────────────────────────────────── */}
      {carouselImages.length > 0 && (
        <section className="px-6 py-20 sm:py-24" style={{ background: "var(--pro-cream)" }}>
          <div className="mx-auto max-w-4xl">
            <h2
              className="mb-12 text-center text-3xl uppercase tracking-[0.18em] text-[var(--pro-gold)] sm:text-4xl"
              style={{ fontFamily: "var(--font-pro-serif)" }}
            >
              {L(content.gallery.heading)}
            </h2>
            <ProfessionalCarousel images={carouselImages} />
            <div className="mt-12 text-center">
              <a
                href={`${bookHref}`}
                className="inline-block px-10 py-3.5 text-[12px] uppercase tracking-[0.18em] text-white no-underline transition-opacity hover:opacity-90"
                style={{ background: "var(--pro-dark)" }}
              >
                {L(content.gallery.ctaLabel)}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ───────────────────────────────────────────────────── */}
      <section
        className="px-6 py-16 sm:py-20"
        style={{
          background: content.newsletter.backgroundImageUrl
            ? `url(${content.newsletter.backgroundImageUrl}) center/cover`
            : "var(--pro-cream-2)",
        }}
      >
        <div className="mx-auto max-w-2xl">
          <p className="mb-6 text-[12px] uppercase tracking-[0.2em] text-[var(--pro-gold)]">
            {L(content.newsletter.heading)}
          </p>
          <NewsletterForm
            placeholder={L(content.newsletter.placeholder)}
            buttonLabel={L(content.newsletter.buttonLabel)}
            successMessage={L(content.newsletter.successMessage)}
          />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer id="contact" style={{ background: "var(--pro-taupe-2)" }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          {/* Brand */}
          <div className="mb-14 text-center">
            {tenant.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.logo_url} alt={tenant.name} className="mx-auto mb-3 h-16 w-auto object-contain" />
            ) : (
              <span
                className="text-2xl uppercase tracking-[0.22em] text-[var(--pro-ink)]"
                style={{ fontFamily: "var(--font-pro-serif)" }}
              >
                {tenant.name}
              </span>
            )}
            {L(content.footer.tagline) && (
              <p className="text-[9px] uppercase tracking-[0.34em] text-[var(--pro-muted)]">
                {L(content.footer.tagline)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 text-center sm:grid-cols-4 sm:text-left">
            {/* Menu */}
            <div>
              <h4 className="mb-4 text-[12px] uppercase tracking-[0.16em] text-[var(--pro-ink)]">
                {L(content.footer.menuTitle)}
              </h4>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={`f-${link.href}-${link.label}`}>
                    <a href={link.href} className="text-[13px] text-[var(--pro-muted)] no-underline hover:text-[var(--pro-ink)]">
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={bookHref} className="text-[13px] text-[var(--pro-muted)] no-underline hover:text-[var(--pro-ink)]">
                    {L(content.nav.book)}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-[12px] uppercase tracking-[0.16em] text-[var(--pro-ink)]">
                {L(content.footer.contactTitle)}
              </h4>
              <ul className="space-y-2.5">
                {contactLines.map((line) => (
                  <li key={line} className="text-[13px] leading-relaxed text-[var(--pro-muted)]">
                    {line}
                  </li>
                ))}
              </ul>
              {socials.length > 0 && (
                <div className="mt-4 flex justify-center gap-3 sm:justify-start">
                  {socials.map(({ url, Icon, label }) => (
                    <a
                      key={label}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="text-[var(--pro-ink)] transition-opacity hover:opacity-70"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Customer service / legal */}
            {content.footer.legalLinks.length > 0 && (
              <div>
                <h4 className="mb-4 text-[12px] uppercase tracking-[0.16em] text-[var(--pro-ink)]">
                  {L(content.footer.serviceTitle)}
                </h4>
                <ul className="space-y-2.5">
                  {content.footer.legalLinks.map((link, i) => (
                    <li key={i}>
                      <a href={link.href} className="text-[13px] text-[var(--pro-muted)] no-underline hover:text-[var(--pro-ink)]">
                        {L(link.label)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Affiliations */}
            {content.footer.certifications.length > 0 && (
              <div>
                <h4 className="mb-4 text-[12px] uppercase tracking-[0.16em] text-[var(--pro-ink)]">
                  {L(content.footer.affiliationsTitle)}
                </h4>
                <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
                  {content.footer.certifications.map((cert, i) =>
                    cert.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={cert.imageUrl} alt={cert.alt} className="h-12 w-auto object-contain" />
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ background: "var(--pro-taupe)" }}>
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4 text-center text-[11px] tracking-wide text-white/90 sm:flex-row sm:justify-between sm:text-left">
            <span>{L(content.footer.credit)}</span>
            <span>
              © {year} {tenant.name}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
