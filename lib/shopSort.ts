// Shared by the server fetch (lib/api/store.ts) and the client sort dropdown, so keep it free of server imports

/** WP shop "Sort by" options -> Store API orderby/order */
export const sortOptions = [
	{ value: "", label: "Default sorting", orderby: "menu_order", order: "asc" },
	{ value: "popularity", label: "Sort by popularity", orderby: "popularity", order: "desc" },
	{ value: "rating", label: "Sort by average rating", orderby: "rating", order: "desc" },
	{ value: "date", label: "Sort by latest", orderby: "date", order: "desc" },
	{ value: "price", label: "Sort by price: low to high", orderby: "price", order: "asc" },
	{ value: "price-desc", label: "Sort by price: high to low", orderby: "price", order: "desc" },
] as const;

export type SortValue = (typeof sortOptions)[number]["value"];

export function toSort(value: string | string[] | undefined): SortValue {
	return sortOptions.find((o) => o.value === value)?.value ?? "";
}
