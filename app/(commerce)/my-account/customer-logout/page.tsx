import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "../actions";

export const metadata: Metadata = { title: "Log out", robots: { index: false, follow: false } };

/** Old WooCommerce logout links land here. Logging out takes a POST (a button), so a link alone can't sign anyone out. */
export default function Page() {
	return (
		<div className="mx-auto flex w-full max-w-md flex-col items-start gap-6 border border-sand p-6 md:mt-6 md:p-10">
			<div className="space-y-2">
				<p className="eyebrow">My account</p>
				<h1 className="text-h4">Log out</h1>
				<p className="text-sm text-charcoal">Are you sure you want to log out?</p>
			</div>
			<div className="flex flex-wrap gap-3">
				<form action={logoutAction}>
					<button type="submit" className="btn border-black bg-black text-white hover:bg-ink">
						Confirm and log out
					</button>
				</form>
				<Link href="/my-account/" className="btn border-black text-black hover:bg-black hover:text-white">
					Back to my account
				</Link>
			</div>
		</div>
	);
}
