"use client";

import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input, Textarea } from "@/components/ds/Input";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import type {
  LocalizedText,
  ProfessionalContent,
} from "@/lib/professional-template";
import { useRouter } from "next/navigation";
import { useState } from "react";

/* A bilingual text field: NL + EN side by side. */
function LocalizedField({
  label,
  value,
  onChange,
  multiline,
  rows,
  hint,
}: {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-label font-medium text-ink-700">{label}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {multiline ? (
          <>
            <Textarea
              label="Nederlands"
              optionalLabel="NL"
              value={value.nl}
              rows={rows ?? 3}
              onChange={(e) => onChange({ ...value, nl: e.target.value })}
            />
            <Textarea
              label="English"
              optionalLabel="EN"
              value={value.en}
              rows={rows ?? 3}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
            />
          </>
        ) : (
          <>
            <Input
              label="Nederlands"
              optionalLabel="NL"
              type="text"
              value={value.nl}
              onChange={(e) => onChange({ ...value, nl: e.target.value })}
            />
            <Input
              label="English"
              optionalLabel="EN"
              type="text"
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
            />
          </>
        )}
      </div>
      {hint && <p className="text-caption text-ink-400">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4 border-t border-ink-100 pt-5 first:border-0 first:pt-0">
      <legend className="sr-only">{title}</legend>
      <div>
        <h3 className="text-body-sm font-semibold text-ink-900">{title}</h3>
        {description && (
          <p className="mt-0.5 text-caption text-ink-400">{description}</p>
        )}
      </div>
      {children}
    </fieldset>
  );
}

