/** ShopBuilder Pro multi-currency. Prices on WP are converted using the `rtsb_currency` cookie. */
export const CURRENCY_COOKIE = "rtsb_currency";

export const currencies = [
	{ code: "USD", label: "USD", flag: "🇺🇸" },
	{ code: "NGN", label: "NGN", flag: "🇳🇬" },
	{ code: "GBP", label: "GBP", flag: "🇬🇧" },
	{ code: "EUR", label: "EUR", flag: "🇪🇺" },
] as const;

export type CurrencyCode = (typeof currencies)[number]["code"];

// TODO: confirm the WP default (ShopBuilder base currency / geolocation rules)
export const DEFAULT_CURRENCY: CurrencyCode = "USD";
/** Symbol for money inputs (MainForm "amount" fields) when a field doesn't set its own */
export const DEFAULT_CURRENCY_SYMBOL = "$";

/** Browser only: the visitor's currency cookie as set, "" when unset. For cache keys of client-side price fetches. */
export function currencyCookie(): string {
	return document.cookie.match(new RegExp(`(?:^|; )${CURRENCY_COOKIE}=([^;]*)`))?.[1] ?? "";
}

export function toCurrency(value: string | undefined): CurrencyCode {
	const match = currencies.find((c) => c.code === value?.toUpperCase());
	return match ? match.code : DEFAULT_CURRENCY;
}
