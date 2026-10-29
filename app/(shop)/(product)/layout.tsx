/**
 * Single product page (/product/<slug>/). WP design, top to bottom:
 *   gallery (left) + summary (right: category, title, price, swatches, quantity, add to cart,
 *   Buy on WhatsApp, warranty card, trust list, share), then description / specifications / shipping
 *   accordions, "Complete the Room" and "You Might Also Like" rails. No hero banner.
 */
export default function ProductLayout({ children }: { children: React.ReactNode }) {
	return <div className="container-site px-2.5 py-8 md:px-5 md:py-12 lg:py-16">{children}</div>;
}
