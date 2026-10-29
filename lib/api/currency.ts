import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import { CURRENCY_COOKIE, currencies } from "@/lib/currency";
import { STORE_API, WP_URL, decodeEntities, wpFetch } from "./wp";

export type Fx = { code: string; rate: number; symbol: string; decimals: number };
export type CurrencyRates = { base: string; currencies: Fx[] };

const FALLBACK: CurrencyRates = { base: "USD", currencies: [{ code: "USD", rate: 1, symbol: "$", decimals: 2 }] };

/**
 * ShopBuilder exchange rates from the Code Snippets endpoint (docs/wordpress/majeurs-currencies.php), or,
 * until that snippet is active, rates read back from the Store API's converted prices. If both fail only
 * the base currency is offered, so prices are never mislabelled.
 */
export async function getCurrencyRates(): Promise<CurrencyRates> {
	"use cache";
	cacheLife("hours");
	cacheTag("currency");

	try {
		const res = await wpFetch(`${WP_URL}/wp-json/majeurs/v1/currencies`);
		if (res.ok) {
			const data: CurrencyRates = await res.json();
			if (data.currencies?.length > 1) return data;
		}
		return await ratesFromStoreApi();
	} catch {
		return FALLBACK;
	}
}

type PricedProduct = { prices: { price: string; currency_code: string; currency_symbol: string; currency_minor_unit: number }; price_html: string };

/**
 * The Store API labels prices in the rtsb_currency cookie's currency but leaves `prices` unconverted, while
 * `price_html` carries ShopBuilder's converted amount. Comparing the two on the priciest simple product
 * (largest number, smallest rounding error) gives each currency's rate.
 */
async function ratesFromStoreApi(): Promise<CurrencyRates> {
	const url = `${STORE_API}/products?type=simple&orderby=price&order=desc&per_page=1&_fields=prices,price_html`;
	const probe = async (code?: string): Promise<PricedProduct | undefined> => {
		const res = await wpFetch(url, code ? { headers: { Cookie: `${CURRENCY_COOKIE}=${code}` } } : undefined);
		return res.ok ? ((await res.json()) as PricedProduct[])[0] : undefined;
	};

	const base = await probe();
	if (!base) return FALLBACK;
	const unit = base.prices.currency_minor_unit;
	const baseAmount = Number(base.prices.price) / 10 ** unit;
	const baseFx: Fx = { code: base.prices.currency_code, rate: 1, symbol: decodeEntities(base.prices.currency_symbol), decimals: unit };

	const others = await Promise.all(
		currencies
			.filter((c) => c.code !== baseFx.code)
			.map(async ({ code }): Promise<Fx | null> => {
				const product = await probe(code);
				if (!product || product.prices.currency_code !== code || !baseAmount) return null;
				// "<span>₦</span>2,659,635.79" -> 2659635.79
				const shown = decodeEntities(product.price_html.replace(/<[^>]+>/g, "")).match(/[\d,]+(?:\.\d+)?/)?.[0];
				const converted = Number(shown?.replace(/,/g, ""));
				if (!converted) return null;
				return { code, rate: converted / baseAmount, symbol: decodeEntities(product.prices.currency_symbol), decimals: unit };
			}),
	);

	return { base: baseFx.code, currencies: [baseFx, ...others.filter((c): c is Fx => c !== null)] };
}

/** The visitor's currency (rtsb_currency cookie), or the base currency when it has no rate. Request-time only. */
export async function getFx(): Promise<Fx> {
	const [store, rates] = await Promise.all([cookies(), getCurrencyRates()]);
	const wanted = store.get(CURRENCY_COOKIE)?.value?.toUpperCase();
	return rates.currencies.find((c) => c.code === wanted) ?? rates.currencies.find((c) => c.code === rates.base) ?? rates.currencies[0];
}

/** Store API amount (base currency, minor units) -> "₦1,366,085.66" */
export function formatMoney(minor: string | number, minorUnit: number, fx: Fx): string {
	return formatAmount((Number(minor) / 10 ** minorUnit) * fx.rate, fx);
}

/** Amount already in the visitor's currency -> "₦1,366,086" */
export function formatAmount(value: number, fx: Fx, decimals = fx.decimals): string {
	return `${fx.symbol}${value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

/** Amount in the visitor's currency -> Store API amount (base currency, minor units), e.g. for ?min_price= */
export function toBaseMinor(value: number, minorUnit: number, fx: Fx, round: (n: number) => number = Math.round): number {
	return round((value / fx.rate) * 10 ** minorUnit);
}
