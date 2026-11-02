import { cookies } from "next/headers";

/** The signed-in customer's session token (docs/wordpress/majeurs-account.php), in an httpOnly cookie */
export const SESSION_COOKIE = "mj_session";

/**
 * Headers that make a Store API call act as the signed-in customer, so orders land on their account and their
 * order pages load. Empty for guests. WordPress only honours them with the shared secret (majeurs-account.php).
 */
export async function customerHeaders(): Promise<Record<string, string>> {
	const token = (await cookies()).get(SESSION_COOKIE)?.value;
	return token ? { "X-Majeurs-Secret": process.env.WP_ACCOUNT_SECRET ?? "", "X-Majeurs-Session": token } : {};
}
