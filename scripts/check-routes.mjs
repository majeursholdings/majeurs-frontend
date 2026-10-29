#!/usr/bin/env node
/**
 * Checks that every WordPress URL works on the Next.js site.
 *
 *   npm run dev                      # or npm start
 *   npm run check:routes             # defaults to http://localhost:3000
 *   BASE_URL=https://preview.example.com npm run check:routes
 *
 * Expects: live URLs -> 200, legacy redirects -> 301/302/307/308 to the right place, gone URLs -> 410.
 * Reads the URL lists straight from lib/routes/wpRoutes.ts.
 */
import { readFile } from "node:fs/promises";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const src = await readFile(new URL("../lib/routes/wpRoutes.ts", import.meta.url), "utf8");

const arr = (name) => JSON.parse(src.match(new RegExp(`export const ${name}: string\\[\\] = (\\[.*?\\]);`, "s"))[1]);
const staticPaths = [...src.matchAll(/\{ path: "([^"]+)"/g)].map((m) => m[1]);
const redirects = [...src.matchAll(/\{ source: "([^"]+)", destination: "([^"]+)"/g)].map((m) => ({ from: m[1], to: m[2] }));

const live = [
	...staticPaths,
	...arr("productSlugs").map((s) => `/product/${s}/`),
	...arr("productCategoryPaths").map((p) => `/product-category/${p}/`),
	...arr("productTagSlugs").map((s) => `/product-tag/${s}/`),
	...arr("blogPostSlugs").map((s) => `/${s}/`),
	...arr("blogCategorySlugs").map((s) => `/category/${s}/`),
	...arr("projectSlugs").map((s) => `/project/${s}/`),
	...arr("careerSlugs").map((s) => `/career/${s}/`),
	"/sitemap_index.xml", "/page-sitemap.xml", "/post-sitemap.xml", "/product-sitemap.xml",
	"/product_cat-sitemap.xml", "/category-sitemap.xml", "/project-sitemap.xml", "/local-sitemap.xml",
	"/locations.kml", "/robots.txt",
	"/shop/page/2/", "/blog/page/2/", "/product-category/sofas/page/2/",
	"/checkout/order-received/123/", "/my-account/orders/",
];
const gone = arr("goneUrls");

const failures = [];
async function check(path, expect) {
	const res = await fetch(BASE + path, { redirect: "manual" });
	const loc = res.headers.get("location") ?? "";
	let ok = false;
	if (expect.status) ok = res.status === expect.status;
	if (expect.redirectTo) ok = [301, 302, 307, 308].includes(res.status) && new URL(loc, BASE).pathname === expect.redirectTo;
	if (!ok) failures.push(`${res.status} ${path}${loc ? ` -> ${loc}` : ""}  (expected ${expect.status ?? "redirect to " + expect.redirectTo})`);
}

const jobs = [
	...live.map((p) => () => check(p, { status: 200 })),
	...redirects.map((r) => () => check(r.from, { redirectTo: r.to })),
	...gone.map((p) => () => check(p, { status: 410 })),
];
// small concurrency so the dev server isn't flooded
for (let i = 0; i < jobs.length; i += 6) await Promise.all(jobs.slice(i, i + 6).map((j) => j()));

console.log(`Checked ${jobs.length} URLs against ${BASE}: ${live.length} live, ${redirects.length} redirects, ${gone.length} gone.`);
if (failures.length) {
	console.error(`\n${failures.length} problem(s):\n` + failures.join("\n"));
	process.exit(1);
}
console.log("All good.");
