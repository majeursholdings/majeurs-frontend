# majeurs.com edge router

A Cloudflare Worker on the `majeurs.com` zone that serves the whole public site from Next.js on Vercel and leaves WordPress's own requests on WordPress. WordPress keeps the domain as the backend, so there is no proxy loop and no change to its `home` URL. **Not deployed yet**; launch steps are in [docs/GO_LIVE_PLAN.md](../../docs/GO_LIVE_PLAN.md).

- `src/routes.ts`: which requests stay on WordPress (`staysOnWordPress`) and the route pattern.
- `src/index.ts`: the Worker. A WordPress request goes on to the origin with `fetch(request)`, as before. Any other request is proxied to `NEXT_ORIGIN`. On the way back, the Worker rewrites `Location` headers from vercel.app to majeurs.com. On the way out it adds `X-Majeurs-Host` (read by `proxy.ts`), the visitor's IP as `X-Majeurs-Client-IP`, and `X-Majeurs-Edge` = the `EDGE_SECRET` secret. Next.js (`lib/edge.ts`) trusts the IP only with the right secret, and marks any request without it `noindex`, so the vercel.app URL stays out of search results.
- `cloudflare.config.ts`: the Worker and its route, `majeurs.com/*` (`cf` CLI). Every request passes through the Worker, so check the Workers request quota (free tier: 100k a day).

These requests stay on WordPress:

| What | Requests |
| --- | --- |
| Admin, API, media | `/wp-admin/`, `/wp-json/`, `/wp-content/`, `/wp-includes/` (with or without the trailing slash) |
| Root entry points | `/wp-*.php` (`wp-login.php`, `wp-cron.php`, `wp-comments-post.php` …) and `/xmlrpc.php` |
| Domain verification | `/.well-known/` (e.g. the Stripe plugin's Apple Pay file) |
| Payments | any path containing `/wc-api/`, any `wc-api=` or `wc-ajax=` query, and `/checkout/order-received/*?wc_payment_method=stripe` |
| Other queries | `rest_route=` (REST without pretty permalinks) |

Everything else goes to Next.js, including `/robots.txt` and the sitemaps. Next.js has a page, redirect or 410 for every old WordPress URL (`npm run check:routes` in the Next.js project). WordPress theme pages and `?p=` / `?page_id=` preview links are no longer reachable on majeurs.com.

## Commands

```sh
npm install
npm test               # routing rules
npm run deploy:dry     # build and show bindings, no upload
cf auth login          # once; CLOUDFLARE_ACCOUNT_ID=1c6e0d070c78d420259226623ef8fea2 when cf asks which account

# first deploy: create the Worker with routing off, set the secret, then switch routing on
ROUTING=off npm run deploy
cf workers secrets update majeurs-edge-router EDGE_SECRET   # the EDGE_SECRET value set on Vercel Production
npm run deploy

ROUTING=off npm run deploy   # kill switch: everything back to WordPress
```

## Before deploying

1. **Phase 3 gate:** test orders pass end to end on staging, with Paystack and Stripe (test keys), including 3-D Secure and Paystack cancel/fail.
2. **Live WordPress** (each done on staging already):
   - install `majeurs-checkout.php`, `majeurs-account.php`, `majeurs-forms.php`, `majeurs-product-extras.php` and `majeurs-currencies.php`
   - set "Majeurs site URL" = `https://majeurs.com`
   - Paystack Payment Option = Redirect
   - SMTP and the order email sender
   - Rank Math Headless CMS Support
   - coupons on (they are off on live)
3. **Vercel Production env:**
   - `NEXT_PUBLIC_SITE_URL=https://majeurs.com`
   - `WP_URL=https://majeurs.com`: the server's WP calls (`/wp-json`, `/?wc-ajax=`) pass through the Worker untouched and reach WordPress through the WAF skip (`X-Majeurs-Origin`, rule 1)
   - Stripe live keys (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PMC_ID`)
   - account and form secrets, matching live WP
4. **`NEXT_ORIGIN`** in `cloudflare.config.ts` points at the Vercel production URL. Deployment Protection must be off for production. `EDGE_SECRET` is set on Vercel Production (and on the Worker, see Commands).
5. Deploy at a quiet hour. Carts already in WooCommerce sessions don't carry over.

## Smoke test after deploying

- `curl -sI https://majeurs.com/`, `/cart/` and a blog post show `x-majeurs-served-by: next`. `/wp-admin/`, `/wp-json/` and `/wp-content/uploads/…` don't.
- Add to cart from a product page, then check out with Paystack and with a card. You should land on `/checkout/order-received/<id>/`, and the cart should be empty afterwards.
- Log in and out at `/my-account/`, then use the reset-password email link.
- Watch the webhook logs: Paystack (`/wc-api/WC_Gateway_Paystack/`) and Stripe (`?wc-api=wc_stripe`) should answer 200.
- Re-crawl against the SEO baseline (`npm run seo:snapshot` / `seo:compare` in the Next.js project).

**Rollback:** `ROUTING=off npm run deploy`, or delete the Worker's routes under Workers Routes in the dashboard. Either takes effect within seconds.
