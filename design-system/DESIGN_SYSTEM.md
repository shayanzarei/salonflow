# SoloHub Design System

> A modern, minimal, multi-tenant design language for salon owners, their staff, and their clients.

**Version:** 1.0 · **Last updated:** 2026-04-24

---

## 1. Principles

1. **Calm by default.** Salons are sensory businesses. The product UI should feel quiet so the owner's brand can be loud.
2. **Content over chrome.** Minimal borders, generous whitespace, soft surfaces. No decorative noise.
3. **One brand, many tenants.** Every tenant can override a single primary color. Everything else stays neutral so tenant branding always reads as intentional.
4. **Accessible at rest.** WCAG AA contrast is non-negotiable. Focus states, keyboard paths, and touch targets are designed first, not retrofitted.
5. **Composable, not rigid.** Tokens compose into primitives; primitives compose into patterns. No one-off components.
6. **Minimum viable motion.** Motion confirms, it does not decorate. Short durations (150–250ms), soft easing.

---

## 2. Design Tokens

### 2.1 Color

SoloHub uses a four-layer color model:

```
neutral  → surfaces, borders, text
brand    → per-tenant primary (overrideable at runtime)
accent   → SoloHub marketing identity (amber)
semantic → success, warning, danger, info
```

#### Neutrals (Stone — warmer than slate, reads friendlier in salon contexts)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-ink-950` | `#0C0A09` | Headings in dark mode, highest-contrast text |
| `--color-ink-900` | `#1C1917` | Primary text (light mode) |
| `--color-ink-700` | `#44403C` | Secondary text |
| `--color-ink-500` | `#78716C` | Tertiary text, icons |
| `--color-ink-400` | `#A8A29E` | Placeholder, disabled text |
| `--color-ink-300` | `#D6D3D1` | Strong borders, dividers |
| `--color-ink-200` | `#E7E5E4` | Default borders |
| `--color-ink-100` | `#F5F5F4` | Subtle surfaces, hover |
| `--color-ink-50`  | `#FAFAF9` | Page background (app) |
| `--color-ink-0`   | `#FFFFFF` | Card surface |

#### Brand (tenant primary — defaulted to SoloHub violet)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-brand-50`  | `#F5F3FF` | Subtle brand tint (selected rows, info backgrounds) |
| `--color-brand-100` | `#EDE9FE` | Hover on brand-tinted surfaces |
| `--color-brand-200` | `#DDD6FE` | Disabled brand button |
| `--color-brand-500` | `#8B5CF6` | Brand accents, links |
| `--color-brand-600` | `#7C3AED` | **Default primary CTA** (current default) |
| `--color-brand-700` | `#6D28D9` | Brand CTA hover |
| `--color-brand-900` | `#4C1D95` | Brand CTA pressed |
| `--color-brand-contrast` | `#FFFFFF` | Text on brand fills |

> **Runtime override:** `--color-brand-600` is derived from the tenant's `primary_color` DB field. The 50/100/200/700/900 stops are generated from it at render time (see §8).

#### Accent (SoloHub marketing only — not used inside tenant surfaces)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent-500` | `#F59E0B` | Marketing accent (badges, highlights) |
| `--color-accent-600` | `#D97706` | Marketing accent hover |

#### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success-50`  | `#ECFDF5` | Success surface |
| `--color-success-600` | `#059669` | Success icon / text |
| `--color-success-700` | `#047857` | Success emphasis |
| `--color-warning-50`  | `#FFFBEB` | Warning surface |
| `--color-warning-600` | `#D97706` | Warning icon / text |
| `--color-warning-700` | `#B45309` | Warning emphasis |
| `--color-danger-50`   | `#FEF2F2` | Danger surface |
| `--color-danger-600`  | `#DC2626` | Danger icon / text |
| `--color-danger-700`  | `#B91C1C` | Danger emphasis |
| `--color-info-50`     | `#EFF6FF` | Info surface |
| `--color-info-600`    | `#2563EB` | Info icon / text |

#### Booking status (product-specific semantic)

