# Go-live plan: serve majeurs.com from Next.js

Started 8 Nov 2026. This is the working checklist for moving majeurs.com from the Elementor WordPress site to this Next.js site. Tick a task when it's done and checked, and add the date. The background is in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and the [edge-router README](../cloudflare/edge-router/README.md).

## Where things stand (8 Nov 2026)

| | Host | State |
| --- | --- | --- |
| Public site | majeurs.com | The old WordPress + Elementor site (LiteSpeed Cache, Cloudflare). Real orders, customers and stock. |
| Next.js site | majeurs-frontend.vercel.app | Every page is built. It reads from staging. |
| Staging WordPress | api.majeurs.com | Has every `docs/wordpress/*.php` snippet, the content fields (filled), SMTP and Rank Math headless. Elementor layouts were removed on 8 Nov (backup in `../wp-backups/`). |
| Edge router | `cloudflare/edge-router/` | Built, **not deployed**. Routes only shop + commerce paths today. |

## Decisions

- [x] **D1. Backend = the live WordPress at majeurs.com** (agreed 8 Nov 2026). It holds the real orders, customers, stock and payment setup. api.majeurs.com stays as staging. *Consequence:* everything set up on staging is repeated on live (phase B).
- [x] **D2. The site lives on majeurs.com, routed by the Cloudflare Worker, with WordPress staying on majeurs.com as the backend** (agreed 8 Nov 2026). The Worker sends every public page to Next.js and passes WordPress's own paths to WordPress. WordPress's URLs don't change, so media, email links and payment webhooks keep working. Rollback is one command. Moving WordPress to `cms.majeurs.com` becomes an optional later step (G4).
- [x] **D3. Launch everything at once**, not shop-first (agreed 8 Nov 2026). All pages are built and working, and running half the site on each system would mean two headers, two carts and two sets of caches.
- [ ] **D4. Launch date and time:** ________ (a quiet hour; tell customer care beforehand).

## A. Finish testing on staging (api.majeurs.com)

