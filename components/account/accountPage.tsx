import { Suspense } from "react";
import { AccountError, getCustomer, type Customer } from "@/lib/api/account";
import { AccountNav } from "./accountNav";
import { AuthForms } from "./authForms";

type AccountPageProps = {
	/** Page body for a signed-in customer; runs inside the Suspense boundary, so it can await params and data */
	children: (customer: Customer) => React.ReactNode | Promise<React.ReactNode>;
};

/**
 * Every my-account page: the session is read at request time behind <Suspense> (cacheComponents).
 * Signed out, the page shows the login / register forms at the same URL, as WooCommerce does.
 */
export function AccountPage({ children }: AccountPageProps) {
	return (
		<Suspense fallback={<AccountSkeleton />}>
			<Gate>{children}</Gate>
		</Suspense>
	);
}

async function Gate({ children }: AccountPageProps) {
	let customer: Customer | null;
	try {
		customer = await getCustomer();
	} catch (error) {
		return <p className="border border-sand bg-sand-50 p-6 text-sm text-charcoal">{error instanceof AccountError ? error.message : "Your account is unavailable right now."}</p>;
	}
	if (!customer) return <AuthForms />;

	return (
		<div className="space-y-8 md:space-y-12">
			<h1 className="text-h3">My account</h1>
			<div className="grid gap-8 lg:grid-cols-[230px_1fr] lg:gap-7">
				<AccountNav />
				<div className="min-w-0">{await children(customer)}</div>
			</div>
		</div>
	);
}

function AccountSkeleton() {
	return (
		<div className="grid gap-8 lg:grid-cols-[230px_1fr] lg:gap-7" aria-label="Loading your account">
			<div className="h-48 animate-pulse bg-sand-50" />
			<div className="h-72 animate-pulse bg-sand-50" />
		</div>
	);
}
