import { test } from "node:test";
import assert from "node:assert/strict";
import { routePatterns, staysOnWordPress } from "./routes.ts";

const wp = (path: string) => staysOnWordPress(new URL(path, "https://majeurs.com"));

test("pages go to Next.js", () => {
	for (const p of [
		"/",
		"/shop/",
		"/product/haske/",
		"/product-category/sofa/",
		"/search/?s=chair",
		"/cart/",
		"/checkout/",
		"/checkout/order-received/7481/?key=k",
		"/checkout/order-pay/1/?pay_for_order=true&key=k",
		"/my-account/orders/",
		"/wishlist/",
		"/about-majeurs-holdings/",
		"/some-blog-post/",
		"/blog/page/2/",
		"/robots.txt",
		"/sitemap_index.xml",
		"/product-sitemap.xml",
		"/favicon.ico",
		"/_next/static/x.js",
		"/api/cart/",
		"/wp-something-else/", // a page slug, not a WordPress entry point
		"/wp-login/", // ditto
	]) {
		assert.ok(!wp(p), p);
	}
});

test("WordPress keeps its own paths", () => {
	for (const p of [
		"/wp-admin/",
		"/wp-admin",
		"/wp-admin/admin-ajax.php",
		"/wp-json/wc/store/v1/cart",
		"/wp-json",
		"/wp-content/uploads/a.webp",
		"/wp-includes/js/jquery.js",
		"/wp-login.php",
		"/wp-login.php?action=rp&key=k",
		"/wp-cron.php",
		"/wp-comments-post.php",
		"/xmlrpc.php",
		"/.well-known/apple-developer-merchantid-domain-association",
		"/?rest_route=/wc/store/v1/cart",
	]) {
		assert.ok(wp(p), p);
	}
});

test("payment callbacks stay on WordPress", () => {
	assert.ok(wp("/wc-api/WC_Gateway_Paystack/?reference=x"));
	assert.ok(wp("/?wc-api=wc_stripe"));
	assert.ok(wp("/checkout/?wc-ajax=wc_stripe_update_order_status"));
	assert.ok(wp("/?wc-ajax=update_order_review"));
	assert.ok(wp("/checkout/order-received/12/?key=k&wc_payment_method=stripe"));
	assert.ok(!wp("/checkout/order-received/12/?key=k"));
});

test("route pattern covers the whole host", () => {
	assert.deepEqual(routePatterns(), ["majeurs.com/*"]);
});
