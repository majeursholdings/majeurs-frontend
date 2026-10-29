import type { Metadata } from "next";
import { AccountPage } from "@/components/account/accountPage";
import { ChangePasswordForm, ProfileForm } from "@/components/account/accountForms";
import { CUSTOMER_SERVICE_EMAIL } from "@/lib/contact";

export const metadata: Metadata = { title: "My account – Account details", robots: { index: false, follow: false } };

/** Profile and password are separate forms with their own save buttons; email and display name are read-only */
export default function Page() {
	return (
		<AccountPage>
			{(customer) => (
				<div className="max-w-2xl space-y-12">
					<h2 className="text-h4">Account details</h2>

					<section aria-labelledby="profile-title" className="space-y-6">
						<div className="space-y-1">
							<h3 id="profile-title" className="text-sm font-bold uppercase tracking-button">
								Profile
							</h3>
							<p className="text-sm text-charcoal">The name on your orders and in your account.</p>
						</div>

						<div className="space-y-4 bg-sand-50 p-5">
							<dl className="grid gap-4 text-sm sm:grid-cols-2">
								<div className="min-w-0 space-y-1">
									<dt className="text-charcoal">Email address</dt>
									<dd className="break-all text-black">{customer.email}</dd>
								</div>
								<div className="min-w-0 space-y-1">
									<dt className="text-charcoal">Display name</dt>
									<dd className="break-words text-black">{customer.display_name}</dd>
									<dd className="text-xs text-charcoal">Shown in your account and on your reviews.</dd>
								</div>
							</dl>
							<p className="text-xs text-charcoal">
								To change your email address or display name, email{" "}
								<a href={`mailto:${CUSTOMER_SERVICE_EMAIL}`} className="break-all text-bronze underline underline-offset-2 hover:text-gold">
									{CUSTOMER_SERVICE_EMAIL}
								</a>
								.
							</p>
						</div>

						<ProfileForm customer={customer} />
					</section>

					<section aria-labelledby="password-title" className="space-y-6 border-t border-sand pt-12">
						<div className="space-y-1">
							<h3 id="password-title" className="text-sm font-bold uppercase tracking-button">
								Password
							</h3>
							<p className="text-sm text-charcoal">You’ll need your current password to set a new one.</p>
						</div>
						<ChangePasswordForm email={customer.email} />
					</section>
				</div>
			)}
		</AccountPage>
	);
}
