// Variation picking for the product page. Pure functions shared by the client components, so keep it free of server imports.
import type { ProductOption, ProductVariation } from "@/lib/api/product";

/** option name -> chosen term slug */
export type Selection = Record<string, string>;

/** WooCommerce's pre-selected options ("Default form values" on the product) */
export function defaultSelection(options: ProductOption[]): Selection {
	return Object.fromEntries(options.filter((o) => o.defaultSlug).map((o) => [o.name, o.defaultSlug!]));
}

/** A variation value of "" means "any" */
function fits(variation: Pick<ProductVariation, "attributes">, name: string, slug: string | undefined): boolean {
	const value = variation.attributes[name];
	return !slug || !value || value === slug;
}

/** The variation for a complete selection, or undefined while options are still missing */
export function findVariation<V extends Pick<ProductVariation, "attributes">>(options: ProductOption[], variations: V[], selection: Selection): V | undefined {
	if (options.some((o) => !selection[o.name])) return undefined;
	return variations.find((v) => options.every((o) => fits(v, o.name, selection[o.name])));
}

/** Whether picking `slug` for `name` still leads to a real variation, given the other options already chosen */
export function isAvailable(options: ProductOption[], variations: Pick<ProductVariation, "attributes">[], selection: Selection, name: string, slug: string): boolean {
	return variations.some((v) => fits(v, name, slug) && options.every((o) => o.name === name || fits(v, o.name, selection[o.name])));
}

/** Pick (or un-pick) a term, dropping any other choice it no longer combines with */
export function choose(options: ProductOption[], variations: Pick<ProductVariation, "attributes">[], selection: Selection, name: string, slug: string): Selection {
	if (selection[name] === slug) {
		return Object.fromEntries(Object.entries(selection).filter(([key]) => key !== name));
	}
	const next: Selection = { ...selection, [name]: slug };
	for (const o of options) {
		if (o.name !== name && next[o.name] && !isAvailable(options, variations, next, o.name, next[o.name])) delete next[o.name];
	}
	return next;
}

/** "Select a color and material to add to cart" */
export function missingOptionsHint(options: ProductOption[], selection: Selection): string | null {
	const missing = options.filter((o) => !selection[o.name]).map((o) => o.name.toLowerCase());
	if (!missing.length) return null;
	const list = missing.length > 1 ? `${missing.slice(0, -1).join(", ")} and ${missing.at(-1)}` : missing[0];
	return `Select a ${list} to add to cart`;
}
