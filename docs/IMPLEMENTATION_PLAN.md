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

REVALIDATE_SECRET=...                    # shared with the WP revalidation hook
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_... # Stripe Payment Element at checkout (the gateway's active mode)
NEXT_PUBLIC_STRIPE_PMC_ID=pmc_...         # Stripe Payment Method Configuration (Optimized Checkout)
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
4. **Block the WP theme frontend for visitors** once everything is migrated. Redirect non-API, non-admin requests on `cms.majeurs.com` to `majeurs.com`, and keep `noindex`. Done on staging 1 Nov 2026: `docs/wordpress/majeurs-frontend-lock.php` (snippet "NextJS - Hide WordPress Front End").
   - Visitors to any WordPress page get a 302 to the same path on "Majeurs site URL". XML-RPC is off, and robots.txt disallows everything.
   - Still served: wp-admin, wp-login.php, `/wp-json/`, media, `/wc-api/` and `?wc-api=` (Paystack, Stripe webhooks), `?wc-ajax=` (Stripe 3-D Secure), admin-ajax and cron.
   - Logged-in editors still see WordPress (previews). So do requests with `X-Majeurs-Secret` (`npm run checkout:countries` sends `WP_ACCOUNT_SECRET`).
   - It switches itself off while WP and Next.js share a host, so it can't loop on live before the move to cms.majeurs.com.

## Cart and checkout (Phase 3)

- **Cart session.** The Store API returns a `Cart-Token` header. Keep it in an httpOnly cookie and send it on every cart call through `app/api/cart/[...path]/route.ts`. Mutations need the `Nonce` header from the previous response.
  - 31 Oct 2026: every Store API call (`storeRequest` in `lib/api/cart.ts`) forwards the visitor's currency as `Cookie: rtsb_currency=…`. ShopBuilder then answers with converted cart amounts and shipping rates, and the order is placed in that currency. Amounts are formatted in the cart's own currency; nothing is converted locally any more.
  - **Gotcha:** with any Cookie header, the Store API ignores the Cart-Token unless a `Nonce` comes with it. Without one, `GET /cart` answers an empty cart. So the Nonce is kept in an httpOnly cookie (`mj_cart_nonce`, reused for 10h) and sent on every call that forwards the currency.
  - The shopper's User-Agent and IP are forwarded, so orders record theirs rather than Vercel's.
