# majeurs.com edge router

A Cloudflare Worker on the `majeurs.com` zone that sends migrated paths to Next.js on Vercel and leaves everything else on WordPress. WordPress keeps the domain, so there is no proxy loop and no change to its `home` URL. **Not deployed yet.**

- `src/routes.ts`: the path groups, the payment exceptions and the route patterns. Edit `LIVE_GROUPS` to switch groups on.
- `src/index.ts`: the Worker. On a Next.js path it proxies to `NEXT_ORIGIN`, rewrites `Location` headers from vercel.app back to majeurs.com, and adds `X-Majeurs-Host` (read by `proxy.ts`). Otherwise `fetch(request)` continues to the WordPress origin as before.
- `cloudflare.config.ts`: the Worker and its routes (`cf` CLI). Cloudflare only runs it on those routes, so the rest of the site never touches the Worker.

| Group | Paths |
| --- | --- |
| `next` (always) | `/_next/`, `/api/`, `/font/`, `/images/`, `/icon.png`, `/apple-icon.png` |
| `shop` | `/`, `/shop/`, `/product/`, `/product-category/`, `/product-tag/`, `/search/` |
| `commerce` | `/cart/`, `/checkout/`, `/my-account/`, `/wishlist/` |

These requests always stay on WordPress, even on a Next.js path:

- any path with `/wc-api/`
- any `wc-api=` or `wc-ajax=` query
- `/checkout/order-received/*?wc_payment_method=stripe`

**`commerce` can't go live without `shop`.** While WordPress renders the product pages, its "Add to cart" fills WooCommerce's session cart. The Next.js cart (Store API Cart-Token) never sees that cart, so customers would reach an empty cart. WordPress's header cart count would also be wrong on every WP page. `LIVE_GROUPS` therefore has both.

## Commands

```sh
npm install
npm test               # routing rules
npm run deploy:dry     # build and show bindings, no upload
cf auth login          # once
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
   - `WP_URL=https://majeurs.com`: the server's WP calls (`/wp-json`, `/?wc-ajax=`) are not on the Worker's routes, so they reach WordPress directly through the WAF skip (`X-Majeurs-Origin`, rule 1)
   - Stripe live keys (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PMC_ID`)
   - account and form secrets, matching live WP
4. **`NEXT_ORIGIN`** in `cloudflare.config.ts` points at the Vercel production URL. Deployment Protection must be off for production.
5. Deploy at a quiet hour. Carts already in WooCommerce sessions don't carry over.

## Smoke test after deploying

- `curl -sI https://majeurs.com/cart/` shows `x-majeurs-served-by: next`. `/about-us/` and `/wp-admin/` don't.
- Add to cart from a product page, then check out with Paystack and with a card. You should land on `/checkout/order-received/<id>/`, and the cart should be empty afterwards.
- Log in and out at `/my-account/`, then use the reset-password email link.
- Watch the webhook logs: Paystack (`/wc-api/WC_Gateway_Paystack/`) and Stripe (`?wc-api=wc_stripe`) should answer 200.
- Re-crawl against the SEO baseline (`npm run seo:snapshot` / `seo:compare` in the Next.js project).

**Rollback:** `ROUTING=off npm run deploy`, or delete the Worker's routes under Workers Routes in the dashboard. Either takes effect within seconds.
