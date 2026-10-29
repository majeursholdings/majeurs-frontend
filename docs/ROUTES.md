# Routes: every WordPress URL has a home

Captured from the live site on 27 Oct 2026, using the WP REST API (pages, posts, products, product categories and tags, blog categories, careers, projects), the Rank Math sitemaps and Rank Math › Redirections.

**Source of truth:** `lib/routes/wpRoutes.ts`. Add new URLs there first.

**Check:** with the dev server running, `npm run check:routes` (or `BASE_URL=… npm run check:routes`). It requests all 301 URLs and fails on anything unexpected:

- 184 URLs should return 200
- 77 legacy URLs should redirect
- 40 should return 410 Gone

Run it before every deploy.

## How the URLs map

| WP URLs | Next.js route |
| --- | --- |
| 40 pages: /about-majeurs-holdings/, /faqs/, /catalogue/check-your-inbox-for-catalogue/ … | One folder each, inside the route group for its page design (below). Route groups don't change the URL. |
| / | `app/(content)/(landing)/page.tsx` |
| /product/<slug>/ (73) | `app/(shop)/(product)/product/[slug]` |
| /product-category/<path>/ (19, incl. nested and /page/N/) | `app/(shop)/(catalog)/product-category/[...path]` |
| /product-tag/<slug>/ (18) | `app/(shop)/(catalog)/product-tag/[...path]` |
| /shop/page/N/ | `app/(shop)/(catalog)/shop/page/[page]` |
| /<post-slug>/ (10 blog posts at the root) | `app/(content)/(blog)/[slug]`. Static page folders win over it. |
| /blog/page/N/ | `app/(content)/(blog)/blog/page/[page]` |
| /category/<slug>/ (6 blog categories, incl. /page/N/) | `app/(content)/(blog)/category/[...path]` |
| /project/, /project/<slug>/ | `app/(content)/(landing)/project`, `…/project/[slug]` |
| /checkout/order-received/<id>/, /checkout/order-pay/<id>/ | `app/(commerce)/checkout/...` |
| /my-account/orders/, view-order/<id>/, edit-address/[billing\|shipping]/, edit-account/, lost-password/, customer-logout/ | `app/(commerce)/my-account/*` (one folder each) |
| /?s=keyword&post_type=product | `proxy.ts` 301 → `/search/?q=keyword` |
| ?currency=GBP&__rtsb_wpnonce=… | `proxy.ts` sets the `rtsb_currency` cookie and redirects to the clean URL |
| /sitemap_index.xml, /page-sitemap.xml, /product-sitemap.xml … | `app/(seo)/sitemap_index.xml` + `app/(seo)/sitemaps/[name]`. Same file names as Rank Math, so Search Console keeps working. |
| /locations.kml | `app/(seo)/locations.kml` |
| /robots.txt | `app/robots.ts` (the 26 Oct rules) |
| 31 Rank Math 301s, plus /compare/, Academy sub-pages, career posts, empty categories and tags | `next.config.ts` `redirects()` from `legacyRedirects` |
| 39 Rank Math 410s (old products, homewares, budget categories, /testimonials/) + /career-sitemap.xml | `proxy.ts` |

`trailingSlash: true` is set, so `/about-majeurs-holdings` → `/about-majeurs-holdings/` exactly as on WordPress.

Every page currently renders `<RoutePlaceholder>`, which shows the phase and links to the live WP page. Search for `RoutePlaceholder` to see what's left to build.

## Route groups = page designs

Each group has a `layout.tsx` with the shell that page type uses on WordPress. Header and footer are in the root layout.

| Group | Pages | Layout adds |
| --- | --- | --- |
| `(shop)/(catalog)` | /shop/, /product-category/…, /product-tag/…, /search/ | "Customize your furniture style" band + "Join the Inner Circle" signup. Pages use `<PageHero>` + `<CatalogShell>` (filter sidebar + results panel). |
| `(shop)/(product)` | /product/<slug>/ | Container for gallery + summary, then the product rails |
| `(shop)` | /wishlist/ (+ the two groups above) | Place for shop-wide providers (wishlist, quick view) |
| `(content)/(landing)` | Home and marketing pages: about, team, leadership, catalogue, showrooms, visitation, events, trade program, designers, developers, custom-made, quote, bespoke, Root & Reverence, Mande, care service, materials & care, warranty, FAQs, contact, complaint form, Academy and Careers intros, projects | Full-bleed: `<PageHero>` then stacked `<SectionWrapper>` bands |
| `(content)/(blog)` | /blog/, posts at /<slug>/, /category/… | Hero across the top, then content with the blog sidebar (search, featured, categories, Atunlo) |
| `(content)/(legal)` | shipping, refunds, privacy, cookies, terms | Narrow reading column with `prose-majeurs` |
| `(content)/(confirmation)` | catalogue, quote and trade-registration thank-you pages | Centred message + "Browse the shop" / "Back to home"; noindex |
| `(commerce)` | cart, checkout, order-received, order-pay, my-account | Container; noindex. `my-account/layout.tsx` adds the account tabs |

## To confirm (marked `permanent: false` in wpRoutes.ts)

- **Academy sub-pages** (student registration, waitlist, donate, hire a student, partner/sponsor) and **9 career posts** currently go to the intro pages. Point them at the portal URLs once those exist, then make them permanent.
- **Empty WP product categories** (3-seaters-2, 4-seaters-2, the-deal-collection, uncategorized) and the 8 internal `group-*` product tags go to /shop/.
- **/showrooms/, /events/, /bespoke-product/** are empty on the live site.
- **Rank Math lists 32 redirections, but only 31 were readable.** Check the last one in wp-admin.

## Not covered on purpose

- **Feeds** (/feed/, /<post>/feed/) and **author/date archives:** add a redirect to /blog/ if Search Console shows traffic to them.
- **WooCommerce endpoints** that stay in WordPress (`/wp-json/*`, `/wp-admin/*`, `?wc-ajax=*`): Cloudflare routes these to the WP origin (see IMPLEMENTATION_PLAN.md › Rollout).