| Status | Token | Hex |
|--------|-------|-----|
| Confirmed | `--status-confirmed` | `#059669` (success-600) |
| Pending   | `--status-pending`   | `#D97706` (warning-600) |
| Cancelled | `--status-cancelled` | `#78716C` (ink-500) |
| No-show   | `--status-noshow`    | `#DC2626` (danger-600) |
| Completed | `--status-completed` | `#6D28D9` (brand-700) |

### 2.2 Typography

**Typeface:** Geist Sans (UI), Geist Mono (data, code, times/prices in tables).
Kept from the current stack — it reads modern, neutral, and compresses well at small sizes.

#### Type scale (1.125 ratio, tuned for dense product UI)

| Token | Size | Line height | Tracking | Weight | Use |
|-------|------|-------------|----------|--------|-----|
| `--text-display` | 48px / 3rem | 1.05 | -0.02em | 600 | Marketing hero, onboarding |
| `--text-h1` | 32px / 2rem | 1.15 | -0.015em | 600 | Page title |
| `--text-h2` | 24px / 1.5rem | 1.2 | -0.01em | 600 | Section title |
| `--text-h3` | 20px / 1.25rem | 1.3 | -0.005em | 600 | Card title |
| `--text-h4` | 18px / 1.125rem | 1.35 | 0 | 600 | Subsection |
| `--text-body` | 15px / 0.9375rem | 1.55 | 0 | 400 | **Default body** |
| `--text-body-sm` | 14px / 0.875rem | 1.5 | 0 | 400 | Secondary body, table cells |
| `--text-label` | 13px / 0.8125rem | 1.4 | 0.005em | 500 | Form labels, metadata |
| `--text-caption` | 12px / 0.75rem | 1.4 | 0.01em | 400 | Captions, timestamps |
| `--text-overline` | 11px / 0.6875rem | 1.3 | 0.08em | 600 | Section eyebrows (UPPERCASE) |

> Tailwind v4 note: declare these as `--text-*` in `@theme` so they map to `text-display`, `text-h1`, etc.

### 2.3 Spacing

4-point grid. Only use these values.

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-0` | 0 | 0 |
| `--space-1` | 0.25rem | 4 |
| `--space-2` | 0.5rem | 8 |
| `--space-3` | 0.75rem | 12 |
| `--space-4` | 1rem | 16 |
| `--space-5` | 1.25rem | 20 |
| `--space-6` | 1.5rem | 24 |
| `--space-8` | 2rem | 32 |
| `--space-10` | 2.5rem | 40 |
| `--space-12` | 3rem | 48 |
| `--space-16` | 4rem | 64 |
| `--space-20` | 5rem | 80 |
| `--space-24` | 6rem | 96 |

**Component padding defaults:** `--space-3` (buttons/inputs y), `--space-4` (buttons/inputs x), `--space-6` (card), `--space-8` (section).

### 2.4 Radius

Minimal, warm. Two-tier system — round things fully or softly. Avoid mid-range radii.

| Token | Value | Use |
|-------|-------|-----|
| `--radius-none` | 0 | Tables, data grids |
| `--radius-sm` | 6px | Inputs, small buttons, chips |
| `--radius-md` | 10px | Buttons, selects |
| `--radius-lg` | 14px | Cards, modals |
| `--radius-xl` | 20px | Hero surfaces, empty states |
| `--radius-full` | 9999px | Pills, avatars, marketing CTAs |

### 2.5 Borders

| Token | Value |
|-------|-------|
| `--border-width-hairline` | 1px |
| `--border-width-medium` | 2px (focus rings) |
| `--border-color-default` | `--color-ink-200` |
| `--border-color-strong` | `--color-ink-300` |
| `--border-color-subtle` | `--color-ink-100` |

### 2.6 Elevation (shadows)

Kept soft. Never sharp or tinted.

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-none` | none | Flat |
| `--shadow-xs` | `0 1px 2px rgba(28, 25, 23, 0.04)` | Inputs, subtle separation |
| `--shadow-sm` | `0 1px 3px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04)` | Cards at rest |
| `--shadow-md` | `0 4px 12px rgba(28, 25, 23, 0.08)` | Card hover, popovers |
| `--shadow-lg` | `0 12px 32px rgba(28, 25, 23, 0.10)` | Modals, dropdowns |
| `--shadow-xl` | `0 24px 48px rgba(28, 25, 23, 0.14)` | Dialogs, command palette |
| `--shadow-focus` | `0 0 0 3px var(--color-brand-100)` | Focus ring (outer) |

