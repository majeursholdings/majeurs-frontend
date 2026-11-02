import type { Metadata } from "next";
import { AccountPage } from "@/components/account/accountPage";
import { WishlistGrid } from "@/components/shop/wishlistGrid";

export const metadata: Metadata = { title: "My account – Wishlist", robots: { index: false, follow: false } };

/** The same saved list as /wishlist/: signed in, it's kept on the account (wishlistProvider) */
export default function Page() {
	return (
		<AccountPage>
			{() => (
				<div className="space-y-8">
					<div className="space-y-1">
						<h2 className="text-h4">Wishlist</h2>
						<p className="text-sm text-charcoal">Pieces you’ve saved. They’re kept on your account, so they follow you to any device you log in on.</p>
					</div>
					<WishlistGrid columns={3} />
				</div>
			)}
		</AccountPage>
	);
}
