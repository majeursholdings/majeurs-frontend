import { SITE_URL } from "@/lib/contact";

/**
 * Return and shipping terms for product JSON-LD (Google Merchant listings: offers.hasMerchantReturnPolicy and
 * offers.shippingDetails). Keep in step with /refund_returns/, /shipping-policy/ and WooCommerce > Settings > Shipping.
 */

/** Countries the "International Shipping" flat rate is declared for (the rate itself applies to every country) */
export const INTERNATIONAL_COUNTRIES = ["US", "GB", "IE", "FR", "DE", "NL", "BE", "IT", "ES", "PT", "GH", "KE", "ZA"];

/** Nigerian states other than Lagos (ISO 3166-2:NG, without the "NG-" prefix), for the "Nigeria Delivery" rate */
const NIGERIA_EXCEPT_LAGOS = [
	"AB", "AD", "AK", "AN", "BA", "BY", "BE", "BO", "CR", "DE", "EB", "ED", "EK", "EN", "FC", "GO", "IM", "JI",
	"KD", "KN", "KT", "KE", "KO", "KW", "NA", "NI", "OG", "ON", "OS", "OY", "PL", "RI", "SO", "TA", "YO", "ZA",
];

/** WooCommerce shipping zones, flat rate per order in the store currency */
const SHIPPING_RATES = [
	{ label: "Lagos Delivery", amount: 60, destinations: [{ addressCountry: "NG", addressRegion: ["LA"] }] },
	{ label: "Nigeria Delivery", amount: 120, destinations: [{ addressCountry: "NG", addressRegion: NIGERIA_EXCEPT_LAGOS }] },
	{ label: "International Shipping", amount: 180, destinations: INTERNATIONAL_COUNTRIES.map((addressCountry) => ({ addressCountry })) },
];

/** offers.shippingDetails. No deliveryTime: the shipping policy gives delivery estimates per order, not fixed times */
export function shippingDetails(currency: string) {
	return SHIPPING_RATES.map(({ label, amount, destinations }) => ({
		"@type": "OfferShippingDetails",
		name: label,
		shippingRate: { "@type": "MonetaryAmount", value: amount, currency },
		shippingDestination: destinations.map((d) => ({ "@type": "DefinedRegion", ...d })),
	}));
}

/**
 * offers.hasMerchantReturnPolicy, from /refund_returns/: returns within 30 days of delivery, sent back by the customer
 * at their own cost. International orders can only come back for repair of a defect, which is not a return to Google.
 */
export const merchantReturnPolicy = [
	{
		"@type": "MerchantReturnPolicy",
		applicableCountry: "NG",
		returnPolicyCountry: "NG",
		returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
		merchantReturnDays: 30,
		returnMethod: "https://schema.org/ReturnByMail",
		returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
		merchantReturnLink: `${SITE_URL}/refund_returns/`,
	},
	{
		"@type": "MerchantReturnPolicy",
		applicableCountry: INTERNATIONAL_COUNTRIES,
		returnPolicyCountry: "NG",
		returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
		merchantReturnLink: `${SITE_URL}/refund_returns/`,
	},
];