- [ ] **A1.** Put Stripe on staging in **test mode** with test keys (it's in live mode now). Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_) and `NEXT_PUBLIC_STRIPE_PMC_ID` on Vercel **Preview**. Keep Adaptive Pricing off.
- [ ] **A2.** Test orders, in NGN and in one foreign currency (USD or GBP):
  - [ ] Paystack: success, cancel (back to /cart/), failure, then paying again from order-received
  - [ ] Stripe: plain card, 3-D Secure (4000 0027 6000 3184), declined card
  - [ ] a coupon
  - [ ] pickup
  - [ ] a signed-in customer (the order shows in My account → Orders)
- [ ] **A3.** For those orders, check:
  - [ ] the order emails arrive (customer + "New order")
  - [ ] stock goes down
  - [ ] wp-admin shows the order's source (order attribution)
  - [ ] the `purchase` event reaches GA4 and Meta
- [ ] **A4.** Submit every form (quote, visitation, repair, trade program, catalogue, complaint, newsletter, Root and Reverence waitlist) and confirm each arrives where it should.
- [ ] **A5.** My account: register, log in and out, reset a password from the email link, edit an address, wishlist.
- [ ] **A6.** `npm run check:routes` passes (no 404s or 5xx on any known URL).
- [ ] **A7.** `npm run seo:snapshot` + `npm run seo:compare` on a warm cache: titles, canonicals and descriptions match the baseline.
- [ ] **A8.** Read through every page on mobile and desktop, checking copy, images and broken links.

**Gate A:** every box above ticked.

## B. Set up the live WordPress (majeurs.com)

Do these in order. None of them changes what visitors see on majeurs.com, so they can be done before launch day.

- [x] **B1.** (10 Nov 2026) Take a **full backup** of live (database and files) on the host, and confirm it can be restored.
- [x] **B2.** (10 Nov 2026) Check the plugins: Secure Custom Fields (or ACF Pro, for the repeater fields) and Code Snippets are active. Live had free ACF 6.8.11 (no repeaters): installed Secure Custom Fields, deactivated ACF; the career/journal/project post types survived. **Keep Elementor, ShopBuilder and ShopBuilder Pro active.** ShopBuilder Pro converts currencies for the Next.js site and needs Elementor.
- [x] **B3.** (10 Nov 2026, from the repo files via the Code Snippets REST API) Add the snippets from `docs/wordpress/` (paste each without the opening `<?php`, "Run snippet everywhere", Activate), using the same names as on staging:
  - [x] `majeurs-content.php` → "NextJS - Page Content and Cache Refresh"
  - [x] `majeurs-account.php` → "NextJS - Account, Wishlist and Comments"
  - [x] `majeurs-checkout.php` → "NextJS - Checkout Links"
  - [x] `majeurs-forms.php` → "NextJS - Forms"
  - [x] `majeurs-product-extras.php` → "NextJS - Products Extra"
  - [x] `majeurs-currencies.php` → "NextJS - Exchange Rates"
  - Not yet: `majeurs-frontend-lock.php`. It switches itself off while WordPress and Next.js share majeurs.com, and is only needed for G4.
- [x] **B4.** (10 Nov 2026) Settings:
  - [x] (10 Nov 2026) Settings → General: "Majeurs site URL" = `https://majeurs.com`, "Majeurs revalidate secret" = the production `REVALIDATE_SECRET`, "Majeurs checkout sites" = `https://majeurs.com`
  - [x] (10 Nov 2026, checked: a wrong secret gets 403, the production one reaches the login check) `wp-config.php`: `MAJEURS_HEADLESS_SECRET` = the production `WP_ACCOUNT_SECRET`
- [x] **B5.** (10 Nov 2026) Check that `GET https://majeurs.com/wp-json/majeurs/v1/content/site` and `/wp-json/majeurs/v1/currencies` answer 200.
- [x] **B6.** (10 Nov 2026) Page content:
  - [x] (10 Nov 2026, all 37 pages and sections, no missing images) Run `npm run content:seed` against live (`WP_URL=https://majeurs.com`, live admin application password). Fix any `missing_images` by uploading them to live's Media Library.
  - [x] (10 Nov 2026) Copy every field edited on staging. Only two were real edits: the home Root and Reverence image and the contact page's UK address (en dash). The other staging differences were the old copy seeded before the landing pages were rewritten, so live keeps the new defaults. (e.g. the new Root and Reverence image on the home page). Upload new images to live first. (To do: a script that copies changed fields from staging to live.)
  - [x] (10 Nov 2026) Check `npm run content:status` against live.
- [ ] **B7.** WooCommerce, copied from staging:
  - [x] (10 Nov 2026) Payments → Paystack → Payment Option = **Redirect**
  - [x] (10 Nov 2026: WooCommerce From = Majeurs Holdings <no-reply@majeurs.com>, Reply-To = Majeurs Customer Service <customerservice@majeursholdings.com>. The SMTP server rejects any From outside majeurs.com: "domain majeursholdings.com is not allowed in header From". GoSMTP's own From must also be no-reply@majeurs.com, because the form emails and WordPress's own emails use it.) SMTP: **GoSMTP Pro** installed on live (10 Nov 2026) instead of FluentSMTP; connected 10 Nov 2026; fixed and re-tested the same day (WooCommerce reset email sent in 1.4s). Earlier, **a test email (WooCommerce reset password) hung WordPress past Cloudflare's 100s timeout (524)**: the SMTP connection doesn't complete. Fix before launch, or every order email stalls checkout. Sending as `no-reply@majeurs.com`. WooCommerce "From" = `no-reply@majeurs.com`, Reply-To = `customerservice@majeursholdings.com`. Send a test email.
  - [x] (10 Nov 2026, copied word for word from staging) Emails → Processing order and On-hold order → Additional content: production takes 6 to 10 weeks per product
  - [x] (10 Nov 2026) Coupons on (General → enable coupons)
  - [ ] Guest checkout on. Block checkout: company hidden, phone and apartment optional. Check with `npm run checkout:countries` against live. (10 Nov 2026: WooCommerce general and account settings, including selling/shipping countries and guest checkout, match staging, so `countryData.json` stands. The script can't read live, because ShopBuilder's Elementor checkout template replaces the block checkout there. **Still to check by hand:** Appearance → Customize → WooCommerce → Checkout: Company = Hidden, Address line 2 = Optional, Phone = Optional.)
- [x] **B8.** (10 Nov 2026) Rank Math → General Settings → Others → **Headless CMS Support** on. `/wp-json/rankmath/v1/getHead` answers.
- [x] **B9.** (10 Nov 2026: resolved by removing LiteSpeed Cache now, see F5) **Found 10 Nov 2026: LiteSpeed caches `/wp-json/majeurs/v1/content/site` and `/currencies` (`x-litespeed-cache: hit`, served an empty pre-seed answer). Add `/wp-json/` to Do Not Cache URIs, then Purge All.** LiteSpeed Cache: keep it until launch, because it's what makes the current public site fast. Until then, confirm `/wp-json/` is never cached (the Store API already answers `no-cache`; check `/wp-json/wp/v2/pages/…` and `/wp-json/majeurs/v1/…` too), and add `/wp-json/` to LiteSpeed's "Do Not Cache URIs" if not. It's removed after launch (F5).
- [x] **B10.** (10 Nov 2026, the `CronJobs` administrator for both for now; give uploads a low-privilege Author user later) Create the Next.js server user's application passwords on live (`WP_ADMIN_*`, `WP_UPLOAD_*`).
- [ ] **B11.** Point Next.js at live from a **Vercel Preview** deployment (`WP_URL=https://majeurs.com`) and browse it: pages show live's content, prices and stock. Place no orders here; that waits for launch day.

**Gate B:** the Preview deployment on live data looks right on every page type (home, category, product, cart, a landing page, blog post, legal page).

## C. Vercel production

- [ ] **C1.** Production environment variables:
  - [ ] `NEXT_PUBLIC_SITE_URL=https://majeurs.com`
  - [ ] `WP_URL=https://majeurs.com`
  - [ ] `REVALIDATE_SECRET`, `WP_ACCOUNT_SECRET`, `WP_ORIGIN_TOKEN`, `WP_ADMIN_*`, `WP_UPLOAD_*` matching live (B4, B10)
  - [ ] Stripe **live** keys: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PMC_ID`
  - [ ] reCAPTCHA keys valid for majeurs.com
  - [ ] `WP_MAX_CONCURRENCY=3`. A build against live WordPress (no LiteSpeed now) timed out on a career page with the default 6 on 10 Nov 2026; 3 built cleanly.
  - [x] `NEXT_PUBLIC_GOOGLE_TAG_ID`, `NEXT_PUBLIC_META_PIXEL_ID` (set 2 Nov 2026)
- [ ] **C2.** Deployment Protection **off** for Production.
- [ ] **C3.** The Vercel plan allows commercial use (Pro) and its limits cover the traffic.
- [ ] **C4.** Redeploy Production. Smoke-test on majeurs-frontend.vercel.app: home, a product, add to cart, checkout page loads (no order).

## D. Cloudflare edge router

- [x] **D5.** (8 Nov 2026) The Worker now routes **everything** to Next.js except WordPress's own requests: `/wp-admin/`, `/wp-json/`, `/wp-content/`, `/wp-includes/`, `/.well-known/`, the root `/wp-*.php` files and `/xmlrpc.php`, any `/wc-api/`, `wc-api=`, `wc-ajax=`, `rest_route=` or `LSCWP_CTRL=` request, and Stripe's `order-received?wc_payment_method=stripe` return. One route, `majeurs.com/*`; the list is `staysOnWordPress` in `src/routes.ts`.
- [x] **D6.** (8 Nov 2026) `npm test` (4 tests) and `npm run deploy:dry` pass.
- [ ] **D7.** `/robots.txt`, `/sitemap_index.xml` and every `*-sitemap.xml` go to Next.js. WordPress's own robots.txt would block crawlers once the front-end lock is on.
- [ ] **D8.** WAF rule 1 skips the Next.js server (`X-Majeurs-Origin`) and the payment webhooks (`/wc-api/`, `wc-api=`). Check that no other rule challenges the Vercel server's calls to `/wp-json/` and `?wc-ajax=`.
- [ ] **D9.** Workers plan: every request now passes through the Worker. Check the daily request count against the free tier, or move to Workers Paid.
- [ ] **D10.** Sign in to the `cf` CLI on the account that owns the majeurs.com zone (`cf auth login`).

## E. Launch day

- [ ] **E1.** Tell customer care and the team the time. Freeze edits on the live Elementor pages.
- [ ] **E2.** Fresh backup of live WordPress.
- [ ] **E3.** `npm run deploy` in `cloudflare/edge-router/`.
- [ ] **E4.** Smoke test:
  - [ ] `curl -sI https://majeurs.com/` and a blog post show `x-majeurs-served-by: next`. `/wp-admin/` and `/wp-json/` don't.
  - [ ] Home, shop, a category, a product, search, a landing page, a blog post, a legal page
  - [ ] One real low-value order with **Paystack** and one with a **card**. Both reach order-received, the cart empties, emails arrive. Refund both.
  - [ ] Currency switcher: prices change, and the cart and checkout follow
  - [ ] Log in, reset a password from the email link, log out
  - [ ] Submit one form
  - [ ] Paystack (`/wc-api/WC_Gateway_Paystack/`) and Stripe (`?wc-api=wc_stripe`) webhooks answer 200 in their dashboards
  - [ ] Edit a content field in wp-admin. The page updates on the next load (cache refresh works).
- [ ] **E5.** SEO: re-crawl and compare against `docs/seo-baseline`, resubmit `sitemap_index.xml` in Google Search Console, inspect a few URLs.
- [ ] **E6.** Purge Cloudflare's cache for majeurs.com.

**Rollback:** `ROUTING=off npm run deploy` in `cloudflare/edge-router/`, or delete the Worker's route under Workers Routes. Every path goes back to WordPress within seconds, and nothing on WordPress needs undoing.

## F. First weeks after launch

- [ ] **F1.** Daily for a week: new orders and their payment status, Vercel errors and function logs, webhook deliveries, form submissions.
- [ ] **F2.** Weekly for 4 weeks: Google Search Console coverage, 404s and ranking changes.
- [ ] **F3.** Tell customer care what changes for customers:
  - carts in progress at switchover are lost
  - customers have to log in again
  - wishlists saved with ShopBuilder don't carry over
- [ ] **F4.** After about 2 weeks without a rollback, clean up live like staging: remove the Elementor page layouts and templates, and deactivate Elementor Pro. Back up first (see `../wp-backups/README.md`). **Keep Elementor and ShopBuilder active.**

- [x] **F5.** (Done early, 10 Nov 2026: deactivated and deleted through the REST API, which also removes its `.htaccess` rules and drop-ins. The old site is uncached until launch.) Remove **LiteSpeed Cache** from live WordPress (agreed 8 Nov 2026), within a few days of launch once there's no rollback. After launch WordPress serves only wp-admin, the REST API and media, and none of them benefit from it. Next.js and Vercel cache the pages, `next/image` optimises the images (the site's WebPs are original uploads, not LiteSpeed copies), and LiteSpeed's page cache could only serve stale API answers.
  - [x] Back up first. In LiteSpeed Cache → Toolbox, purge all, then deactivate and delete the plugin. Deactivating removes its `.htaccess` rules and its `object-cache.php` / `advanced-cache.php` files.
  - [ ] (10 Nov 2026: no QUIC.cloud CDN in DNS or page HTML; `LSCWP_CTRL` removed from the edge router. QUIC.cloud IP list removed from WAF rule 1, now "Allow Next.js server + payment callbacks (skip)" (ruleset version 17)., and delete the domain at my.quic.cloud if it was ever added there.) If QUIC.cloud was linked (CDN or image optimisation), disconnect it in LiteSpeed's settings before deleting, and check the domain's DNS doesn't point at QUIC.cloud. Then remove "QUIC.cloud" from Cloudflare WAF rule 1, and delete `LSCWP_CTRL` from `src/routes.ts` in the edge router.
  - [ ] (10 Nov 2026: wp-admin, pages and `/wp-json/` checked without `x-litespeed-cache`; a test order still to do) Afterwards: wp-admin, a test order and the currency endpoint still work. `/wp-json/` answers without `x-litespeed-cache`.
  - The host's LiteSpeed **web server** stays. Only the WordPress plugin goes.

## G. Open items (don't block launch, but need owners)

- [x] **G0.** (10 Nov 2026) Contact details in one place: wp-admin → Site content → **Contact details** (phone, WhatsApp, email, social accounts). Every page, the footer, the schema `telephone`, `locations.kml` and the WooCommerce order emails read it. Page copy uses `{phone}`, `{phone_link}`, `{whatsapp_link}`, `{email}`; order emails use `{customer_service_phone}`, `{customer_service_email}`, `{whatsapp_link}`. Main number +234 814 399 8290 everywhere except the UK office (+44 7936 520391).
- [ ] **G0b.** Rank Math → Titles & Meta → Local SEO → Phone still holds +234 201 330 6192. The Next.js schema overrides it, but update it so the old site and Rank Math's own output match.

- [ ] **G1.** Font licences. Nordique Pro's web licence is capped at 10k page views a month and probably needs upgrading before launch. The Helvetica Neue web licence is still open. See `DESIGN_SYSTEM.md`.
- [ ] **G2.** Academy and Careers portal URLs. Their old sub-pages redirect temporarily (`permanent: false` in `lib/routes/wpRoutes.ts`) until the portals exist.
- [ ] **G3.** api.majeurs.com after launch: keep it noindexed, keep its Stripe in test mode, and decide whether to refresh it from live now and then.
- [ ] **G4.** Optional: move WordPress to `cms.majeurs.com`, point all of majeurs.com at Vercel, and turn on `majeurs-frontend-lock.php`. This needs a search-and-replace of WordPress URLs and new webhook URLs at Paystack and Stripe.
