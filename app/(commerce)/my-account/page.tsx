import type { Metadata } from "next";
import Link from "next/link";
import { Heart, MapPin, ShoppingBag, UserRound } from "lucide-react";
import { AccountPage } from "@/components/account/accountPage";
import { BrandIcon } from "@/components/common/brandIcons";
import { logoutAction } from "./actions";
import { whatsappLink } from "@/lib/contact";
import { getContact } from "@/lib/content/get";

export const metadata: Metadata = {
	title: "My Account",
	robots: { index: false, follow: false },
};

const cards = [
	{ title: "Orders", text: "Track and review your orders", href: "/my-account/orders/", icon: ShoppingBag },
	{ title: "Wishlist", text: "Pieces you’ve saved", href: "/my-account/wishlist/", icon: Heart },
	{ title: "Addresses", text: "Billing & delivery addresses", href: "/my-account/edit-address/", icon: MapPin },
	{ title: "Account details", text: "Name, email & password", href: "/my-account/edit-account/", icon: UserRound },
];

/** Dashboard: greeting, four shortcut cards and the WhatsApp help band */
export default async function Page() {
	const contact = await getContact();
	return (
		<AccountPage>
			{(customer) => (
				<div className="space-y-8">
					<div className="space-y-2">
						<p className="eyebrow">My account</p>
						<h2 className="text-h4">Hello, {customer.first_name || customer.display_name}</h2>
						<div className="text-sm text-grey">
							Track your orders, manage delivery addresses and update your account details.{" "}
							<form action={logoutAction} className="inline">
								<button type="submit" className="text-gold-muted hover:text-black">
									Not you? Log out
								</button>
							</form>
						</div>
					</div>

					<ul className="grid gap-4 md:grid-cols-2">
						{cards.map(({ title, text, href, icon: Icon }) => (
							<li key={href}>
								<Link href={href} className="group block h-full border border-sand p-6 transition-colors duration-300 hover:border-black">
									<Icon className="size-5 text-gold-muted" strokeWidth={1.5} aria-hidden />
									<p className="mt-6 text-base text-black group-hover:text-gold">{title}</p>
									<p className="mt-1 text-xs text-grey">{text}</p>
								</Link>
							</li>
						))}
					</ul>

					<div className="flex flex-col items-start justify-between gap-4 bg-[#f8f6f2] p-6 sm:flex-row sm:items-center">
						<p className="text-sm text-charcoal">Need help with an order? Our team is happy to assist.</p>
						<a
							href={whatsappLink(contact.whatsapp, "Hello Majeurs, I need help with an order.")}
							target="_blank"
							rel="noopener noreferrer"
							className="btn border-black bg-white text-black hover:bg-black hover:text-white"
						>
							<BrandIcon name="whatsapp" className="size-4" />
							Chat on WhatsApp
						</a>
					</div>
				</div>
			)}
		</AccountPage>
	);
}
