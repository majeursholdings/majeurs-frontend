import type { Metadata } from "next";
import { Suspense } from "react";
import { LostPasswordForm, ResetPasswordForm } from "@/components/account/passwordForms";

export const metadata: Metadata = { title: "Lost password", robots: { index: false, follow: false } };

/**
 * Request a reset link, or (from the WooCommerce email) set a new password:
 *   /my-account/lost-password/?key=…&id=…                         reset password
 *   /my-account/lost-password/?action=newaccount&key=…&login=…    new account: set password
 */
export default function Page({ searchParams }: PageProps<"/my-account/lost-password">) {
	return (
		<div className="mx-auto w-full max-w-md space-y-8 border border-sand p-6 md:mt-6 md:p-10">
			<div className="space-y-2">
				<p className="eyebrow">My account</p>
				<h1 className="text-h4">Reset your password</h1>
			</div>
			<Suspense fallback={<div className="h-48 animate-pulse bg-sand-50" />}>
				<Content searchParams={searchParams} />
			</Suspense>
		</div>
	);
}

async function Content({ searchParams }: Pick<PageProps<"/my-account/lost-password">, "searchParams">) {
	const { key, id, login } = await searchParams;
	const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
	if (one(key) && (one(id) || one(login))) {
		return <ResetPasswordForm resetKey={one(key)!} id={one(id)} login={one(login)} />;
	}
	return <LostPasswordForm />;
}