### 2.7 Motion

| Token | Value | Use |
|-------|-------|-----|
| `--duration-instant` | 80ms | Pressed states |
| `--duration-fast` | 150ms | Hover, tooltips |
| `--duration-base` | 200ms | **Default** — most UI transitions |
| `--duration-slow` | 300ms | Modal/drawer enter |
| `--duration-slower` | 500ms | Celebratory confirmations |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default |
| `--ease-emphasized` | `cubic-bezier(0.4, 0, 0.2, 1)` | Modal, drawer |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Success confirmations only |

Respect `prefers-reduced-motion`: fall back to opacity fades, 120ms.

### 2.8 Z-index

| Token | Value |
|-------|-------|
| `--z-base` | 0 |
| `--z-sticky` | 100 |
| `--z-dropdown` | 1000 |
| `--z-sidebar` | 1100 |
| `--z-overlay` | 1200 |
| `--z-modal` | 1300 |
| `--z-popover` | 1400 |
| `--z-toast` | 1500 |

### 2.9 Breakpoints

| Token | Value | Use |
|-------|-------|-----|
| `--bp-sm` | 640px | Large phones |
| `--bp-md` | 768px | Tablets |
| `--bp-lg` | 1024px | Laptops (dashboard becomes 2-column) |
| `--bp-xl` | 1280px | Desktops |
| `--bp-2xl` | 1536px | Large desktops |

---

## 3. Surfaces

Three surface archetypes, used consistently across all four product surfaces (marketing, booking, dashboard, admin).

| Surface | Background | Border | Shadow | Purpose |
|---------|------------|--------|--------|---------|
| **Page** | `ink-50` | — | — | App background |
| **Card** | `ink-0` | `ink-200` (optional) | `shadow-sm` | Default container |
| **Raised** | `ink-0` | — | `shadow-md` | Popovers, dropdowns |
| **Overlay** | `ink-0` | — | `shadow-xl` | Modals, dialogs |
| **Inset** | `ink-100` | — | — | Muted panels (e.g. empty states inside a card) |
| **Brand tint** | `brand-50` | `brand-100` | — | Selected rows, tenant-themed callouts |

---

## 4. Components

### 4.1 Button

**Anatomy:** `[leading icon?] Label [trailing icon?]`

**Variants:**

| Variant | Use | Background | Text | Border |
|---------|-----|------------|------|--------|
| `primary` | Main action per screen (only one) | `brand-600` | `brand-contrast` | — |
| `secondary` | Supporting action | `ink-0` | `ink-900` | `ink-200` |
| `ghost` | Tertiary, inline actions | transparent | `ink-700` | — |
| `danger` | Destructive action | `danger-600` | white | — |
| `link` | Inline, text-like | transparent | `brand-600` | — (underline on hover) |

**Sizes:**

| Size | Height | Padding-x | Text | Radius |
|------|--------|-----------|------|--------|
| `sm` | 32px | 12px | 13px / 500 | `radius-sm` |
| `md` | 40px | 16px | 14px / 500 | `radius-md` |
| `lg` | 48px | 20px | 15px / 500 | `radius-md` |
| `xl` (marketing) | 56px | 28px | 16px / 600 | `radius-full` |

**States:**

| State | Primary | Secondary |
|-------|---------|-----------|
| Default | `brand-600` | `ink-0` + `ink-200` border |
| Hover | `brand-700` | `ink-100` bg |
| Active/Pressed | `brand-900`, scale 0.98 | `ink-200` bg |
| Focus | + `shadow-focus` | + `shadow-focus` |
| Disabled | `brand-200`, text `brand-contrast` 60% opacity, `cursor: not-allowed` | `ink-100` bg, `ink-400` text |
| Loading | Spinner replaces leading icon; label stays for width stability |

