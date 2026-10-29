import { cookies, headers } from "next/headers";
import { WP_URL, decodeEntities } from "./wp";

/**
 * Customer accounts through the majeurs/v1/account endpoints (docs/wordpress/majeurs-account.php).
 * Server-only: the session token lives in an httpOnly cookie and the shared secret never leaves the server.
 */
const SESSION_COOKIE = "mj_session";
const MAJEURS_API = `${WP_URL}/wp-json/majeurs/v1`;

export type Customer = { id: number; email: string; first_name: string; last_name: string; display_name: string };

export type AddressFields = {
	first_name: string;
	last_name: string;
	company: string;
	address_1: string;
	address_2: string;
	city: string;
	state: string;
	postcode: string;
	country: string;
	phone: string;
	email: string;
};

export type AddressBook = {
	billing: AddressFields;
	shipping: AddressFields;
	/** code -> name, the countries WooCommerce sells / ships to */
	countries: Record<string, string>;
	/** country code -> state code -> name */
	states: Record<string, Record<string, string>>;
};

export type OrderSummary = {
	id: number;
	number: string;
	date: string | null;
	status: string;
	status_label: string;
	/** formatted in the order's currency */
	total: string;
	item_count: number;
	needs_payment: boolean;
	order_key: string;
};

export type OrderDetail = OrderSummary & {
	items: { name: string; quantity: number; total: string; meta: { label: string; value: string }[]; slug: string | null; image: string | null }[];
	totals: { label: string; value: string }[];
	payment_method: string;
	customer_note: string;
	billing: string[];
	shipping: string[];
	email: string;
	phone: string;
};

export class AccountError extends Error {
	constructor(
		message: string,
		public status: number,
	) {
		super(message);
	}
}

type Session = { token: string; expires: number; customer: Customer };

async function accountApi<T>(path: string, init?: { method?: string; body?: unknown; headers?: Record<string, string> }): Promise<T> {
	const token = (await cookies()).get(SESSION_COOKIE)?.value;
	const headers: Record<string, string> = { "Content-Type": "application/json", "X-Majeurs-Secret": process.env.WP_ACCOUNT_SECRET ?? "", ...init?.headers };
	if (token) headers["X-Majeurs-Session"] = token;

	let res: Response;
	try {
		res = await fetch(`${MAJEURS_API}${path}`, {
			method: init?.method ?? "GET",
			headers,
			body: init?.body ? JSON.stringify(init.body) : undefined,
			cache: "no-store",
			signal: AbortSignal.timeout(10_000),
		});
	} catch {
		throw new AccountError("Your account is unavailable right now. Please try again.", 502);
	}

	const data = await res.json().catch(() => null);
	if (!res.ok) {
		// a WP 404 with rest_no_route means the account snippet isn't installed
		const message = data?.code === "rest_no_route" ? "Accounts aren't available yet." : decodeEntities(data?.message ?? "Something went wrong. Please try again.");
		throw new AccountError(message, res.status);
	}
	return data as T;
}

async function startSession(session: Session) {
	(await cookies()).set(SESSION_COOKIE, session.token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		expires: new Date(session.expires * 1000),
	});
	return session.customer;
}

export async function hasSession(): Promise<boolean> {
	return (await cookies()).has(SESSION_COOKIE);
}

/** The signed-in customer, or null when signed out (or the session has expired). Request-time only. */
export async function getCustomer(): Promise<Customer | null> {
	if (!(await hasSession())) return null;
	try {
		return await accountApi<Customer>("/account/me");
	} catch (error) {
		if (error instanceof AccountError && error.status === 401) return null;
		throw error;
	}
}

export async function login(username: string, password: string, remember: boolean) {
	return startSession(await accountApi<Session>("/account/login", { method: "POST", body: { username, password, remember } }));
}

export async function register(email: string) {
	return startSession(await accountApi<Session>("/account/register", { method: "POST", body: { email } }));
}

export async function logout() {
	const store = await cookies();
	if (store.has(SESSION_COOKIE)) await accountApi("/account/logout", { method: "POST" }).catch(() => {});
	store.delete(SESSION_COOKIE);
}

export async function requestPasswordReset(login: string) {
	await accountApi("/account/lost-password", { method: "POST", body: { login } });
}

export async function resetPassword(input: { key: string; id?: string; login?: string; password: string }) {
	await accountApi("/account/reset-password", { method: "POST", body: input });
}

export async function updateCustomer(input: Pick<Customer, "first_name" | "last_name" | "display_name" | "email"> & { current_password?: string; new_password?: string }) {
	return accountApi<Customer>("/account/me", { method: "POST", body: input });
}

export async function getAddresses() {
	return accountApi<AddressBook>("/account/addresses");
}

export async function updateAddress(type: "billing" | "shipping", address: Partial<AddressFields>) {
	return accountApi<AddressFields>(`/account/addresses/${type}`, { method: "POST", body: address });
}

export async function getOrders(page = 1) {
	return accountApi<{ orders: OrderSummary[]; total: number; pages: number }>(`/account/orders?page=${page}`);
}

/** null when the order doesn't exist or isn't this customer's */
export async function getOrder(id: number): Promise<OrderDetail | null> {
	try {
		return await accountApi<OrderDetail>(`/account/orders/${id}`);
	} catch (error) {
		if (error instanceof AccountError && error.status === 404) return null;
		throw error;
	}
}

/** Blog comment as the signed-in customer, or as a guest with name + email. WP may hold it for moderation. */
export async function postComment(input: { post: number; comment: string; author?: string; email?: string; parent?: number }) {
	const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
	return accountApi<{ id: number; approved: boolean }>("/comments", { method: "POST", body: input, headers: { "X-Majeurs-Client-IP": ip } });
}

/** Saved product ids for the signed-in customer (oldest first) */
export async function getWishlist() {
	return (await accountApi<{ ids: number[] }>("/account/wishlist")).ids;
}

/** Adds ids to the account's wishlist (also merges a guest list on login); returns the full list */
export async function addToWishlist(ids: number[]) {
	return (await accountApi<{ ids: number[] }>("/account/wishlist", { method: "POST", body: { ids } })).ids;
}

export async function removeFromWishlist(id: number) {
	return (await accountApi<{ ids: number[] }>(`/account/wishlist/${id}`, { method: "DELETE" })).ids;
}

/** Route handler response for a failed wishlist call. Signed out (expired session, or no account endpoints yet) isn't an error: the browser list takes over. */
export function wishlistErrorResponse(error: unknown) {
	if (error instanceof AccountError && (error.status === 401 || error.status === 404 || error.status === 503)) {
		return Response.json({ signedIn: false, ids: [] });
	}
	console.error(error);
	return Response.json({ message: error instanceof AccountError ? error.message : "Your wishlist couldn't be saved. Please try again." }, { status: 502 });
}
