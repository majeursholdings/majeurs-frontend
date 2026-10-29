import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountPage } from "@/components/account/accountPage";
import { AddressForm } from "@/components/account/accountForms";
import { getAddresses, type AddressFields } from "@/lib/api/account";

export const metadata: Metadata = { title: "My account – Addresses", robots: { index: false, follow: false } };

const titles = { billing: "Billing address", shipping: "Shipping address" } as const;

/** /my-account/edit-address/ lists both addresses; /edit-address/billing/ and /shipping/ edit one */
export default function Page({ params }: PageProps<"/my-account/edit-address/[[...type]]">) {
	return (
		<AccountPage>
			{async () => {
				const { type: segments = [] } = await params;
				const [type] = segments;
				if (segments.length > 1 || (type && !isAddressType(type))) notFound();
				const book = await getAddresses();

				if (type && isAddressType(type)) {
					return (
						<div className="max-w-2xl space-y-6">
							<Link href="/my-account/edit-address/" className="text-xs text-gold-muted hover:text-black">
								← Addresses
							</Link>
							<h2 className="text-h4">{titles[type]}</h2>
							<AddressForm type={type} address={book[type]} countries={book.countries} states={book.states} />
						</div>
					);
				}

				return (
					<div className="space-y-6">
						<p className="text-sm text-charcoal">The following addresses will be used on the checkout page by default.</p>
						<div className="grid gap-6 md:grid-cols-2">
							{(["billing", "shipping"] as const).map((t) => (
								<div key={t} className="flex flex-col gap-4 border border-sand p-6">
									<div className="flex items-baseline justify-between gap-4">
										<h2 className="text-sm uppercase tracking-button text-black">{titles[t]}</h2>
										<Link href={`/my-account/edit-address/${t}/`} className="text-xs text-bronze underline underline-offset-4">
											{hasAddress(book[t]) ? "Edit" : "Add"}
										</Link>
									</div>
									<address className="space-y-0.5 text-sm not-italic text-charcoal">
										{hasAddress(book[t]) ? (
											formatAddress(book[t], book.countries, book.states).map((line, i) => <p key={i}>{line}</p>)
										) : (
											<p>You have not set up this type of address yet.</p>
										)}
									</address>
								</div>
							))}
						</div>
					</div>
				);
			}}
		</AccountPage>
	);
}

const isAddressType = (t: string): t is keyof typeof titles => t in titles;

const hasAddress = (a: AddressFields) => !!(a.address_1 || a.city);

function formatAddress(a: AddressFields, countries: Record<string, string>, states: Record<string, Record<string, string>>): string[] {
	return [
		[a.first_name, a.last_name].filter(Boolean).join(" "),
		a.company,
		a.address_1,
		a.address_2,
		[a.city, states[a.country]?.[a.state] ?? a.state, a.postcode].filter(Boolean).join(", "),
		countries[a.country] ?? a.country,
		a.phone,
		a.email,
	].filter(Boolean);
}
