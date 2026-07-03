---
name: Chez Jambes Courtes
description: Bilingual (FR/中文) storefront for small-batch, air-imported Taiwanese fruit — playful and hand-picked, not a slick DTC storefront
colors:
  yellow: "#FACA31"
  midnight: "#1A1512"
  magenta: "#F5736E"
  green: "#AFC949"
  dark-green: "#84A339"
  orange: "#F94630"
typography:
  display:
    fontFamily: "Chiron GoRound TC, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "Chiron GoRound TC, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Chiron GoRound TC, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.12em"
rounded:
  sm: "2px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.midnight}"
    textColor: "{colors.yellow}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.midnight}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.midnight}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.midnight}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
---

# Design System: Chez Jambes Courtes

## 1. Overview

**Creative North Star: "The Market Stall"**

Chez Jambes Courtes imports rare, fully-ripe Taiwanese fruit by air, in small
batches, and sells it directly to a bilingual (中文/FR) community in Paris.
The system reads like a friendly local fruit stall that happens to be
run by someone with real design taste — hand-drawn organic marks, a warm
fruit-crate palette, and a rounded, approachable display font — never a
templated SaaS/DTC storefront, and never a red-and-gold "traditional Chinese"
pastiche. Every surface right now exists to grow the notify list
(`/s-abonner`), not to close a sale — the checkout/product catalogue is not
yet public — so restraint around urgency tropes (countdown timers, fake
scarcity banners) matters more than conversion tricks.

Density is unhurried: generous line-height, one clear call to action per
screen, bilingual text always paired (中文 leads, FR follows, in a visibly
secondary weight/opacity) rather than treated as a translation footnote.

**Key Characteristics:**
- Warm, saturated fruit-crate palette (yellow, magenta, orange, two greens) against a plain white canvas — color is decoration, not wallpaper.
- Chiron GoRound TC's soft, rounded letterforms carry the entire voice: headlines, labels, and body all in one playful family.
- Hand-drawn organic blob illustrations (SVG) as the signature decorative device, never generic icons or stock photography.
- Flat surfaces, pill buttons, soft-tinted cards — no shadows, no gradients, no glassmorphism.

## 2. Colors

A fruit-crate palette — warm yellow, red-orange, magenta, and two greens — used deliberately against white and near-black, never blended into pastel tints.

### Primary
- **Golden Mango** (`#FACA31`): the brand's signature color — hero accents, primary button text, dot-pattern hero backgrounds, active-state highlights (checkboxes, focus rings).

### Secondary
- **Lychee Magenta** (`#F5736E`): errors, required-field markers, form focus borders, and one of the two organic-blob illustration colors. Reserved for things that need attention.
- **Market Green** (`#AFC949`) / **Deep Green** (`#84A339`): the nav/footer bands and the marquee strip. Green is the "storefront" color — it's what wraps the whole site, not an accent.

### Neutral
- **Midnight** (`#1A1512`): the near-black ink used for all body text, primary buttons, and dark surfaces. Never pure `#000`.
- **White** (`#ffffff`): the default canvas for content sections.
- Midnight is also used at low opacity (`/3` to `/60`) for borders, tinted card backgrounds, and secondary/tertiary text — see the Named Rule below.

### Named Rules
**The Opacity-Not-Gray Rule.** Secondary and tertiary text, hairline borders, and tinted card backgrounds are never a separate gray token — they're `midnight` at reduced opacity (`midnight/40` through `midnight/60` for secondary text, `midnight/8` to `midnight/10` for borders, `midnight/3` to `midnight/5` for tinted fills). This keeps every neutral rooted in the same ink color instead of drifting toward generic UI gray.

**The One-Loud-Color Rule.** Any given section uses at most one saturated brand color as its dominant surface (a yellow dot-pattern hero, a green nav band). Don't stack two saturated brand colors as backgrounds in the same viewport — let white carry the rest.

## 3. Typography

**Display Font:** Chiron GoRound TC (with sans-serif fallback)
**Body Font:** Chiron GoRound TC (with sans-serif fallback)
**Mono Font:** Geist Mono is loaded as `--font-geist-mono` but not currently used in any visible UI — treat it as reserved, not part of the live system.

**Character:** One rounded, soft-edged variable font carries every role — headlines, labels, and body copy — which is what gives the site its hand-picked, unforced-playful voice instead of the display/body-serif-pairing convention. Don't introduce a second family; vary weight and size instead.

### Hierarchy
- **Display** (bold 700, `text-3xl`/1.875rem, tight line-height): page-title moments only ("購買流程 · Comment acheter", "常見問題"). One per page.
- **Headline** (bold 700, `text-lg`–`text-2xl`): section and step titles (e.g. numbered step headings in comment-acheter).
- **Title** (bold 700, `text-sm`–`text-base`): card/accordion question titles, form labels' bold companions.
- **Body** (regular 400, `text-sm`–`text-base`, relaxed/loose line-height): paragraph copy. Cap prose at ~65–75ch; bilingual pairs stack as 中文 (full opacity, `font-medium`) directly above FR (reduced opacity, e.g. `midnight/50`–`/55`).
- **Label** (medium 500, `0.62rem`–`0.72rem`, `tracking-[0.12em]`–`[0.22em]`, uppercase): form field labels, eyebrow-style step captions, marquee text.

