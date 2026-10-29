import type { Metadata } from "next";

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

/**
 * Cart, checkout, order pages and my-account. Same header/footer as the rest of the site (as on WP),
 * a plain container, and never indexed. Cart/checkout state providers (Store API Cart-Token) go here (Phase 3).
 */
export default function CommerceLayout({ children }: { children: React.ReactNode }) {
	return <div className="container-site px-2.5 py-10 md:px-5 md:py-16">{children}</div>;
}
