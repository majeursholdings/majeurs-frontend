import { test } from "node:test";
import assert from "node:assert/strict";
import { isNextPath, mustStayOnWordPress, routePatterns, rulesFor } from "./routes.ts";

const all = rulesFor(["next", "shop", "commerce"]);
const commerceOnly = rulesFor(["next", "commerce"]);

test("Next.js paths", () => {
	for (const p of ["/", "/cart/", "/cart", "/checkout/", "/checkout/order-received/7481/", "/checkout/order-pay/1/", "/my-account/orders/", "/wishlist/", "/_next/static/x.js", "/api/cart/", "/product/haske/", "/product-category/sofa/", "/shop/", "/search/"]) {
		assert.ok(isNextPath(p, all), p);
	}
});

test("WordPress paths", () => {
	for (const p of ["/cartoon/", "/wp-admin/", "/wp-json/wc/store/v1/cart", "/wp-content/uploads/a.jpg", "/blog-post/", "/about-us/", "/favicon.ico", "/wc-api/WC_Gateway_Paystack/"]) {
		assert.ok(!isNextPath(p, all), p);
	}
	assert.ok(!isNextPath("/product/haske/", commerceOnly));
});

test("payment callbacks stay on WordPress", () => {
	assert.ok(mustStayOnWordPress(new URL("https://majeurs.com/wc-api/WC_Gateway_Paystack/?reference=x")));
	assert.ok(mustStayOnWordPress(new URL("https://majeurs.com/?wc-api=wc_stripe")));
	assert.ok(mustStayOnWordPress(new URL("https://majeurs.com/checkout/?wc-ajax=wc_stripe_update_order_status")));
	assert.ok(mustStayOnWordPress(new URL("https://majeurs.com/checkout/order-received/12/?key=k&wc_payment_method=stripe")));
	assert.ok(!mustStayOnWordPress(new URL("https://majeurs.com/checkout/order-received/12/?key=k")));
});

test("route patterns", () => {
	const patterns = routePatterns(["next", "commerce"]);
	assert.ok(patterns.includes("majeurs.com/cart*"));
	assert.ok(patterns.includes("majeurs.com/_next*"));
	assert.ok(patterns.includes("majeurs.com/icon.png"));
});