### Named Rules
**The Paired-Language Rule.** 中文 and FR are never shown alone — every user-facing string appears as a stacked or inline pair, 中文 first at full weight/opacity, FR second at reduced opacity (never the reverse, never omitted).

## 4. Elevation

Flat by default — no `box-shadow` anywhere in the current system. Depth is conveyed through flat color blocks (the green nav band, the yellow dot-pattern hero), soft borders (`border-midnight/10`), and tinted fills (`bg-midnight/3` to `/5`), not through shadows or lifted cards.

### Named Rules
**The No-Shadow Rule.** Never add `box-shadow` to simulate elevation. If a component needs separation from its background, use a `border` (hairline, `midnight/8`–`/15`) or a tinted fill, matching the existing card/accordion/note-box treatment.

## 5. Components

### Buttons
- **Shape:** fully rounded pill (`rounded-full`).
- **Primary:** `bg-midnight` with `text-yellow`, bold, uppercase-tracked label, `px-5 py-2.5`; hover inverts to `bg-yellow text-midnight`.
- **Secondary/Ghost:** transparent fill, `border-2 border-midnight/20`, `text-midnight/60`; hover solidifies the border and text to full `midnight`.
- **Form submit (SubscribeForm):** full-width, `bg-midnight text-white`, `rounded-sm` (not pill — form buttons break from the pill convention deliberately), `active:scale-[0.98]` for tactile press feedback, `disabled:opacity-50`.

### Cards / Info Boxes
- **Corner style:** `rounded-xl`–`rounded-2xl` (16–24px), consistently soft, never sharp.
- **Background:** tinted midnight fills (`bg-midnight/3` to `/5`) or plain white, never a separate gray card color.
- **Border:** hairline `border-midnight/8` to `/10`.
- **Internal padding:** generous, `px-4 py-3` to `px-6 py-5`.
- Nested dividers inside a card use `border-t border-midnight/8`–`/10` rather than a second card.

### Inputs / Fields
- **Style:** transparent background, single `border` (`border-yellow/50` at rest), `rounded-sm` (2px — flatter than every other rounded element, a deliberate form-specific exception).
- **Focus:** border color shifts to `magenta`.
- **Labels:** uppercase, `0.72rem`, `tracking-[0.12em]`, `midnight/60`.
- **Error:** message text in `magenta`, `0.72rem`.

### Accordion (FAQ)
- Container: `border border-midnight/10 rounded-2xl`, overflow-hidden.
- Trigger: full-width button, bilingual question stack (zh bold, fr `midnight/45` smaller), a `+` glyph that rotates 45° open.
- Panel: top hairline divider, bilingual answer stack (zh `font-medium`, fr `midnight/55` below a second divider).

### Numbered Step List (Comment acheter)
- A signature pattern: circular `w-10 h-10 rounded-full bg-midnight` badge with a bold `text-yellow tabular-nums` two-digit number, connected to the next step by a `w-px bg-midnight/15` vertical line.
- Each step pairs an uppercase eyebrow caption (`midnight/40`) with a bold headline and nested tinted info cards for sub-options (payment methods, etc.).

### Navigation
- **Style:** sticky header, flat color band (`bg-green` at rest, transitions to `bg-dark-green` on scroll), wordmark in bold uppercase tracked text, single burger menu (no full desktop link row).
- **Dropdown:** rounded-xl bordered panel matching the header's current color state, each item a bilingual stacked pair.
- **Footer:** solid `bg-dark-green`, white centered text, bilingual nav links, tracked/loose letter-spacing throughout.

### Organic Blob Illustrations (signature component)
Hand-drawn irregular blob SVGs (`fill-magenta`, `fill-dark-green`, `fill-yellow`) scattered as decorative accents around hero imagery and forms, with a subtle `hover:scale-120` micro-interaction. This — not icons, not stock photography — is the site's decorative signature; reuse the existing SVG family rather than introducing a new illustration style.

## 6. Do's and Don'ts

### Do:
- **Do** pair every user-facing string as 中文 (full weight) + FR (reduced opacity), 中文 first.
- **Do** keep buttons fully pill-shaped (`rounded-full`) except form submit buttons, which use `rounded-sm`.
- **Do** build cards and info-boxes from midnight-tinted fills and hairline borders, never a separate gray.
- **Do** reuse the hand-drawn organic blob SVGs as the decorative signature instead of icon sets or photography for accents.
- **Do** keep every section anchored to a single dominant brand color at most (One-Loud-Color Rule).
- **Do** treat the notify-list subscribe flow as the primary conversion goal on every current storefront page — checkout/catalogue are not yet public.

### Don't:
- **Don't** add `box-shadow` anywhere — depth comes from flat color, borders, and tint, never elevation.
- **Don't** introduce a second typeface. Chiron GoRound TC carries display, headline, and body; vary weight/size instead.
- **Don't** reach for generic SaaS/DTC storefront patterns — gradient heroes, stock photography, hero-metric templates, glassmorphism.
- **Don't** use red-and-gold lantern/dragon "traditional Chinese" clichés — the brand is playful/artisanal, not a pastiche of Chinese-restaurant visual tropes.
- **Don't** use urgency-marketing tropes (countdown timers, fake stock warnings) to manufacture scarcity — the batches are genuinely limited; state that plainly instead.
- **Don't** grey out secondary text with a generic gray token — use `midnight` at reduced opacity so every neutral stays rooted in the same ink color.
