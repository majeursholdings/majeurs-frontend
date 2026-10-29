# majeurs-frontend

The headless storefront for [majeurs.com](https://majeurs.com). Next.js renders the public site. WordPress + WooCommerce stays as the backend and admin: products, prices, stock, orders, payments, blog, page content and Rank Math SEO all still live in wp-admin.


## Stack

- Next.js 16 (App Router, `cacheComponents`, `proxy.ts`) and React 19
- TypeScript, Tailwind CSS v4, shadcn/ui on Base UI
- react-hook-form + zod, axios, sonner, lucide-react, motion, dayjs, use-debounce

Next.js 16 differs from older versions. Read the guide in `node_modules/next/dist/docs/` before using an API. Library and coding rules are in [.agents/AGENTS.md](.agents/AGENTS.md).

## Getting started

Requires Node 20 or later.

```bash
npm install
cp .env.example .env.local   # then fill in WP_ACCOUNT_SECRET
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `WP_URL` | server | WordPress origin. Defaults to `https://majeurs.com`; becomes `https://cms.majeurs.com` once WP moves behind the headless front. |
| `WP_ACCOUNT_SECRET` | server | Shared secret for the `majeurs/v1` endpoints (account, wishlist, forms). Must equal `MAJEURS_HEADLESS_SECRET` in `wp-config.php`. |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical site URL, e.g. `https://majeurs.com`. |

Only `NEXT_PUBLIC_` variables may be read in client components. `.env*` files are git-ignored, except `.env.example`. That file also lists the planned variables (`REVALIDATE_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`), which the code doesn't read yet.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run check:routes` | Requests every known WordPress URL against a running server and fails on anything unexpected (200 / redirect / 410). Set `BASE_URL=…` to test a preview. **Run before every deploy.** |

## Project layout

```
app/
  (shop)/        catalog, product pages, wishlist
  (commerce)/    cart, checkout, my-account
  (content)/     home and landing pages, blog, legal, confirmation pages
  (seo)/         Rank Math–named sitemaps, locations.kml
  (dev)/         /design-system reference page (not indexed; remove before launch if it shouldn't be public)
  api/           cart, products and wishlist route handlers (proxies to WordPress)
components/      UI grouped by area (layout, shop, product, blog, account, forms, ui …)
lib/
  api/           WordPress and WooCommerce Store API clients
  routes/        wpRoutes.ts: the source of truth for every URL, redirect and 410
  forms/         enquiry form definitions and the submit Server Action
  seo.ts         Rank Math head -> Next.js metadata
  currency.ts    rtsb_currency cookie helpers
proxy.ts         410s, WP search redirect, ?currency= links
docs/            design system, routes, implementation plan, WordPress snippets
```

Route groups like `(shop)` choose the layout for a page and don't change its URL.

## How it talks to WordPress

- **Products, cart and checkout** use the WooCommerce Store API (`/wp-json/wc/store/v1`). Show the top-level `price_html`: it carries ShopBuilder's currency conversion, and `prices.price` doesn't.
- **Currency** comes from the `rtsb_currency` cookie (NGN by default; USD, GBP, EUR). It is forwarded to WordPress and must be part of every cache key.
- **Pages and posts** use the WP REST API (`/wp-json/wp/v2`).
- **SEO** comes from Rank Math's headless endpoint, with each page's own metadata as the fallback.
- **Account, wishlist, enquiry forms, currency rates and product swatches** use custom `majeurs/v1` endpoints. They are WordPress snippets kept in [docs/wordpress/](docs/wordpress/). Install them in WP admin > Snippets. Each file's header explains its setup.

## URLs

`trailingSlash: true` is on, so URLs match WordPress exactly (`/product/<slug>/`). Add any new URL, redirect or removed page to `lib/routes/wpRoutes.ts` first. `next.config.ts` and `proxy.ts` read from it, and so does `check:routes`. [docs/ROUTES.md](docs/ROUTES.md) shows how each WordPress URL maps to a route.

## Docs

- [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md): decisions, phases, progress, data rules, SEO checklist
- [docs/ROUTES.md](docs/ROUTES.md): URL mapping and the route check
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md): tokens, fonts (licences to check before launch), logo
- [docs/wordpress/](docs/wordpress/): the WordPress snippets the front end depends on
