"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import type { Cart } from "@/lib/api/cart";

type CartContextValue = {
	cart: Cart | null;
	count: number;
	/** id of the product currently being added, for button spinners */
	adding: number | null;
	/** variation: chosen options for a variable product, e.g. [{ attribute: "Material", value: "uf-2039-42" }] */
	add: (id: number, name?: string, quantity?: number, variation?: CartVariation) => Promise<void>;
	update: (key: string, quantity: number) => Promise<void>;
	remove: (key: string) => Promise<void>;
	/** true when the coupon was applied */
	applyCoupon: (code: string) => Promise<boolean>;
	removeCoupon: (code: string) => Promise<void>;
	/** replace the cart with one a checkout call answered (address, delivery option) */
	sync: (cart: Cart) => void;
	/** the cart couldn't be loaded; `reload` tries again */
	loadFailed: boolean;
	reload: () => void;
	/** the mini-cart drawer (components/shop/miniCart.tsx) */
	drawerOpen: boolean;
	setDrawerOpen: (open: boolean) => void;
};

export type CartVariation = { attribute: string; value: string }[];

const CartContext = createContext<CartContextValue | null>(null);

async function request(url: string, init?: RequestInit): Promise<Cart> {
	const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
	const data = await res.json();
	if (!res.ok) throw new Error(data?.message ?? "The cart couldn't be updated.");
	return data;
}

// The cart lives outside React (like the wishlist): loaded once, when the provider first subscribes
let current: Cart | null = null;
let loading = false;
/** the last load failed (WordPress down or slow): pages show a retry instead of waiting forever */
let failed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function setCart(next: Cart) {
	current = next;
	failed = false;
	notify();
}

function load() {
	if (loading) return;
	loading = true;
	failed = false;
	notify();
	request("/api/cart/")
		.then(setCart)
		.catch(() => {
			failed = true;
		})
		.finally(() => {
			loading = false;
			notify();
		});
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	if (!current && !loading && !failed) load();
	return () => {
		listeners.delete(listener);
	};
}

/** Store API cart, reached through the /api/cart routes (the Cart-Token stays in an httpOnly cookie). */
export function CartProvider({ children }: { children: React.ReactNode }) {
	const cart = useSyncExternalStore(
		subscribe,
		() => current,
		() => null,
	);
	const loadFailed = useSyncExternalStore(
		subscribe,
		() => failed,
		() => false,
	);
	const [adding, setAdding] = useState<number | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const add = useCallback(
		async (id: number, name?: string, quantity = 1, variation?: CartVariation) => {
			setAdding(id);
			try {
				setCart(await request("/api/cart/items/", { method: "POST", body: JSON.stringify({ id, quantity, variation }) }));
				toast.success(name ? `${name} added to your cart` : "Added to your cart", {
					action: { label: "View cart", onClick: () => setDrawerOpen(true) },
				});
			} catch (error) {
				toast.error((error as Error).message);
			} finally {
				setAdding(null);
			}
		},
		[],
	);

	const update = useCallback(async (key: string, quantity: number) => {
		try {
			setCart(await request(`/api/cart/items/${encodeURIComponent(key)}/`, { method: "PATCH", body: JSON.stringify({ quantity }) }));
		} catch (error) {
			toast.error((error as Error).message);
		}
	}, []);

	const remove = useCallback(async (key: string) => {
		try {
			setCart(await request(`/api/cart/items/${encodeURIComponent(key)}/`, { method: "DELETE" }));
		} catch (error) {
			toast.error((error as Error).message);
		}
	}, []);

	const applyCoupon = useCallback(async (code: string) => {
		try {
			setCart(await request("/api/cart/coupons/", { method: "POST", body: JSON.stringify({ code }) }));
			toast.success(`Coupon “${code}” applied`);
			return true;
		} catch (error) {
			toast.error((error as Error).message);
			return false;
		}
	}, []);

	const removeCoupon = useCallback(async (code: string) => {
		try {
			setCart(await request(`/api/cart/coupons/?${new URLSearchParams({ code })}`, { method: "DELETE" }));
		} catch (error) {
			toast.error((error as Error).message);
		}
	}, []);

	const value = useMemo(
		() => ({ cart, count: cart?.count ?? 0, adding, add, update, remove, applyCoupon, removeCoupon, sync: setCart, loadFailed, reload: load, drawerOpen, setDrawerOpen }),
		[cart, adding, add, update, remove, applyCoupon, removeCoupon, loadFailed, drawerOpen],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
	return ctx;
}
