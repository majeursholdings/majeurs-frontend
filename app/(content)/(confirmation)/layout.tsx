import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

/**
 * Thank-you pages after WP forms (catalogue request, quote request, trade registration, /thank-you/<form>/).
 * Centred message with ways back into the site. Never indexed.
 */
export default function ConfirmationLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="container-site flex min-h-[60vh] items-center justify-center py-16">
			<div className="w-full max-w-xl space-y-8 text-center">
				{children}
				<div className="flex flex-wrap justify-center gap-3">
					<Link href="/shop/" className="btn bg-black text-white hover:bg-ink">
						Browse the shop
					</Link>
					<Link href="/" className="btn border-black text-black hover:bg-black hover:text-white">
						Back to home
					</Link>
				</div>
			</div>
		</div>
	);
}
