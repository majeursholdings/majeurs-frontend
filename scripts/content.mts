#!/usr/bin/env node
/**
 * Editable page copy (lib/content) <-> WordPress.
 *
 *   npm run content:acf                  # writes the field groups into docs/wordpress/majeurs-content.php
 *   npm run content:seed                 # copies each page's defaults into fields WordPress never saved
 *   npm run content:seed -- --overwrite  # ... into every field, replacing what editors saved (asks first)
 *   npm run content:seed -- about        # one page or Site content section (its id in lib/content/pages or site.ts)
 *   npm run content:status               # which fields each page has saved in WordPress
 *
 * seed and status read WP_URL, WP_ADMIN_USER and WP_ADMIN_APP_PASSWORD (an Application Password) from .env.
 */
import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import type { Field, Fields, PageContent, SiteContent } from "../lib/content/model.ts";

const root = new URL("../", import.meta.url);
await loadEnv();
const { pages } = await import("../lib/content/pages/index.ts");
const { siteSections } = await import("../lib/content/site.ts");

const [command, ...rest] = process.argv.slice(2);
const only = rest.filter((a) => !a.startsWith("--"));
const selected = only.length ? pages.filter((p) => only.includes(p.id)) : pages;
const selectedSite = only.length ? siteSections.filter((s) => only.includes(s.id)) : siteSections;
const unknown = only.filter((id) => !pages.some((p) => p.id === id) && !siteSections.some((s) => s.id === id));
if (unknown.length) fail(`unknown page or site section id: ${unknown.join(", ")}`);

if (command === "acf") await writeAcf();
else if (command === "seed") await seed(rest.includes("--overwrite"));
else if (command === "status") await status();
else fail("usage: content.mts acf | seed [--overwrite] [page-id…] | status [page-id…]");

/* ---------- ACF field groups ---------- */

function acfField(field: Field, name: string, key: string): Record<string, unknown> {
	const base = { key, name, label: field.label, instructions: field.instructions ?? "" };
	switch (field.kind) {
		case "text":
			return { ...base, type: "text" };
		case "textarea":
			return { ...base, type: "textarea", rows: 4, new_lines: "", instructions: field.instructions ?? "Leave a blank line between paragraphs." };
		case "rich":
			return { ...base, type: "wysiwyg", tabs: "all", toolbar: "basic", media_upload: 0, delay: 1 };
		case "image":
			return { ...base, type: "image", return_format: "url", preview_size: "medium", library: "all" };
		case "link":
			return { ...base, type: "link", return_format: "array" };
		case "list": {
			const subFields = Object.entries(field.fields).map(([sub, f]) => acfField(f, sub, `${key}_${sub}`));
			const firstText = subFields.find((f) => f.type === "text");
			return {
				...base,
				type: "repeater",
				layout: "block",
				button_label: `Add ${field.itemLabel ?? "item"}`,
				collapsed: firstText?.key ?? "",
				sub_fields: subFields,
			};
		}
	}
}

function acfGroup(page: PageContent) {
	return {
		key: `group_mj_${page.id}`,
		title: page.title,
		description: `Copy and images on ${page.path} of the Next.js site. An empty field shows the site's default text. Generated from lib/content/pages.`,
		fields: Object.entries(page.fields as Fields).map(([name, field]) => acfField(field, name, `field_mj_${page.id}_${name}`)),
		location: [[{ param: "page", operator: "==", value: String(page.wpId) }]],
		position: "acf_after_title",
		style: "default",
		label_placement: "top",
		instruction_placement: "label",
		active: true,
		show_in_rest: 1,
	};
}

/**
 * A Site content section: a box on wp-admin > Site content. Option names share one namespace, so each field is
 * stored as <section>_<field>; `majeurs_section` lets the snippet hand them back under the definition's names.
 */
function acfSiteGroup(section: SiteContent) {
	return {
		key: `group_mj_site_${section.id}`,
		title: section.title,
		majeurs_section: section.id,
		fields: Object.entries(section.fields as Fields).map(([name, field]) => acfField(field, `${section.id}_${name}`, `field_mj_site_${section.id}_${name}`)),
		location: [[{ param: "options_page", operator: "==", value: "majeurs-site-content" }]],
		style: "default",
		label_placement: "top",
		instruction_placement: "label",
		active: true,
		show_in_rest: 0,
	};
}

