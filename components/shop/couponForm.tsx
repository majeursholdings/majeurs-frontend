"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { useCart } from "@/components/providers/cartProvider";

const couponSchema = z.object({ code: z.string().trim().min(1, "Please enter a coupon code").max(100) });
type CouponInput = z.input<typeof couponSchema>;

/** "Have a coupon?" field in the cart summary. WooCommerce checks the code; its message shows as a toast. */
export function CouponForm() {
	const { applyCoupon } = useCart();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CouponInput>({ resolver: zodResolver(couponSchema), defaultValues: { code: "" } });

	const onSubmit = async ({ code }: CouponInput) => {
		if (await applyCoupon(code.trim())) reset();
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-1.5">
			<label htmlFor="coupon-code" className="text-xs text-charcoal">
				Have a coupon?
			</label>
			<div className="flex">
				<input
					id="coupon-code"
					type="text"
					autoComplete="off"
					placeholder="Coupon code"
					aria-invalid={errors.code ? true : undefined}
					aria-describedby={errors.code ? "coupon-error" : undefined}
					{...register("code")}
					className="h-10 min-w-0 flex-1 border border-r-0 border-sand bg-white px-3 text-sm text-ink outline-none transition-colors duration-500 ease-in-out focus:border-black"
				/>
				<button
					type="submit"
					disabled={isSubmitting}
					className="btn h-10 shrink-0 border-black bg-black px-4 text-white hover:border-gold hover:bg-gold disabled:opacity-60"
				>
					{isSubmitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
					Apply
				</button>
			</div>
			{errors.code ? (
				<p id="coupon-error" className="text-xs text-destructive">
					{errors.code.message}
				</p>
			) : null}
		</form>
	);
}

export default CouponForm;