export function ProfessionalContentForm({
  tenantId,
  initial,
}: {
  tenantId: string;
  initial: ProfessionalContent;
}) {
  const router = useRouter();
  const [content, setContent] = useState<ProfessionalContent>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /** Immutable nested update via a structured clone + mutator. */
  function mutate(fn: (draft: ProfessionalContent) => void) {
    setContent((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setStatus("idle");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/tenants/professional-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Save failed.");
      }
      setStatus("saved");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Save failed.");
    }
  }

  return (
    <Card variant="outlined" className="overflow-hidden p-0">
      <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
        <h2 className="font-semibold text-ink-900">Professional template</h2>
        <p className="mt-0.5 text-caption text-ink-400">
          Bilingual content for the Professional template. Each block has a
          Dutch (NL) and English (EN) version — the public site shows whichever
          the visitor selects. Treatment cards and the photo carousel are
          pulled from this salon&apos;s Services and Gallery.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-7 p-4 sm:p-6">
        {/* Top contact bar */}
        <Section
          title="Contact bar"
          description="The thin bar above the header. Address and primary phone come from the Contact tab; add the extras here."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Second phone"
              optionalLabel="optional"
              type="text"
              value={content.contactBar.phone2}
              placeholder="06-38776853"
              onChange={(e) =>
                mutate((c) => {
                  c.contactBar.phone2 = e.target.value;
                })
              }
            />
            <Input
              label="Public email"
              optionalLabel="optional"
              type="text"
              value={content.contactBar.email}
              placeholder="info@salon.com"
              onChange={(e) =>
                mutate((c) => {
                  c.contactBar.email = e.target.value;
                })
              }
            />
          </div>
        </Section>

        {/* Navigation labels */}
        <Section title="Navigation labels">
          <LocalizedField
            label="Treatments"
            value={content.nav.treatments}
            onChange={(v) => mutate((c) => { c.nav.treatments = v; })}
          />
          <LocalizedField
            label="About"
            value={content.nav.about}
            onChange={(v) => mutate((c) => { c.nav.about = v; })}
          />
          <LocalizedField
            label="Book"
            value={content.nav.book}
            onChange={(v) => mutate((c) => { c.nav.book = v; })}
          />
          <LocalizedField
            label="Pricing"
            value={content.nav.pricing}
            onChange={(v) => mutate((c) => { c.nav.pricing = v; })}
          />
          <LocalizedField
            label="Contact"
            value={content.nav.contact}
            onChange={(v) => mutate((c) => { c.nav.contact = v; })}
          />
        </Section>

        {/* Hero */}
        <Section
          title="Hero"
          description="Full-width banner. The background image is the Hero image set on the Content tab."
        >
          <LocalizedField
            label="Eyebrow"
            value={content.hero.eyebrow}
            onChange={(v) => mutate((c) => { c.hero.eyebrow = v; })}
            hint="Small label above the title, e.g. FACE | HAIR | BODY | SKIN."
          />
          <LocalizedField
            label="Title"
            value={content.hero.title}
            onChange={(v) => mutate((c) => { c.hero.title = v; })}
          />
          <LocalizedField
            label="Button label"
            value={content.hero.ctaLabel}
            onChange={(v) => mutate((c) => { c.hero.ctaLabel = v; })}
          />
        </Section>

        {/* About */}
        <Section
          title="About"
          description="Centred intro under the logo. Use a blank line between paragraphs."
        >
          <LocalizedField
            label="Body"
            value={content.about.body}
            onChange={(v) => mutate((c) => { c.about.body = v; })}
            multiline
            rows={6}
          />
        </Section>

        {/* Unique */}
        <Section title="What makes us unique" description="Heading plus three columns.">
          <LocalizedField
            label="Heading"
            value={content.unique.heading}
            onChange={(v) => mutate((c) => { c.unique.heading = v; })}
          />
          {content.unique.items.map((item, i) => (
            <div key={i} className="space-y-3 rounded-md border border-ink-100 p-3">
              <p className="text-caption font-medium text-ink-500">Column {i + 1}</p>
              <ImageUploadField
                label="Icon"
                hint="Optional — leave empty for the built-in ornament."
                value={item.iconUrl}
                onChange={(url) =>
                  mutate((c) => {
                    c.unique.items[i].iconUrl = url;
                  })
                }
              />
              <LocalizedField
                label="Title"
                value={item.title}
                onChange={(v) =>
                  mutate((c) => {
                    c.unique.items[i].title = v;
                  })
                }
              />
              <LocalizedField
                label="Body"
                value={item.body}
                multiline
                onChange={(v) =>
                  mutate((c) => {
                    c.unique.items[i].body = v;
                  })
                }
              />
            </div>
          ))}
        </Section>

        {/* Treatments */}
        <Section
          title="Treatments"
          description="Section heading. The cards below it render from this salon's Services (name, description, photo)."
        >
          <LocalizedField
            label="Heading"
            value={content.treatments.heading}
            onChange={(v) => mutate((c) => { c.treatments.heading = v; })}
          />
        </Section>

        {/* Testimonial */}
        <Section title="Testimonial banner">
          <LocalizedField
            label="Quote"
            value={content.testimonial.quote}
            onChange={(v) => mutate((c) => { c.testimonial.quote = v; })}
            multiline
          />
          <LocalizedField
            label="Author"
            value={content.testimonial.author}
            onChange={(v) => mutate((c) => { c.testimonial.author = v; })}
            hint="Optional attribution shown under the quote."
          />
          <ImageUploadField
            label="Background image"
            hint="Optional — falls back to a tinted band."
            value={content.testimonial.backgroundImageUrl}
            onChange={(url) =>
              mutate((c) => {
                c.testimonial.backgroundImageUrl = url;
              })
            }
          />
        </Section>

        {/* Gallery */}
        <Section
          title="Gallery carousel"
          description="Heading and button. Photos come from this salon's Gallery."
        >
          <LocalizedField
            label="Heading"
            value={content.gallery.heading}
            onChange={(v) => mutate((c) => { c.gallery.heading = v; })}
          />
          <LocalizedField
            label="Button label"
            value={content.gallery.ctaLabel}
            onChange={(v) => mutate((c) => { c.gallery.ctaLabel = v; })}
          />
        </Section>

        {/* Newsletter */}
        <Section title="Newsletter">
          <LocalizedField
            label="Heading"
            value={content.newsletter.heading}
            onChange={(v) => mutate((c) => { c.newsletter.heading = v; })}
          />
          <LocalizedField
            label="Input placeholder"
            value={content.newsletter.placeholder}
            onChange={(v) => mutate((c) => { c.newsletter.placeholder = v; })}
          />
          <LocalizedField
            label="Button label"
            value={content.newsletter.buttonLabel}
            onChange={(v) => mutate((c) => { c.newsletter.buttonLabel = v; })}
          />
          <LocalizedField
            label="Success message"
            value={content.newsletter.successMessage}
            onChange={(v) => mutate((c) => { c.newsletter.successMessage = v; })}
          />
          <ImageUploadField
            label="Background image"
            hint="Optional — falls back to a tinted band."
            value={content.newsletter.backgroundImageUrl}
            onChange={(url) =>
              mutate((c) => {
                c.newsletter.backgroundImageUrl = url;
              })
            }
          />
        </Section>

        {/* Footer */}
        <Section title="Footer">
          <LocalizedField
            label="Tagline"
            value={content.footer.tagline}
            onChange={(v) => mutate((c) => { c.footer.tagline = v; })}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LocalizedField
              label="Menu column title"
              value={content.footer.menuTitle}
              onChange={(v) => mutate((c) => { c.footer.menuTitle = v; })}
            />
            <LocalizedField
              label="Contact column title"
              value={content.footer.contactTitle}
              onChange={(v) => mutate((c) => { c.footer.contactTitle = v; })}
            />
            <LocalizedField
              label="Service column title"
              value={content.footer.serviceTitle}
              onChange={(v) => mutate((c) => { c.footer.serviceTitle = v; })}
            />
            <LocalizedField
              label="Affiliations column title"
              value={content.footer.affiliationsTitle}
              onChange={(v) => mutate((c) => { c.footer.affiliationsTitle = v; })}
            />
          </div>
          <LocalizedField
            label="Bottom-bar credit"
            value={content.footer.credit}
            onChange={(v) => mutate((c) => { c.footer.credit = v; })}
            hint="Optional line shown bottom-left, e.g. a web-design credit."
          />

          {/* Legal links */}
          <div className="space-y-3">
            <p className="text-label font-medium text-ink-700">Legal / service links</p>
            {content.footer.legalLinks.map((link, i) => (
              <div key={i} className="space-y-3 rounded-md border border-ink-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-caption font-medium text-ink-500">Link {i + 1}</p>
                  <button
                    type="button"
                    onClick={() =>
                      mutate((c) => {
                        c.footer.legalLinks.splice(i, 1);
                      })
                    }
                    className="text-caption text-danger-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <LocalizedField
                  label="Label"
                  value={link.label}
                  onChange={(v) =>
                    mutate((c) => {
                      c.footer.legalLinks[i].label = v;
                    })
                  }
                />
                <Input
                  label="URL"
                  type="text"
                  value={link.href}
                  placeholder="/privacy"
                  onChange={(e) =>
                    mutate((c) => {
                      c.footer.legalLinks[i].href = e.target.value;
                    })
                  }
                />
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                mutate((c) => {
                  c.footer.legalLinks.push({
                    label: { nl: "", en: "" },
                    href: "#",
                  });
                })
              }
            >
              Add link
            </Button>
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            <p className="text-label font-medium text-ink-700">Affiliation badges</p>
            {content.footer.certifications.map((cert, i) => (
              <div key={i} className="space-y-3 rounded-md border border-ink-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-caption font-medium text-ink-500">Badge {i + 1}</p>
                  <button
                    type="button"
                    onClick={() =>
                      mutate((c) => {
                        c.footer.certifications.splice(i, 1);
                      })
                    }
                    className="text-caption text-danger-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <ImageUploadField
                  label="Logo"
                  value={cert.imageUrl}
                  onChange={(url) =>
                    mutate((c) => {
                      c.footer.certifications[i].imageUrl = url;
                    })
                  }
                />
                <Input
                  label="Alt text"
                  type="text"
                  value={cert.alt}
                  placeholder="ANBOS"
                  onChange={(e) =>
                    mutate((c) => {
                      c.footer.certifications[i].alt = e.target.value;
                    })
                  }
                />
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                mutate((c) => {
                  c.footer.certifications.push({ imageUrl: "", alt: "" });
                })
              }
            >
              Add badge
            </Button>
          </div>
        </Section>

        {/* Save */}
        <div className="flex items-center justify-end gap-3 border-t border-ink-100 pt-5">
          {status === "saved" && (
            <span className="text-caption text-success-600">Saved.</span>
          )}
          {status === "error" && (
            <span className="text-caption text-danger-600">{errorMsg}</span>
          )}
          <Button
            type="submit"
            variant="dark"
            size="md"
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving…" : "Save Professional content"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
