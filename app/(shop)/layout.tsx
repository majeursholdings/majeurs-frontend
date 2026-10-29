/**
 * Shop group: catalogue archives, product pages and the wishlist.
 * Shop-wide client providers (wishlist, recently viewed, quick view) go here once built.
 * The visible page shells live in the nested (catalog) and (product) layouts.
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
	return <div className="bg-white">{children}</div>;
}
