# majeurs.com headless rebuild: implementation plan

Next.js (this repo) is the public storefront. WordPress + WooCommerce stays as the backend and admin. The UI matches the current site. The full planning doc, with architecture diagrams, the SEO checklist and risks, is the Claude doc "Majeurs.com Headless Rebuild Plan". This file is the developer's working version.

## Decisions already made

- **Backend.** WordPress + WooCommerce stays at `cms.majeurs.com` (noindex). It keeps products, prices, stock, orders, payments (Paystack, Stripe), coupons, shipping zones, currency conversion (ShopBuilder), blog, page content, Rank Math SEO data and order emails.
- **No separate admin portal.** wp-admin stays the admin. The backend work is: ACF field groups for page content, a wishlist endpoint, and a revalidation hook (all below).
- **Checkout is rebuilt in Next.js** on the WooCommerce Store API, full payment only.
- **Out of scope:**
  - The 80/20 deposit, until the backend itself is migrated.
  - Product compare.
  - The Tawk.to live chat.
  - Academy and Careers, which move to their own portals. This site keeps one intro page each (`/majeurs-furniture-academy/`, `/career/`) linking out, and the old sub-pages and job posts get 301s.
- **Wishlist is kept.**
- **URLs stay exactly the same:** `/product/<slug>/`, `/product-category/<path>/`, `/<post-slug>/`, `/<page-slug>/`, with trailing slashes.

## Done (27 Oct 2026)

- [x] Design system: tokens, type scale, `btn`, `eyebrow` and `container-site` utilities in `app/globals.css`. See `docs/DESIGN_SYSTEM.md`.
- [x] Brand fonts via `next/font/local` (`app/fonts.ts`). Licensing still needs checking; see DESIGN_SYSTEM.md.
- [x] Logo (`<Logo />`), favicon, icon and apple-icon.
- [x] `lib/utils.ts` `cn()` (clsx + tailwind-merge installed).
- [x] `/design-system` reference page.
- [x] A route for every WP URL: placeholders, redirects, 410s, sitemaps, robots and `npm run check:routes`. See `docs/ROUTES.md`.
- [x] Header (top bar, sticky bar, Shop mega menu, search panel, currency switcher, mobile full-screen menu) and footer, matching WP. Route-group layouts per page design (catalog, product, landing, blog, legal, confirmation, commerce, account).

## Next.js 16 notes for this repo

- Read `node_modules/next/dist/docs/` before using an API. This version differs from older Next.js.
- `cacheComponents: true` is on. Cache data with `"use cache"` + `cacheTag()` + `cacheLife()`, and invalidate with `revalidateTag(tag, "max")`. The two-argument form is required; the one-argument form is deprecated.
- Middleware is now `proxy.ts` (project root).
- Follow `.agents/AGENTS.md`: axios for HTTP, react-hook-form + zod for forms, sonner for toasts, lucide-react for icons, motion for animation, dayjs for dates, use-debounce for search. Never use `useEffect`.

## Environment variables

Template: `.env.example` (copy to `.env.local`).

```
# public
NEXT_PUBLIC_SITE_URL=https://majeurs.com

# server only
WP_URL=https://cms.majeurs.com   # lib/api/wp.ts; defaults to https://majeurs.com until WP moves to cms.
WP_ACCOUNT_SECRET=...            # = MAJEURS_HEADLESS_SECRET in wp-config.php (docs/wordpress/majeurs-account.php). Also covers wishlist and enquiry forms.
WP_UPLOAD_USER=...               # Author-role WP user for form file uploads (lib/api/media.ts)
WP_UPLOAD_APP_PASSWORD=...       # its Application Password (Users > Profile > Application Passwords)

# planned, not read by the code yet
REVALIDATE_SECRET=...                    # shared with the WP revalidation hook
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_... # Stripe Payment Element at checkout
```