async function writeAcf() {
	const ids = new Set<string>();
	for (const { id } of [...pages, ...siteSections]) {
		if (ids.has(id)) fail(`duplicate id ${id}`);
		ids.add(id);
	}
	const file = new URL("docs/wordpress/majeurs-content.php", root);
	const php = await readFile(file, "utf8");
	const json = JSON.stringify([...pages.map(acfGroup), ...siteSections.map(acfSiteGroup)], null, "\t");
	if (json.includes("\nJSON")) fail("a field contains a line starting with JSON, which would end the PHP heredoc");
	const next = php.replace(/(\$groups = json_decode\( <<<'JSON'\n)[\s\S]*?(\nJSON\n)/, `$1${json}$2`);
	if (next === php && !php.includes(json)) fail("generated block not found in majeurs-content.php");
	await writeFile(file, next);
	console.log(`${pages.length} page and ${siteSections.length} Site content field groups -> docs/wordpress/majeurs-content.php`);
}

/* ---------- WordPress calls ---------- */

async function wp(method: string, path: string, body?: unknown) {
	const { WP_URL, WP_ADMIN_USER, WP_ADMIN_APP_PASSWORD, WP_ORIGIN_TOKEN } = process.env;
	if (!WP_URL || !WP_ADMIN_USER || !WP_ADMIN_APP_PASSWORD) fail("set WP_URL, WP_ADMIN_USER and WP_ADMIN_APP_PASSWORD in .env");
	const res = await fetch(`${WP_URL}${path}`, {
		method,
		headers: {
			Authorization: `Basic ${Buffer.from(`${WP_ADMIN_USER}:${WP_ADMIN_APP_PASSWORD}`).toString("base64")}`,
			"Content-Type": "application/json",
			...(WP_ORIGIN_TOKEN ? { "X-Majeurs-Origin": WP_ORIGIN_TOKEN } : {}),
		},
		body: body === undefined ? undefined : JSON.stringify(body),
		signal: AbortSignal.timeout(60_000),
	});
	const data = await res.json().catch(() => null);
	if (!res.ok) fail(`${method} ${path} -> ${res.status} ${JSON.stringify(data)}`);
	return data;
}

function defaults(page: PageContent | SiteContent) {
	return Object.fromEntries(Object.entries(page.fields as Fields).map(([name, f]) => [name, f.default]));
}

async function seed(overwrite: boolean) {
	if (overwrite) {
		const rl = createInterface({ input: process.stdin, output: process.stdout });
		const answer = await rl.question(`Replace the saved copy of ${selected.length} page(s) and ${selectedSite.length} Site content section(s) in ${process.env.WP_URL} with the defaults? [y/N] `);
		rl.close();
		if (answer.trim().toLowerCase() !== "y") fail("cancelled");
	}
	const targets = [...selected.map((p) => ({ id: p.id, body: { page: p.wpId, values: defaults(p) } })), ...selectedSite.map((s) => ({ id: s.id, body: { site: s.id, values: defaults(s) } }))];
	for (const { id, body } of targets) {
		const r: { updated: string[]; skipped: string[]; missing_images: string[] } = await wp("POST", "/wp-json/majeurs/v1/content/seed", { ...body, overwrite });
		console.log(`${id.padEnd(22)} updated ${r.updated.length}, kept ${r.skipped.length}${r.missing_images.length ? `, images not in the media library: ${r.missing_images.join(" ")}` : ""}`);
	}
}

async function status() {
	for (const page of selected) {
		const data: { acf?: Record<string, unknown> | [] } = await wp("GET", `/wp-json/wp/v2/pages/${page.wpId}?_fields=acf&context=edit`);
		const acf = Array.isArray(data.acf) || !data.acf ? null : data.acf;
		const names = Object.keys(page.fields);
		const unsaved = acf ? names.filter((n) => isEmpty(acf[n])) : names;
		console.log(`${page.id.padEnd(22)} ${acf ? `${names.length - unsaved.length}/${names.length} saved` : "no field group in WordPress"}${unsaved.length && acf ? `; using defaults for ${unsaved.join(", ")}` : ""}`);
	}
	if (!selectedSite.length) return;
	const site: Record<string, Record<string, unknown>> = await wp("GET", "/wp-json/majeurs/v1/content/site");
	for (const section of selectedSite) {
		const names = Object.keys(section.fields);
		const values = site[section.id] ?? {};
		const unsaved = names.filter((n) => isEmpty(values[n]));
		console.log(`${section.id.padEnd(22)} ${names.length - unsaved.length}/${names.length} saved${unsaved.length ? `; using defaults for ${unsaved.join(", ")}` : ""}`);
	}
}

/* ---------- helpers ---------- */

/** what lib/content/get.ts replaces with the default */
function isEmpty(v: unknown) {
	return v === null || v === undefined || v === false || v === "" || (Array.isArray(v) && !v.length);
}

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

function fail(message: string): never {
	console.error(message);
	process.exit(1);
}
