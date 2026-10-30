/**
 * Editable page copy: each page declares its fields once, with today's copy as the default. That one definition
 *  - becomes an ACF field group on the page in wp-admin, or on wp-admin > Site content for copy shared by many pages
 *    (scripts/content.mts writes docs/wordpress/majeurs-content.php),
 *  - seeds WordPress with the defaults (scripts/content.mts seed),
 *  - types what the page gets back from getPageContent() (lib/content/get.ts), with the default standing in for any
 *    field WordPress hasn't saved yet.
 *
 * Plain data only, no Next.js imports: scripts/content.mts runs this file with Node's type stripping, so imports
 * between lib/content files keep their .ts extension.
 */
import { WP_URL } from "../api/wp.ts";

export type Cta = { label: string; href: string; external?: boolean };

type Base<T> = { label: string; instructions?: string; default: T };
export type TextField = Base<string> & { kind: "text" };
/** Plain text; blank lines split paragraphs (paragraphs()) */
export type TextareaField = Base<string> & { kind: "textarea" };
/** WP editor HTML (bold, links, lists) */
export type RichField = Base<string> & { kind: "rich" };
/** Media library image; the page gets its URL */
export type ImageField = Base<string> & { kind: "image" };
/** Button / link: label, URL, "open in a new tab" */
export type LinkField = Base<Cta> & { kind: "link" };
export type ListField<F extends Fields = Fields> = Base<Values<F>[]> & { kind: "list"; fields: F; itemLabel?: string };

export type Field = TextField | TextareaField | RichField | ImageField | LinkField | ListField;
export type Fields = { [name: string]: Field };

export type Values<F extends Fields> = { [K in keyof F]: F[K]["default"] };

export type PageContent<F extends Fields = Fields> = {
	/** stable id, part of every ACF key: never rename once seeded */
	id: string;
	/** WordPress page the fields are attached to (lib/routes/wpRoutes.ts) */
	wpId: number;
	path: string;
	/** field group title in wp-admin */
	title: string;
	fields: F;
};

export const text = (label: string, value = "", instructions?: string): TextField => ({ kind: "text", label, default: value, instructions });
export const textarea = (label: string, value = "", instructions?: string): TextareaField => ({ kind: "textarea", label, default: value, instructions });
export const rich = (label: string, value = "", instructions?: string): RichField => ({ kind: "rich", label, default: value, instructions });
export const image = (label: string, value = "", instructions?: string): ImageField => ({ kind: "image", label, default: value, instructions });
export const link = (label: string, value: Cta = { label: "", href: "" }, instructions?: string): LinkField => ({ kind: "link", label, default: value, instructions });
export const list = <F extends Fields>(label: string, fields: F, value: Values<F>[], options: { itemLabel?: string; instructions?: string } = {}): ListField<F> => ({
	kind: "list",
	label,
	fields,
	default: value,
	...options,
});

export const definePage = <F extends Fields>(page: PageContent<F>): PageContent<F> => page;

/** Copy shared by many pages (a band, a strip), or a page with no WordPress page of its own: wp-admin > Site content */
export type SiteContent<F extends Fields = Fields> = {
	/** stable id, part of every ACF key and option name: never rename once seeded */
	id: string;
	/** box title on the Site content screen */
	title: string;
	fields: F;
};

export const defineSite = <F extends Fields>(section: SiteContent<F>): SiteContent<F> => section;

/** A file in WordPress uploads, e.g. upload("wood-skin.webp") */
export const upload = (file: string) => `${WP_URL}/wp-content/uploads/${file}`;

/** "First paragraph\n\nSecond" -> ["First paragraph", "Second"] for textarea fields */
export const paragraphs = (value: string) =>
	value
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean);