**Do's and Don'ts:**

| ✅ Do | ❌ Don't |
|------|---------|
| Use one primary per screen | Chain two primaries side by side |
| Use sentence case ("Save changes") | UPPERCASE labels |
| Keep labels ≤ 3 words | Generic "Submit" / "Click here" |
| Use `xl` pill only on marketing | Use `xl` pill inside the dashboard |

### 4.2 Input

**Anatomy:** `[Label] · [Leading icon?] [Field] [Trailing icon/button?] · [Helper or Error]`

| Element | Token |
|---------|-------|
| Height | 40px (`md`), 32px (`sm`), 48px (`lg`) |
| Border | `ink-200` default, `ink-300` hover, `brand-600` + `shadow-focus` on focus |
| Radius | `radius-sm` |
| Background | `ink-0` default, `ink-100` disabled |
| Text | `ink-900` value, `ink-400` placeholder |
| Label | `text-label`, `ink-700`, 6px below field |
| Helper | `text-caption`, `ink-500`, 4px above field |
| Error | `text-caption`, `danger-600`; field border → `danger-600`, focus ring `danger-50` |

**Variants:** `text`, `email`, `password` (with show/hide trailing icon), `search` (with leading search icon), `textarea` (min-height 96px), `select` (with chevron-down trailing icon).

**Required indicator:** Subtle red dot before label (`•` `danger-600`), not an asterisk. Reserve asterisk for legal copy.

### 4.3 Checkbox / Radio / Switch

| Control | Size | Checked |
|---------|------|---------|
| Checkbox | 18×18, `radius-sm` | `brand-600` bg, white check, 2px stroke |
| Radio | 18×18, `radius-full` | White dot on `brand-600` |
| Switch | 32×18 track, 14×14 thumb | Track `brand-600`, thumb white, 150ms slide |

All three share focus ring and disabled styling.

### 4.4 Select / Combobox

- Trigger = Input with chevron.
- Menu = Raised surface, `radius-md`, `shadow-md`.
- Options: 36px row, hover = `ink-100`, selected = `brand-50` + `brand-700` text + check icon trailing.
- Keyboard: ↑↓ navigate, Enter select, Esc close, typeahead jump.

### 4.5 Card

Foundational container.

| Token | Value |
|-------|-------|
| Background | `ink-0` |
| Border | `1px solid ink-200` (optional; use shadow **or** border, not both) |
| Radius | `radius-lg` (14px) |
| Padding | `space-6` (24px); `space-5` on mobile |
| Shadow | `shadow-sm` default, `shadow-md` on interactive hover |

**Sub-patterns:**
- **Card header** — `text-h3` title + optional eyebrow + optional action (ghost button).
- **Card footer** — divider above (`1px solid ink-100`), padding top `space-4`.
- **Split card** — two columns separated by vertical `1px solid ink-100` at md+.

### 4.6 Table

Dense, data-first. No zebra stripes — rely on row hover instead.

| Element | Token |
|---------|-------|
| Row height | 56px default, 48px dense |
| Header | `text-overline`, `ink-500`, sticky on scroll |
| Divider | `1px solid ink-100` |
| Row hover | `ink-50` |
| Selected row | `brand-50` + left border `brand-600` 3px |
| Cell padding | `space-4` x, `space-3` y |
| Numbers/times | Geist Mono, tabular-nums |

Empty state: centered icon + title + description + primary action.

### 4.7 Badge / Status pill

| Use | Background | Text |
|-----|------------|------|
| Neutral | `ink-100` | `ink-700` |
| Info | `info-50` | `info-600` |
| Success (Confirmed) | `success-50` | `success-700` |
| Warning (Pending) | `warning-50` | `warning-700` |
| Danger (No-show) | `danger-50` | `danger-700` |
| Brand (Completed) | `brand-50` | `brand-700` |

Size: 22px height, 10px x padding, `radius-full`, `text-caption` / 600.
Optional leading dot (6px) matching the text color.

### 4.8 Avatar