- **Cart UI.** Cart page done (29 Oct 2026), including coupons (`/api/cart/coupons`) and "Order via WhatsApp" (the cart as a pre-filled message, `cartOrderMessage` in `lib/contact.ts`). **Coupons are switched off in WooCommerce on the live site** (Store API: "Coupons are disabled."); enable them under WooCommerce > Settings > General. Cart UX pass (29 Oct 2026): continue-shopping link, sticky summary with delivery / warranty / returns / help notes (from the live policy pages), product care tips (from /materials-and-care/), "Complete the Room" and "You Might Also Like" from the cart items' cross-sells and upsells (`getCartRecommendations`, `/api/products/recommendations`; falls back like the product page until `majeurs-product-extras.php` is installed), a mobile checkout bar, and an empty state with WhatsApp and wishlist links. Mini-cart drawer done (31 Oct 2026, `components/shop/miniCart.tsx`): opens from the header basket and the "added to your cart" toast.
- **Checkout** (built 31 Oct 2026; contracts read from the source of WooCommerce 11.2.1, Stripe Gateway 11.1.1 and woo-paystack 5.8.5).
  - **Page.** `/checkout/` (`components/checkout/`) has:
    - contact (email, plus the Mailchimp opt-in, checked by default as on WP)
    - Ship / Pickup
    - shipping address, then delivery options, which appear once the address can be priced (as on the block checkout)
    - billing address ("same as shipping", or a full billing address for pickup)
    - payment, an order note, and a sticky summary (collapsible on mobile)
  - **Address rules.** Address fields follow WooCommerce's per-country rules (Nigeria: no postcode; UK: optional county) from `lib/checkout/countryData.json`. Regenerate it with `npm run checkout:countries`. One zod schema (`lib/checkout/schema.ts`) validates in the browser and in the route.
  - **Placing the order.** `POST /api/checkout` sends the Store API `POST /checkout` with both addresses, `payment_method`, `payment_data`, `customer_note`, `expected_total` (refused if the price went up) and `extensions["mailchimp-newsletter"].optin`. Accounts aren't created at checkout: that breaks Stripe's 3-D Secure nonce and the guest thank-you lookup.
  - **Paystack.** Navigates to `payment_result.redirect_url`. Paystack returns the customer to WP's `/wc-api/WC_Gateway_Paystack/`, which verifies the payment and redirects to `/checkout/order-received/<id>/?key=…`. It only charges NGN, USD, ZAR, GHS, KES, XOF, EGP and RWF, so it's hidden for GBP and EUR. A failed start (WooCommerce may answer 500) shows "We couldn't start your payment".
  - **Stripe.** The Payment Element runs with deferred intents (`paymentMethodCreation: "manual"`, the gateway's PMC id). The browser creates a PaymentMethod and sends `payment_data` = `payment_method=stripe`, `wc-stripe-payment-method=pm_…`, `wc-stripe-new-payment-method=""`.
    - When the bank asks for 3-D Secure, the answer's `payment_details.redirect` is `#wc-stripe-confirm-pi:<order>:<secret>:<nonce>`. The page then runs `stripe.confirmPayment`, and `/api/checkout/stripe` calls WP's `?wc-ajax=wc_stripe_update_order_status` with that nonce.
    - Card payments are hidden until `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set.
  - **The cart after an order.** The Store API never empties the cart. `proxy.ts` forgets the cart cookies the first time this browser reaches its own order's order-received page (matched against `mj_order`; not on prefetches or old order links), as WooCommerce's thank-you page does. An abandoned payment keeps the cart, and a retry reuses the same pending order.
  - **Timeouts.** Store API writes and the Stripe confirm get 60s instead of 10s, because a gateway runs inside them. If one still times out, the customer is told not to order again (the order may have gone through), never "try again". Once Stripe reports a payment as taken, the customer always goes to order-received, even if WordPress couldn't be told; Stripe's webhook settles the order.
- **Order received** (`/checkout/order-received/<id>/?key=…`). Store API `GET /order/<id>?key=&billing_email=`. Guests must give the billing email, so it's kept from checkout in an httpOnly cookie (`mj_order`, with the order's currency). The page shows a message by status:
  - paid
  - on-hold (amount or currency mismatch)
  - pending ("confirming your payment")
  - failed (link to pay again)
  - another browser (generic thank-you)

  `/checkout/order-received/` with no id (Paystack couldn't verify) gets a generic page.
- **Pay for order** (`/checkout/order-pay/<id>/?pay_for_order=true&key=…`, from emails, my-account and failed payments). Store API `POST /checkout/<id>`. A browser that didn't place the order is asked for the billing email first (`/api/checkout/unlock`).
- **WordPress settings** (staging and live):
  - [x] WooCommerce > Settings > Payments > Paystack > Payment Option = **Redirect** (checked on staging 1 Nov 2026; check live). The default (popup) answers WP's own order-pay page.
  - [x] **Order emails didn't send on staging** (fixed 1 Nov 2026 with SMTP; the "Processing order" resend for #7475 was delivered). First Paystack test order (#7475, 1 Nov 2026): paid, `processing`, in NGN (so ShopBuilder does create orders in the visitor's currency), but both "Processing order" and "New order" failed with "Could not instantiate mail function". The server has no PHP mail and no SMTP plugin is installed. Install an SMTP plugin (e.g. FluentSMTP or WP Mail SMTP) with the mailbox or provider live uses, then send a test.
  - [x] SMTP on staging: FluentSMTP sending as `no-reply@majeurs.com` (1 Nov 2026).
  - [x] (Done on staging 1 Nov 2026; do the same on live) WooCommerce sender to match it: "From" address `no-reply@majeurs.com` (it's still `customerservice@majeursholdings.com`, another domain, which mail providers reject or mark as spam), with Reply-To `customerservice@majeursholdings.com` so replies reach customer care.
  - [x] (Staging 1 Nov 2026; copy to live) Order email copy: production takes **6 to 10 weeks per product** (`PRODUCTION_TIME` in `lib/contact.ts`, shown on order-received and in the cart). Add it under WooCommerce > Settings > Emails > Processing order (and On-hold order) > Additional content.
  - [ ] Stripe on staging is in **live mode with no test keys**. Turn on test mode with test keys before any Stripe test, then set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_) and `NEXT_PUBLIC_STRIPE_PMC_ID` on Vercel. Keep Adaptive Pricing off (it switches the gateway to Checkout Sessions).
  - [x] Install `docs/wordpress/majeurs-checkout.php`. Done on staging 1 Nov 2026 as snippet "NextJS - Checkout Links"; "Majeurs checkout sites" = `http://majeurs.local`, `https://majeurs.local`. Still to do on live. While WP and Next.js are on different hosts it points order-received, order-pay and cart links at the Next.js site, and allows Paystack's `wp_safe_redirect` to go there. Without it, staging's Paystack returns land on WP's own thank-you page. It also adds `GET /majeurs/v1/order-currency?id=&key=`, so a pay-for-order link opened in another browser shows the order's real currency.
    - Customers go back to the Next.js site they ordered on: every Store API write sends `X-Majeurs-Site` (the request's origin), and the snippet saves it on the order when it's allowed. Allowed: "Majeurs site URL", plus Settings > General > "Majeurs checkout sites" (one URL per line).
    - For local testing add `http://majeurs.local` there. Without it, a local test payment returns to "Majeurs site URL" (the Vercel site); without the snippet at all, it returns to api.majeurs.com.
  - [ ] Guest checkout stays on. The block checkout options (company hidden, phone optional) must match the form.
- **Cloudflare** (when /checkout moves to Next.js). Send these to WordPress, uncached and unchallenged, with bodies untouched:
  - any path containing `/wc-api/` and any query with `wc-api=`: the Paystack callback and webhook, and Stripe's webhook `?wc-api=wc_stripe`
  - `?wc-ajax=` on any path
  - `/checkout/order-received/*` when the query has `wc_payment_method=stripe`: Stripe's redirect-based returns, which WP settles before redirecting to the clean URL

  The server-to-server POSTs from Vercel to `/wp-json/wc/store/v1/*` and `/?wc-ajax=*` must pass the WAF (`X-Majeurs-Origin`).
- **Not done:** WooCommerce order attribution (`woocommerce/order-attribution`) and GTM `begin_checkout` / `purchase` events (SEO checklist).
- **Test on staging with Paystack and Stripe test keys** (needs the settings above; no test order has been placed yet):
  - NGN and one foreign currency. Confirm the order is created in the cookie's currency with ShopBuilder's amounts; the ShopBuilder Pro source isn't public.
  - Coupons
  - Pickup
  - Stripe 3-D Secure (card 4000 0027 6000 3184) and a decline
  - Paystack success, cancel (back to /cart/) and failure, then paying again from order-received
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
- [x] Enquiries admin per form (1 Nov 2026, `docs/wordpress/majeurs-forms.php`, installed on staging as "NextJS - Forms"). Each form is a page under wp-admin > Enquiries, with four tabs:
  - **Submissions:** search and date range, exported as CSV, Excel (.xlsx) or PDF (amounts show "NGN", since PDF's built-in fonts have no ₦). Viewing needs "read private posts" (Editors, Shop Managers, Admins).
  - **Notification email:** recipients, subject and body with placeholders (`{form}`, `{name}`, `{email}`, `{date}`, `{page}`, `{fields}`, `{attachments}`, `{field:key}`), plus "Send test email".
  - **Mailchimp:** that form's tags and field mapping.
  - **After submit:** pop-up message and reset, or a thank-you page. Each submission answers with this choice, so editors change it without a deploy. Quote and trade-program redirect to their existing pages; every other form defaults to the pop-up. A form set to redirect without its own page goes to `/thank-you/<form>/` (noindex), so analytics can track conversions by URL.

  Settings keeps the Mailchimp audience and the "Any other form" fallback. Enquiries saved before this change are still read; their export columns come from the saved answers. The catalogue form ignores redirect mode, because leaving the page would lose the download link.
- [x] Projects archive and single.
- [x] Gate: a full crawl shows no 404s (see Phase 1), and editors can update a page in wp-admin without a developer. Tested 30 Oct 2026: saving a field on staging updates majeurs-frontend.vercel.app within 5 seconds (save hook -> /api/revalidate/).

### Phase 3 · Cart + checkout (weeks 14–19)
- [x] Cart page, mini-cart, checkout, order-received and pay-for-order pages (31 Oct 2026; see "Cart and checkout" above).
- [ ] WordPress settings and Cloudflare routes listed in "Cart and checkout".
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
