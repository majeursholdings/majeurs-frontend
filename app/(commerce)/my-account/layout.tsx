/**
 * WooCommerce account area, served from WordPress through the majeurs/v1/account endpoints
 * (docs/wordpress/majeurs-account.php). Each page wraps its body in <AccountPage>, which adds the
 * "My account" heading and tabs when signed in, and shows the login / register card when not.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="mx-auto max-w-[1100px]">{children}</div>
	);
}