| Size | Dimension | Use |
|------|-----------|-----|
| `xs` | 24 | Table rows |
| `sm` | 32 | Lists |
| `md` | 40 | Cards, header |
| `lg` | 56 | Detail headers |
| `xl` | 96 | Profile, staff detail |

Shape: `radius-full`. Fallback: 2-letter initials, `brand-50` bg, `brand-700` text, `600` weight. Image: object-cover.

### 4.9 Navigation

**Dashboard sidebar**
- Width 240px (expanded), 64px (collapsed).
- Logo badge at top (tenant brand color, initials).
- Section groups separated by `space-4`, eyebrow label in `overline`.
- Item: 40px height, `space-3` x padding, icon 20px, label `text-body-sm`.
- Active: `brand-50` background, `brand-700` text, 3px left accent in `brand-600`.
- Hover: `ink-100` bg.

**Booking top nav**
- 64px height (72px on desktop), sticky, `ink-0` bg, `ink-100` bottom border.
- Logo left, horizontal links center (desktop), CTA right.
- Tenant brand color used for CTA only.

**Marketing header**
- 72px height, transparent until 16px scroll → `ink-0` with `shadow-sm`.

**Mobile drawer**
- Full-height slide-in, 288px wide, `shadow-xl`, overlay scrim `rgba(12,10,9,0.4)`.
- Close button top-right, 44×44 touch target.

### 4.10 Modal / Dialog

| Token | Value |
|-------|-------|
| Surface | `ink-0`, `radius-lg`, `shadow-xl` |
| Max-width | 480 (sm), 640 (md), 800 (lg) |
| Padding | `space-6` |
| Scrim | `rgba(12,10,9,0.5)` backdrop blur 4px |
| Enter | Fade + scale 0.96 → 1, 200ms `ease-emphasized` |

Close on: Esc, scrim click, close button. Trap focus. Return focus on close.

### 4.11 Toast

Top-right stack (desktop) / top-center (mobile).

- Max 3 visible, auto-dismiss 5s (success/info), 8s (warning), persistent until user action (danger).
- Width 380px, `radius-md`, `shadow-lg`.
- Left accent bar (3px) in semantic color.
- Close icon top-right.

### 4.12 Empty state

Centered, vertical:
1. Soft illustration or icon (48×48, `ink-300`).
2. Title — `text-h3`, `ink-900`.
3. Description — `text-body`, `ink-500`, max-width 360px.
4. Primary CTA.

Used anywhere a list can be empty: bookings, staff, services, gallery, reviews.

### 4.13 Date / Time picker (booking-critical)

- Calendar grid: 7 cols, 40×40 cells, `radius-full` on hover.
- Today: `ink-200` ring.
- Selected: `brand-600` fill, white text.
- Disabled/unavailable: `ink-400`, `cursor: not-allowed`, no hover.
- Time slots: pill grid, 3 cols mobile / 4 cols desktop, each 44px tall, `radius-md`, outline style → filled brand on selection.

### 4.14 Stepper / Progress (booking flow)

Four-step booking: **Service → Staff → Time → Confirm**.

- Horizontal segmented bar on desktop; dots on mobile.
- Completed: `brand-600` fill, white check.
- Current: `brand-600` outline, `brand-600` number.
- Upcoming: `ink-200` outline, `ink-500` number.
- Connector line: 2px, `brand-600` up to current, `ink-200` after.

### 4.15 Icon

- Stroke-based, 1.75px default stroke.
- Sizes: 16, 20 (default), 24, 32. Always square.
- Color: `currentColor` — inherits from parent text color.
- Keep current custom SVG system; expand the set as needed (ensure Booking, Calendar, Scissors, Sparkle, Users all align to the 24×24 grid with 2px padding).

---

## 5. Patterns

### 5.1 Forms

- Labels **above** fields (never inline placeholders as labels).
- One column on mobile, two columns at `md+` for paired fields (e.g. first/last name).
- Field spacing: `space-5` between fields, `space-2` between label and field.
- Required fields marked with a dot; optional fields labeled "(optional)" in `ink-400`.
- Submit button: primary, right-aligned on desktop, full-width on mobile.
- Secondary "Cancel" / "Back" button: ghost, left of submit.
- Inline errors appear immediately below the field on blur or submit; never alert dialogs for field errors.