Never read non-`NEXT_PUBLIC_` variables in client components. The wishlist uses `WP_ACCOUNT_SECRET` (it is part of `majeurs-account.php`), so there is no separate wishlist secret.

## Suggested structure

```
app/
  (shop)/shop/page.tsx
  (shop)/product-category/[...path]/page.tsx
  (shop)/product/[slug]/page.tsx
  (content)/[slug]/page.tsx              # pages + blog posts (resolve by slug)
  (content)/blog/page.tsx
  (content)/category/[slug]/page.tsx
  cart/page.tsx
  checkout/page.tsx
  checkout/order-received/[id]/page.tsx
  api/revalidate/route.ts
  api/cart/[...path]/route.ts            # proxy to Store API, keeps Cart-Token in an httpOnly cookie
  sitemap.ts, robots.ts
lib/
  api/client.ts                          # axios instance: baseURL WP_URL, timeout, interceptors, error normaliser
  api/wordpress.ts                       # pages, posts, menus, ACF, Rank Math head
  api/store.ts                           # WC Store API: products, categories, cart, checkout
  api/types.ts
  currency.ts                            # rtsb_currency cookie helpers
  seo.ts                                 # Rank Math head -> Metadata
components/
  layout/header.tsx, footer.tsx, megaMenu.tsx, mobileMenu.tsx, searchPanel.tsx, currencySwitcher.tsx
  product/productCard.tsx, gallery.tsx, swatches.tsx, relatedVariants.tsx, addToCart.tsx
  cart/miniCart.tsx, cartLine.tsx
  checkout/…
```

## Data layer rules

- **Products and prices:** `GET /wp-json/wc/store/v1/products`. For the price customers see, use the **top-level `price_html`**, which reflects ShopBuilder's currency conversion. `prices.price` is pre-conversion and gives wrong numbers.
- **Currency:** prices depend on the `rtsb_currency` cookie (NGN default; GBP, USD, EUR …). Server components read it with `cookies()` and forward it as `Cookie: rtsb_currency=XXX` to WordPress. Include the currency in every cache key and tag, e.g. `cacheTag("product:" + slug, "currency:" + cur)`. The switcher sets the cookie and calls `router.refresh()`.
- **Pages and posts:** `GET /wp-json/wp/v2/pages?slug=…` and `/posts?slug=…&_embed`, with ACF fields exposed via REST (ACF → field group → "Show in REST API").
- **SEO:** in Rank Math, enable **General Settings → Others → Headless CMS Support**, then call `GET /wp-json/rankmath/v1/getHead?url=https://majeurs.com/<path>/`. Parse it into `generateMetadata` (title, description, canonical, robots, OG) and render the JSON-LD `<script>` in the page.
- **Cache tags:**
  - `product:<slug>`, `product-list`
  - `category:<slug>`
  - `page:<slug>`, `post:<slug>`, `post-list`
  - `menu:<location>`

## WordPress side (small mu-plugin, `wp-content/mu-plugins/majeurs-headless.php`)

