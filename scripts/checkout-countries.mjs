#!/usr/bin/env node
/**
 * Countries, states and per-country address rules for the checkout form, copied from WooCommerce.
 *
 *   npm run checkout:countries
 *
 * WooCommerce has no public endpoint for them, so this puts a product in a throwaway cart, opens WP's block
 * checkout and reads `wcSettings` (countries, countryData, defaultFields) from the page. Writes
 * lib/checkout/countryData.json. Re-run after changing "Selling location(s)" / "Shipping location(s)" in
 * WooCommerce > Settings > General. Reads WP_URL (and WP_ORIGIN_TOKEN) from .env.
 */
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
await loadEnv();

const WP_URL = (process.env.WP_URL ?? "https://majeurs.com").replace(/\/+$/, "");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0 Safari/537.36 majeurs-checkout-countries";
const jar = new Map();

async function get(url) {
	const headers = { "User-Agent": UA, Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") };
	if (process.env.WP_ORIGIN_TOKEN) headers["X-Majeurs-Origin"] = process.env.WP_ORIGIN_TOKEN;
	// lets this script past docs/wordpress/majeurs-frontend-lock.php, which hides WP's own pages from visitors
	if (process.env.WP_ACCOUNT_SECRET) headers["X-Majeurs-Secret"] = process.env.WP_ACCOUNT_SECRET;
	const res = await fetch(url, { headers, redirect: "manual" });
	for (const cookie of res.headers.getSetCookie()) {
		const [pair] = cookie.split(";");
		const i = pair.indexOf("=");
		jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
	}
	const location = res.headers.get("location");
	if (res.status >= 300 && res.status < 400 && location) return get(new URL(location, url).href);
	return res;
}

// the block checkout redirects to the cart while the cart is empty
const products = await (await get(`${WP_URL}/wp-json/wc/store/v1/products?type=simple&per_page=1&_fields=id`)).json();
if (!products[0]) fail("no simple product to put in the cart");
await get(`${WP_URL}/?add-to-cart=${products[0].id}`);
const html = await (await get(`${WP_URL}/checkout/`)).text();

const encoded = html.match(/decodeURIComponent\(\s*'([^']+)'\s*\)/)?.[1];
if (!encoded) fail(`no wcSettings on ${WP_URL}/checkout/ (is it still the block checkout?)`);
const settings = JSON.parse(decodeURIComponent(encoded));
if (!settings.countryData || !settings.defaultFields) fail("wcSettings has no countryData/defaultFields");

const decode = (s) =>
	s
		.replace(/&([a-z])(acute|grave|circ|tilde|uml|cedil|ring);/gi, (_, c, mark) => (c + { acute: "́", grave: "̀", circ: "̂", tilde: "̃", uml: "̈", cedil: "̧", ring: "̊" }[mark]).normalize("NFC"))
		.replace(/&amp;/g, "&");

const countries = Object.fromEntries(
	Object.entries(settings.countries).map(([code, name]) => [code, { name: decode(name), shipping: settings.countryData[code]?.allowShipping !== false }]),
);
const states = {};
const locale = {};
for (const [code, data] of Object.entries(settings.countryData)) {
	if (data.states && !Array.isArray(data.states) && Object.keys(data.states).length) {
		states[code] = Object.fromEntries(Object.entries(data.states).map(([k, v]) => [k, decode(v)]));
	}
	const rules = {};
	for (const [field, rule] of Object.entries(data.locale ?? {})) {
		const kept = Object.fromEntries(Object.entries(rule).filter(([k]) => k === "label" || k === "required" || k === "hidden"));
		if (Object.keys(kept).length) rules[field] = kept;
	}
	if (Object.keys(rules).length) locale[code] = rules;
}
const fields = Object.fromEntries(
	Object.entries(settings.defaultFields).map(([name, f]) => [name, { label: f.label, required: Boolean(f.required), hidden: Boolean(f.hidden) }]),
);

const out = new URL("lib/checkout/countryData.json", root);
await writeFile(out, JSON.stringify({ source: `${WP_URL}/checkout/`, fields, countries, states, locale }, null, "\t") + "\n");
console.log(`${Object.keys(countries).length} countries, ${Object.keys(states).length} with states, ${Object.keys(locale).length} with address rules -> lib/checkout/countryData.json`);

async function loadEnv() {
	const text = await readFile(new URL(".env", root), "utf8").catch(() => "");
	for (const line of text.split("\n")) {
		const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
		if (!m || m[1] in process.env) continue;
		let value = m[2];
		if (value.length >= 2 && value[0] === value.at(-1) && (value[0] === '"' || value[0] === "'")) value = value.slice(1, -1);
		process.env[m[1]] = value;
	}
}

function fail(message) {
	console.error(message);
	process.exit(1);
}