### 5.2 Data lists (bookings, customers, services)

Two modes:
- **Dense table** (desktop, ≥ lg). Sticky header, 56px rows.
- **Card list** (mobile and narrow widths). Each item a Card, stacked with `space-3`.

Filters: chip row above (scrollable horizontally on mobile). Search: always top-left.

### 5.3 Detail page layout

```
[← Back]   Page title                [actions →]
eyebrow
─────────────────────────────────────────────
Main column (2/3)             Aside (1/3)
  sections of cards             metadata card
                                timeline card
```

- Main column max-width 720px for readability.
- Aside collapses below main on mobile.

### 5.4 Multi-step wizards

Used for onboarding, booking, subscription upgrade.

- Stepper at top (§4.14).
- One card per step, centered, max-width 560px.
- Primary CTA at bottom-right: "Continue" → "Confirm" on last step.
- "Back" ghost button bottom-left.
- Progress persists if user leaves; show "Resume setup" banner.

### 5.5 Feature gating (paywall)

The existing `FeatureGate` component stays. Visual treatment:
- Locked state: card renders at 100% but with lock overlay — `ink-0` at 92% opacity, centered lock icon 32×32, "Upgrade to [plan] to unlock" CTA.
- Gated menu item: shown but with `Sparkle` icon trailing, label in `ink-500`.

### 5.6 Tenant branding application

When a tenant sets `primary_color`:
1. `--color-brand-600` overrides at the tenant subdomain / tenant-themed surfaces only.
2. Auto-generate 50/100/200/700/900 stops via HSL lightness shifts (see §8).
3. Auto-compute `--color-brand-contrast` (white or `ink-950`) via WCAG contrast check.
4. Never apply tenant brand color to SoloHub-owned surfaces (admin panel, marketing site). Use SoloHub violet there.

### 5.7 Email templates (Resend)

Matches the product visually:
- 600px container, `ink-0`, `radius-lg`, `shadow-sm` (as table-nested for email clients).
- Logo header (tenant logo or SoloHub logo for system mail).
- Body `text-body`, `ink-900`.
- CTA: solid `brand-600` button, `radius-md`, 48px tall, 16px padding.
- Footer: `ink-500`, `text-caption`, unsubscribe link required.
- Plain text fallback always provided.

**Reminder email cadence** (booking): 24h before, 2h before, post-visit review request 4h after.

---

## 6. Accessibility

- **Contrast:** all text/icon vs. background passes WCAG AA (4.5:1 body, 3:1 large). Tenant color combos tested at runtime; fall back to white or ink-950 for contrast.
- **Touch targets:** minimum 44×44px on touch devices.
- **Focus:** every interactive element has `shadow-focus`. Never `outline: none` without replacement.
- **Keyboard:** Tab reaches everything, Shift+Tab reverses, Escape closes overlays, Enter activates primary.
- **Screen readers:** Icon-only buttons require `aria-label`. Form errors announced via `aria-describedby`. Status changes use `aria-live="polite"`.
- **Motion:** Respect `prefers-reduced-motion: reduce` → drop slide/scale, keep opacity.
- **Color independence:** never rely on color alone for status — always pair with a label, icon, or shape.

---

## 7. Voice & microcopy

- **Warm, not cute.** "Your next booking is tomorrow at 10am" not "Yay, you have a booking! 🎉".
- **Active voice.** "Save changes" not "Changes saved".
- **Second person.** "You" for the salon owner, "Your client" for customers.
- **Numbers as numerals.** "3 staff" not "three staff".
- **Times always with timezone hint** on confirmations.
- **Empty states** end with an action, not an apology. "Add your first service →" not "Sorry, nothing here yet."

---

## 8. Implementation notes (Tailwind v4 + Next.js 16)

### 8.1 Tokens → `app/globals.css`

Declare tokens in `:root`, expose to Tailwind via `@theme inline`. See the `tokens.css` file shipped alongside this doc — drop it in place of the current `globals.css` (or import it).

### 8.2 Tenant brand color at runtime

In the tenant layout, inject a `<style>` tag or inline style on the root element:

