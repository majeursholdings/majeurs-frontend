import type { Metadata } from "next";
import { AccountPage } from "@/components/account/accountPage";
import { AccountDetailsForm } from "@/components/account/accountForms";

export const metadata: Metadata = { title: "My account – Account details", robots: { index: false, follow: false } };

export default function Page() {
	return (
		<AccountPage>
			{(customer) => (
				<div className="max-w-2xl space-y-6">
					<h2 className="text-h4">Account details</h2>
					<AccountDetailsForm customer={customer} />
				</div>
			)}
		</AccountPage>
	);
}