1. **Revalidation.** On `save_post`, `woocommerce_update_product`, `edited_product_cat` and `wp_update_nav_menu`, POST to `https://majeurs.com/api/revalidate` with `{ secret, tags: [...] }`. The route calls `revalidateTag(tag, "max")` for each tag.
2. **Wishlist endpoint.** Built into `docs/wordpress/majeurs-account.php` (same secret + session auth as the account routes): `GET|POST /wp-json/majeurs/v1/account/wishlist`, `DELETE …/wishlist/<id>`, product IDs in user meta (`_majeurs_wishlist`). Next.js proxies it at `/api/wishlist`. Guests use `localStorage`; the list merges into the account on login and is cleared from the browser on logout. Wishlists saved with ShopBuilder on the old site are not imported.
3. **CORS** for `https://majeurs.com` on the Store API (needed only for client-side Store API calls; server-side calls don't need it).
4. **Block the WP theme frontend for visitors** once everything is migrated. Redirect non-API, non-admin requests on `cms.majeurs.com` to `majeurs.com`, and keep `noindex`.

## Cart and checkout (Phase 3)

- **Cart session.** The Store API returns a `Cart-Token` header. Keep it in an httpOnly cookie and send it on every cart call through `app/api/cart/[...path]/route.ts`. Mutations need the `Nonce` header from the previous response.
- **Cart UI.** Cart page done (29 Oct 2026), including coupons (`/api/cart/coupons`) and "Order via WhatsApp" (the cart as a pre-filled message, `cartOrderMessage` in `lib/contact.ts`). **Coupons are switched off in WooCommerce on the live site** (Store API: "Coupons are disabled."); enable them under WooCommerce > Settings > General. Cart UX pass (29 Oct 2026): continue-shopping link, sticky summary with delivery / warranty / returns / help notes (from the live policy pages), product care tips (from /materials-and-care/), "Complete the Room" and "You Might Also Like" from the cart items' cross-sells and upsells (`getCartRecommendations`, `/api/products/recommendations`; falls back like the product page until `majeurs-product-extras.php` is installed), a mobile checkout bar, and an empty state with WhatsApp and wishlist links. Mini-cart drawer still to do.
- **Checkout.** Use `POST /wc/store/v1/checkout` with `billing_address`, `shipping_address`, `payment_method` and `payment_data`.
  - **Paystack** returns `payment_result.redirect_url`. Redirect to it; Paystack returns the customer to the order-received URL.
  - **Stripe** needs Stripe.js / Payment Element in Next.js, with the payment method ID sent in `payment_data`. Confirm the exact keys for the installed WooCommerce Stripe Gateway version on staging.
  - **Shipping** is hidden until the address is entered, as on the current block checkout. Lagos Island showroom pickup is an option.
- **Order received.** Read the order back with the order key and show the thank-you page.
- **Test on staging with Paystack and Stripe test keys:**
  - NGN and one foreign currency
  - Coupons
  - Pickup
  - Order emails, stock reduction and Mailchimp events

## Rollout: route-by-route behind Cloudflare

majeurs.com already sits behind Cloudflare. Use a **Cloudflare Worker (or Origin Rules) to route paths**:

- Migrated paths go to the Next.js host.
- Everything else goes to the WordPress origin.

WordPress keeps its current domain for unmigrated pages until the end, so there's no proxy loop through Next.js and no change to the WordPress `home` URL mid-project. When everything is migrated, move wp-admin and the APIs to `cms.majeurs.com` and point all of majeurs.com at Next.js.

## Phases

### Phase 0 · Setup (weeks 1–2)
- [ ] Staging WP clone at `api.majeurs.com` (page IDs match live). Paystack is in test mode. **Stripe is in live mode with no test keys**: add Stripe test keys and switch it to test mode (WooCommerce > Settings > Payments > Stripe) before anyone tests checkout on staging.
- [x] HTTP client (30 Oct 2026): kept `fetch` instead of axios, hardened in `wpFetch` (`lib/api/wp.ts`): 10s timeout per attempt, GET/HEAD retried twice on network errors, timeouts and 5xx (never writes), at most `WP_MAX_CONCURRENCY` (default 6) parallel WP requests per process, and a typed `WpError` from every data module. Builds no longer fail when staging answers 500 under prerender load.
- [x] Rank Math headless support is on (staging). ACF fields are exposed in REST by the generated field groups (`docs/wordpress/majeurs-content.php`, Phase 2).
- [x] Baseline SEO crawl (30 Oct 2026): `docs/seo-baseline/majeurs.com.json`, 158 sitemap URLs (status, title, description, robots, canonical, og:url, H1, JSON-LD types, Product offers). `npm run seo:snapshot -- <site> <out.json> [--paths-from <baseline>]` and `npm run seo:compare -- <a.json> <b.json>`. GSC export of top pages still to do (needs Search Console access).
- [x] Hosting: Vercel (`majeurs-frontend`), with preview deployments per branch.

### Phase 1 · Shop + products (weeks 3–8) → first go-live
- [x] Currency switcher: rates from `majeurs-currencies.php` when installed, else read back from the Store API's converted `price_html` (lib/api/currency.ts), so USD/NGN/GBP/EUR all work today. 30 Oct 2026: the snippet now finds ShopBuilder's rates (`currency_options[]`, `title` + `currency_rate`), so prices match WP to the cent in every currency.
- [x] Header data: cart count, live search results (`/api/search/suggestions`) and mega-menu products, all from the Store API.
- [x] Header and footer UI.
- [x] Home (new products and latest posts from WP).
- [x] `/shop/`, `/product-category/...`, `/product-tag/...` and `/search/` (29 Oct 2026) with:
  - Filters: category links, price buckets in the visitor's currency, materials (`pa_material`, with counts from the Store API collection data). Kept in the URL with WooCommerce's names (`?min_price=&max_price=&filter_material=a,b`), see `lib/shopFilters.ts`
  - Sort
  - Pagination (keeps sort and filters)
- [x] Product page UI and data (28 Oct 2026). Install `docs/wordpress/majeurs-product-extras.php` for colour/material swatches and the cross-sell/upsell rails; without it swatches show as text buttons and the rails fall back to category products. Rank Math head wired (see SEO checklist).
  - 30 Oct 2026: a product whose variation shares its slug (Amara and 4 others) now loads the parent product, not the variation. Variable products output a schema.org `ProductGroup` with one Product + Offer per variation (as Rank Math does on the WP theme; its headless `getHead` only returns a plain Product).
- [x] Product page "Related variants" (30 Oct 2026, `components/product/relatedVariants.tsx`): the other versions of a design as small tiles under the buy buttons. WooCommerce upsells (Product data > Linked products > Upsells), else products in the same category. "Complete the Room" stays on cross-sells; "You Might Also Like" is the rest of the category.
- [x] Wishlist: localStorage for guests, synced to the account when signed in (needs the updated `majeurs-account.php`).
- [x] Gate before go-live (checked 30 Oct 2026 against staging data):
  - Baseline vs Next.js (`npm run seo:compare`): titles and descriptions match once staging's site name is set back to "Majeurs Holdings" (staging says "Majeurs API", which is in 69 titles); canonicals all self-referencing; robots differ only because staging is noindex. Schema: Product pages now ProductGroup like live; the Elementor accordion's FAQPage ("Description", "Specifications" as questions) is deliberately not carried over.
  - Prices: NGN, USD, GBP and EUR match WP's `price_html` exactly (checked on 4 products, simple and variable).
  - Lighthouse mobile (simulated throttling) on the Vercel deployment: home 88, product 86, blog 87, about 89, shop 81, sofas category 80. The archives' LCP was a lazy-loaded first-row product image; with it loading eagerly a local production build scores shop 84, sofas 83 (LCP load delay 3 s → 0).
  - No 404s: every internal link on the 158 baseline pages resolves.
  - Still before go-live: point `WP_URL` at the live WordPress (not staging, which sends noindex) and set `NEXT_PUBLIC_SITE_URL=https://majeurs.com`.

### Phase 2 · Content (weeks 9–13)
- [x] Blog index (9 per page), posts and category archives, blog search (`/search/?q=…&type=post`), comments (28 Oct 2026). Posting comments needs `docs/wordpress/majeurs-account.php` installed. Rank Math head wired (see SEO checklist).
- [x] Editable page copy (30 Oct 2026). Every page's copy, images and buttons come from fields in wp-admin, with today's copy as the default:
  - Each page declares its fields once in `lib/content/pages/<id>.ts` (field builders in `lib/content/model.ts`); copy shared by many pages ("Customize your furniture style" and "Shop Now" bands, "Need help?" strip) and the `/project/` archive intro are in `lib/content/site.ts` (wp-admin > Site content).
  - Pages read them with `getPageContent()` / `getSiteContent()` (`lib/content/get.ts`), cached and tagged `page:<slug>` / `site-content`. A field WordPress never saved falls back to the default; one an editor cleared stays empty.
  - `npm run content:acf` generates the field groups into `docs/wordpress/majeurs-content.php` (33 pages + 4 Site content sections). The same snippet adds the import endpoint and the cache-refresh hook.
  - Needs **Secure Custom Fields** (free; repeaters) on WordPress instead of free ACF, then the snippet, then `npm run content:seed` to copy the defaults in. `npm run content:status` shows what each page has saved. Done on staging (30 Oct 2026): SCF 6.9.7 active (ACF deactivated), snippet "NextJS - Page Content and Cache Refresh" installed, all 33 pages and 4 sections seeded; pages render the same from WordPress as from the defaults (images now point at the original media library files instead of resized copies and Elementor crops).
  - SCF answers "" / false both for a field never saved and one an editor cleared, so an empty field shows the default. A field whose default is empty ("last updated", optional buttons) stays hidden when empty.
  - After adding fields to a definition: `npm run content:acf`, update the snippet in wp-admin > Snippets, then `npm run content:seed` (fills only fields never saved).
  - Saving in wp-admin calls `/api/revalidate/` (needs `REVALIDATE_SECRET` on Vercel and the same value in Settings > General > "Majeurs revalidate secret", plus "Majeurs site URL"), so edits show on the next load.
  - Kept in code on purpose: form fields and validation, SEO metadata (Rank Math), WordPress-driven lists (products, posts, projects, jobs), contact numbers in `lib/contact.ts`, icons picked by position.
- [x] Pages built (30 Oct 2026): Our Team, Events (editable list with an empty state; the live page is empty), Mande, For Developers and Bespoke Collections for Interior Designers (one shared layout), For Interior Designers (real images replace the live placeholders), the five policy pages (one template; the cookie policy is empty on live too, so it's empty here until written), and the three thank-you pages. Fixed while porting: leftover template copy on the developer/designer pages, a free-delivery claim that contradicted the shipping policy, the refund policy's placeholder phone line, Mande buttons that pointed at missing anchors (now mande.com.ng), and `#` buttons (now the catalogue and quote pages).
- [x] Academy and Careers: built as full pages here (Academy page; careers list + job pages from the WP `career` post type), not portal intros. The Academy sub-pages redirect to `/majeurs-furniture-academy/` until the portal exists.
- [x] Enquiry forms (visitation, custom request, quote, repair, trade application): `lib/forms/enquiries.ts` (fields, options, zod) + `submitEnquiryAction` (`lib/forms/submit.ts`) + `<EnquiryForm>`. Files go to WP media (`lib/api/media.ts`), then the enquiry to `docs/wordpress/majeurs-forms.php`, which keeps it under wp-admin > Enquiries, emails it and adds the visitor to Mailchimp (29 Oct 2026). Recipients, Mailchimp tags and Mailchimp field mapping per form, plus the audience, are set in wp-admin > Enquiries > Settings. The Mailchimp API key comes from the Mailchimp for WooCommerce plugin (else Elementor's integration key, or `MAJEURS_MAILCHIMP_API_KEY` in wp-config.php). Contacts are added as non-subscribed with the form's tags; the "Keep me updated" checkbox (all forms except complaint and job application) subscribes them. Spam: honeypot plus reCAPTCHA v3 (`lib/recaptcha/`, 29 Oct 2026) on every public form (enquiries, catalogue, complaint, comments, login, register, lost/reset password), score threshold `RECAPTCHA_MIN_SCORE`. A score below it shows the v2 "I'm not a robot" checkbox (`useRecaptcha` in `components/common/recaptchaChallenge.tsx`) when the v2 keys are set. Uploads: up to 4 files of 5MB (Server Action body limit 21MB; on Vercel, function bodies cap at 4.5MB, so move to signed uploads there).
- [x] Contact and complaint forms on the same pipeline.
- [x] Projects archive and single.
- [ ] Gate: a full crawl shows no 404s (done, see Phase 1), and editors can update a page in wp-admin without a developer. Tested on staging: editing a field saves to WordPress and shows on the page once its cache tag is revalidated. Left: add `REVALIDATE_SECRET` on Vercel (same value as staging's Settings > General > "Majeurs revalidate secret"), deploy, and save a page in wp-admin to see the hook refresh the Vercel site.

### Phase 3 · Cart + checkout (weeks 14–19)
- [ ] Everything in "Cart and checkout" above.
- [ ] Gate: test orders pass end to end on staging.

### Phase 4 · My account in Next.js (built 28 Oct 2026, needs WP setup)
- [x] Dashboard, orders (paginated), view order, addresses, account details, login, register, lost/reset password, logout. Data via `docs/wordpress/majeurs-account.php` (token sessions, httpOnly `mj_session` cookie).
- [ ] Install the snippet, set `MAJEURS_HEADLESS_SECRET` / `WP_ACCOUNT_SECRET`, and test on staging (incl. the reset-password email link).
- [ ] Link the signed-in session to the Store API cart (orders placed in Next.js checkout are still guest orders).
- [ ] Mailchimp "Subscribe to our newsletter" on register (dropped for now).
- [ ] Orders, addresses, account details, wishlist. Until then `/my-account/` stays on WooCommerce with restyling.

## SEO migration checklist (short)

- [ ] Keep every URL. Copy all Rank Math redirects (including the variant-split 301s and `/home/` → `/`) into `next.config.ts` `redirects()`.
- [x] Render the Rank Math title, description, canonical, robots, OG and JSON-LD on every page (29 Oct 2026): `seoMetadata(path, fallback, force?)` in `lib/seo.ts` for `generateMetadata`, `<SeoSchema path fallback? />` for JSON-LD. Each page's own metadata (and the hand-built product, post and job schema) is the fallback.
  - [ ] **Turn it on:** Rank Math > General Settings > Others > Headless CMS Support. Today `/wp-json/rankmath/v1/getHead` answers `rest_no_route`, so every page uses its fallback. Heads are cached an hour (tag `seo`, or `seo:<path>`); a failed lookup is retried after a minute.
  - [ ] Once on, compare a sample of pages with the baseline crawl (title, description, canonical, schema).
- [ ] `app/sitemap.ts` built from WP data, excluding Academy and Careers sub-pages, `/home/`, cart, checkout, account, wishlist and compare.
- [ ] `app/robots.ts` with the 26 Oct rules: disallow `?currency=`, `&currency=` and `__rtsb_wpnonce=`, and block Reflectionbot.
- [ ] GTM (GA4 + Meta pixel) with e-commerce events (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`).
- [ ] On launch: re-crawl, compare with the baseline, resubmit the sitemap, then watch GSC weekly for 4 weeks.

## Known live-site issues not to carry over (from the 27 Oct screenshots)

- Showrooms, Events and Bespoke Product pages are empty. Build them properly or drop them.
- FAQ: the sticky sidebar overlaps the answers on mobile, and the "Where are you located?" answer contains Academy text.
- Cart: the cross-sell titles overlap on mobile.
- My account: the tabs overflow on mobile.
- For Interior Designers: placeholder catalogue images.

## Open questions

- [ ] Who builds it, and how many developers? The estimates assume 1–2.
- [ ] Next.js hosting (Vercel or a Node host).
- [ ] Academy and Careers portal URLs and launch dates, needed for the 301s.
- [ ] Where form submissions go.
- [ ] Font licences (Nordique Pro web licence; Helvetica Neue web licence).
- [ ] Whether to share components or a backend with Mande later.