```tsx
<html style={{
  '--color-brand-600': tenant.primary_color,
  '--color-brand-50': hslLighten(tenant.primary_color, 44),
  '--color-brand-100': hslLighten(tenant.primary_color, 36),
  '--color-brand-200': hslLighten(tenant.primary_color, 24),
  '--color-brand-700': hslDarken(tenant.primary_color, 8),
  '--color-brand-900': hslDarken(tenant.primary_color, 20),
  '--color-brand-contrast': pickContrast(tenant.primary_color),
} as React.CSSProperties}>
```

Helpers live in `lib/brand.ts` (new file). Derivation must be deterministic so SSR and hydration match.

### 8.3 Component library location

Add `components/ds/` with one file per primitive: `Button.tsx`, `Input.tsx`, `Card.tsx`, `Badge.tsx`, `Avatar.tsx`, `Modal.tsx`, `Toast.tsx`, etc. Export a single `Button` that accepts `variant` + `size` + `asChild` (use Radix Slot or equivalent). Migrate existing screens incrementally — start with auth, then booking flow (customer-visible), then dashboard.

### 8.4 Deprecate

- The five inline hex colors scattered in `buttonStyles.ts` — collapse to `variant="primary"` + `size="xl"`.
- Inline style objects in `AddServiceForm` and siblings — move to `<Input />`, `<Select />`, `<Textarea />`.
- Hardcoded `focus:border-purple-400` — replaced by `ring` tokens.

### 8.5 Do not introduce

- New fonts. Stay on Geist.
- New radii between `md` (10) and `xl` (20). Pick one side.
- Tinted shadows. All shadows are warm-neutral rgba only.
- Arbitrary Tailwind values (`[13px]`, `[#abc123]`). Use tokens.

---

## 9. Audit — current codebase (Score: 52 / 100)

| Area | Score | Top fix |
|------|-------|---------|
| Token coverage | 3/10 | No defined tokens beyond background/foreground — migrate to full token set |
| Color consistency | 4/10 | 20+ unique hex literals across files; consolidate to brand + ink + semantic |
| Typography | 5/10 | No type scale — all sizes ad-hoc from Tailwind defaults |
| Component reuse | 4/10 | Forms built inline 5+ times; no shared `<Input />` |
| Accessibility | 6/10 | Focus states mostly present, ARIA sparse on icon buttons |
| Motion | 5/10 | Transitions inline, no shared duration/easing |
| Responsive | 7/10 | Mobile breakpoints used well; some dashboard sidebar rough on tablet |
| Dark mode | 2/10 | CSS vars exist but nothing consumes them — decide: support or remove |
| Iconography | 8/10 | Custom SVG system is clean and consistent |
| Tenant branding | 6/10 | Works but only one token overridden; needs full 5-stop derivation |

### Priority actions

1. **Ship the tokens file** — single source of truth unblocks everything else.
2. **Build `<Button />`, `<Input />`, `<Card />`, `<Badge />`** as `components/ds/` — convert auth + booking flow first.
3. **Remove inline hex values** from `buttonStyles.ts`, `AddServiceForm`, `DashboardChrome`. Replace with tokens.
4. **Decide on dark mode** — either commit and finish it, or remove the `prefers-color-scheme` block. Current half-state is a footgun.
5. **Tenant color derivation** — implement the HSL helpers in §8.2 so tenant branding scales beyond the single hue.
6. **Document as you build** — add Storybook or a `/design-system` route inside the app that renders the reference page.

---

## 10. Roadmap

| Phase | Scope |
|-------|-------|
| **v1.0 (now)** | Tokens, core primitives (Button, Input, Card, Badge, Avatar), booking flow migrated |
| **v1.1** | Table, Modal, Toast, Select, Dashboard migrated |
| **v1.2** | Date/Time picker, Stepper, full form patterns, Admin migrated |
| **v1.3** | Email templates aligned to system, motion system formalized |
| **v2.0** | Dark mode (if kept), theming API for white-label partners |

---

*Owned by SoloHub Design. Changes require review. See `/design-system` route in-app for the live reference.*
