"use client";

import { useCallback, useSyncExternalStore } from "react";
import { toast } from "sonner";

/**
 * Wishlist (product ids) kept in the browser and shared across tabs through the storage event.
 * Signed in, it mirrors the account's list (/api/wishlist -> majeurs/v1/account/wishlist): the first sync
 * merges whatever was saved as a guest into the account, and every change after that is sent to it.
 */
const KEY = "mj_wishlist";
const EMPTY: number[] = [];
const listeners = new Set<() => void>();
let cache: { raw: string | null; ids: number[] } = { raw: null, ids: EMPTY };

function read(): number[] {
	let raw: string | null = null;
	try {
		raw = localStorage.getItem(KEY);
	} catch {
		return EMPTY;
	}
	if (raw === cache.raw) return cache.ids;
	let ids = EMPTY;
	try {
		const parsed = JSON.parse(raw ?? "[]");
		if (Array.isArray(parsed)) ids = parsed.filter((n): n is number => Number.isInteger(n));
	} catch {}
	cache = { raw, ids };
	return ids;
}

function write(ids: number[]) {
	try {
		localStorage.setItem(KEY, JSON.stringify(ids));
	} catch {}
	listeners.forEach((l) => l());
}

type Remote = { signedIn: boolean; ids: number[] };

/** Whether changes also go to the account; "unknown" until the first sync */
let account: "unknown" | "checking" | "signed-in" | "guest" = "unknown";

async function remote(url: string, init?: RequestInit): Promise<Remote> {
	const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
	const data = await res.json().catch(() => null);
	if (!res.ok) throw new Error(data?.message ?? "Your wishlist couldn't be saved. Please try again.");
	return data;
}

/** Loads the account's list, merging in the guest list. Runs on first use and after logging in. */
export async function syncWishlist() {
	account = "checking";
	try {
		let data = await remote("/api/wishlist/");
		const missing = data.signedIn ? read().filter((id) => !data.ids.includes(id)) : [];
		if (missing.length) data = await remote("/api/wishlist/", { method: "POST", body: JSON.stringify({ ids: missing }) });
		account = data.signedIn ? "signed-in" : "guest";
		if (data.signedIn) write(data.ids);
	} catch {
		// keep the browser list; the next full page load tries again
		account = "guest";
	}
}

/** On logout: forget the account's list in this browser */
export function clearWishlist() {
	account = "guest";
	write([]);
}

/** Sends one change to the account; on failure puts the browser list back and says so */
async function push(id: number, added: boolean, previous: number[]) {
	try {
		const data = added
			? await remote("/api/wishlist/", { method: "POST", body: JSON.stringify({ ids: [id] }) })
			: await remote(`/api/wishlist/${id}/`, { method: "DELETE" });
		if (data.signedIn) write(data.ids);
		else account = "guest";
	} catch (error) {
		write(previous);
		toast.error((error as Error).message);
	}
}

function update(next: (current: number[]) => number[], id: number) {
	const current = read();
	const ids = next(current);
	write(ids);
	const added = ids.includes(id);
	if (account === "signed-in" && added !== current.includes(id)) void push(id, added, current);
	return added;
}

function subscribe(listener: () => void) {
	if (account === "unknown") void syncWishlist();
	listeners.add(listener);
	const onStorage = (e: StorageEvent) => e.key === KEY && listener();
	window.addEventListener("storage", onStorage);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("storage", onStorage);
	};
}

export function useWishlist() {
	const ids = useSyncExternalStore(subscribe, read, () => EMPTY);

	const toggle = useCallback((id: number) => update((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]), id), []);

	const remove = useCallback((id: number) => {
		update((current) => current.filter((x) => x !== id), id);
	}, []);

	return { ids, count: ids.length, has: (id: number) => ids.includes(id), toggle, remove };
}
