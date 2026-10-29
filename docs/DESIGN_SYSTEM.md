# Majeurs design system

Everything here was copied from the live WordPress site (majeurs.com, Elementor global kit 8 and the computed styles on the home, trade program and product pages) on 27 Oct 2026, so the Next.js site looks the same.

Visual reference: run `npm run dev` and open **/design-system**. The page isn't indexed. Delete `app/(dev)` before launch if you don't want it public.

## Files

| What | Where |
| --- | --- |
| Tokens, type scale, utilities | `app/globals.css` (Tailwind v4 `@theme` + `@utility`) |
| Font loading | `app/fonts.ts` (`next/font/local`), applied in `app/layout.tsx` |
| Font files | `public/font/` |
| Logo (SVG, black + white; PNG backup) | `public/images/logo/` |
| Logo component | `components/ui/logo.tsx` → `<Logo />`, `<Logo variant="light" />` |
| Favicon / app icons | `app/favicon.ico` (16/32/48), `app/icon.png` (200), `app/apple-icon.png` (180), all from WP `favicon.png` |
| `cn()` helper | `lib/utils.ts` (clsx + tailwind-merge) |

## Fonts

| Token / class | Font | Weights | Used for |
| --- | --- | --- | --- |
| `font-sans` (default) | Helvetica Neue | 300 Light (body), 400 Regular (headings, buttons) | Everything |
| `font-display` | Nordique Pro | 400, 600 | Display headings, e.g. trade program, "Built for the people who specify" |

On WP, Elementor's "Helvetica Now Text/Display" globals never load, so the site actually renders in Helvetica Neue Light. Mirror that, not the Elementor setting.

**Licensing — check before launch:**
- `nordique-pro-semibold.woff2` is a **Fontspring DEMO** file (name: "FSP DEMO - Nrdq Pr Smbld"). It only has basic Latin, 95 glyphs. Buy a webfont licence for Nordique Pro, or drop the 600 weight.
- The Helvetica Neue files were converted with 11zon from desktop fonts. Confirm Majeurs holds a **web** licence from Monotype/Linotype, or switch to a licensed alternative.
- None of the fonts include **₦** (U+20A6). Prices fall back to the next font in the stack (Helvetica/Arial). Check the naira sign on Windows and Android.

## Colours

| Token | Hex | Use |
| --- | --- | --- |
| `black` / `primary` | #000000 | Buttons, headings, footer |
| `ink` / `foreground` | #1F252C | Body text |
| `charcoal` / `muted-foreground` | #4D4D4D | Secondary text |
| `grey` | #AAAAAA | Muted text, placeholders |
| `sand` / `secondary` / `border` | #E2DDDB | Bands, dividers, light text on dark |
| `sand-50` / `muted` | #E2DDDB at 50% | Top bar, soft panels |
| `cream` | #F7E9C5 | Highlight panels, selection |
| `gold` / `accent` / `ring` | #B2902F | Accent, focus ring |
| `gold-muted` | #9B8854 | Category labels, eyebrows |
| `bronze` | #695006 | Text links ("Read blog →", "Join waitlist →") |
| `brown` | #53390B | Trade program band, brown buttons |
| `whatsapp` | #25D366 | "Buy on WhatsApp" |

Use the semantic names (`bg-primary`, `text-muted-foreground`, `border-border`) in components, and the brand names where the colour itself is the point.

## Type scale (16px body base)

| Class / element | Mobile | Tablet ≥768 | Desktop ≥1025 |
| --- | --- | --- | --- |
| `text-display` (hero) | 36 | 48 | 64 |
| `h1`, `text-h1` | 32 | 40 | 56 |
| `h2`, `text-h2` | 28 | 32 | 40 |
| `h3`, `text-h3` | 24 | 28 | 32 |
| `h4`, `text-h4` | 20 | 22 | 24 |
| `text-lg` (card titles) | 18 | 18 | 18 |
| body / `text-base` | 16, line-height 1.6 | | |
| `text-sm` (small, buttons) | 14 | | |
| `eyebrow` | 13 uppercase, 2px tracking | 14 | 14 |

Breakpoints match Elementor: `md` = 768px (tablet), `lg` = 1025px (desktop).

## Layout and components

- `container-site`: max 1300px, 10px gutters on mobile and 20px from tablet up.
- `btn`: square corners, uppercase, 1px tracking, 10×26px padding. Add the colours:
  - Primary: `btn bg-black text-white hover:bg-ink`
  - Outline: `btn border-black text-black hover:bg-black hover:text-white`
  - On dark backgrounds: `btn border-white text-white hover:bg-white hover:text-black`
  - Brown: `btn bg-brown text-white hover:bg-bronze`
- Corners are square across the site (cards, inputs, buttons). Avoid `rounded-*` unless a design calls for it.
