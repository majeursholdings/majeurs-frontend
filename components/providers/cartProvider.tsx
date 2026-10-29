"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
};

export type CartVariation = { attribute: string; value: string }[];

const CartContext = createContext<CartContextValue | null>(null);

async function request(url: string, init?: RequestInit): Promise<Cart> {
	const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
	const data = await res.json();
	if (!res.ok) throw new Error(data?.message ?? "The cart couldn't be updated.");
	return data;
}

/** Store API cart, reached through the /api/cart routes (the Cart-Token stays in an httpOnly cookie). */
export function CartProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [cart, setCart] = useState<Cart | null>(null);
	const [adding, setAdding] = useState<number | null>(null);

	useEffect(() => {
		let active = true;
		request("/api/cart/")
			.then((data) => active && setCart(data))
			.catch(() => {});
		return () => {
			active = false;
		};
	}, []);

	const add = useCallback(
		async (id: number, name?: string, quantity = 1, variation?: CartVariation) => {
			setAdding(id);
			try {
				setCart(await request("/api/cart/items/", { method: "POST", body: JSON.stringify({ id, quantity, variation }) }));
				toast.success(name ? `${name} added to your cart` : "Added to your cart", {
					action: { label: "View cart", onClick: () => router.push("/cart/") },
				});
			} catch (error) {
				toast.error((error as Error).message);
			} finally {
				setAdding(null);
			}
		},
		[router],
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
		() => ({ cart, count: cart?.count ?? 0, adding, add, update, remove, applyCoupon, removeCoupon }),
		[cart, adding, add, update, remove, applyCoupon, removeCoupon],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
	return ctx;
}
