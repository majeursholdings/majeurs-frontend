"use client";

import { LoaderCircle, MapPin, Store, Truck } from "lucide-react";
import type { Cart, ShippingRate } from "@/lib/api/cart";
import { cn } from "@/lib/utils";

type RateChoice = { packageId: number; rate: ShippingRate };

/** Every rate WooCommerce offers, with its package (one package for this store, but the API allows more) */
export function rateChoices(cart: Cart, pickup: boolean): RateChoice[] {
	return cart.shippingPackages.flatMap((pkg) => pkg.rates.filter((rate) => rate.pickup === pickup).map((rate) => ({ packageId: pkg.id, rate })));
}

/** "Ship" or "Pickup", as on the block checkout. Only offered when WooCommerce has a pickup location. */
export function DeliveryToggle({ value, onChange, disabled }: { value: "ship" | "pickup"; onChange: (value: "ship" | "pickup") => void; disabled?: boolean }) {
	const options = [
		{ value: "ship" as const, label: "Ship", hint: "Delivered to your door", icon: Truck },
		{ value: "pickup" as const, label: "Pickup", hint: "Collect from our showroom", icon: Store },
	];
	return (
		<div role="radiogroup" aria-label="Delivery method" className="grid grid-cols-2 gap-3">
			{options.map(({ value: option, label, hint, icon: Icon }) => (
				<label
					key={option}
					className={cn(
						"flex cursor-pointer items-center gap-3 border p-4 transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-gold",
						value === option ? "border-black bg-sand-50" : "border-sand hover:border-ink",
						disabled && "pointer-events-none opacity-60",
					)}
				>
					<input type="radio" name="delivery" value={option} checked={value === option} onChange={() => onChange(option)} disabled={disabled} className="sr-only" />
					<Icon className="size-5 shrink-0 text-gold" strokeWidth={1.5} aria-hidden />
					<span className="space-y-0.5">
						<span className="block text-sm font-bold text-black">{label}</span>
						<span className="block text-xs text-charcoal">{hint}</span>
					</span>
				</label>
			))}
		</div>
	);
}

/**
 * The rates to choose from. Delivery rates appear once the address is complete enough to price (as on the
 * block checkout); pickup shows the showroom's address and how to collect.
 */
export function RateOptions({
	choices,
	pickup,
	quoting,
	canQuote,
	busy,
	onSelect,
}: {
	choices: RateChoice[];
	pickup: boolean;
	quoting: boolean;
	canQuote: boolean;
	busy: boolean;
	onSelect: (choice: RateChoice) => void;
}) {
	if (!pickup && quoting) {
		return (
			<p className="flex items-center gap-2 border border-sand p-4 text-sm text-charcoal" role="status">
				<LoaderCircle className="size-4 animate-spin" aria-hidden />
				Finding delivery options for your address…
			</p>
		);
	}
	if (!pickup && !canQuote) {
		return <p className="border border-dashed border-sand p-4 text-sm text-charcoal">Enter your shipping address to see delivery options and costs.</p>;
	}
	if (!choices.length) {
		return (
			<p className="border border-sand bg-sand-50 p-4 text-sm text-charcoal" role="alert">
				{pickup ? "Pickup isn't available for this order." : "We don't deliver to this address yet. Choose pickup, or contact us and we'll arrange delivery."}
			</p>
		);
	}

	return (
		<div role="radiogroup" aria-label={pickup ? "Pickup location" : "Delivery option"} aria-busy={busy} className={cn("divide-y divide-sand border border-sand", busy && "opacity-60")}>
			{choices.map((choice) => {
				const { rate } = choice;
				return (
					<label key={rate.id} className={cn("flex cursor-pointer gap-3 p-4 transition-colors duration-150", rate.selected ? "bg-sand-50" : "hover:bg-sand-50/60")}>
						<input
							type="radio"
							name={pickup ? "pickup-location" : "shipping-rate"}
							value={rate.id}
							checked={rate.selected}
							disabled={busy}
							onChange={() => onSelect(choice)}
							className="mt-0.5 size-4 shrink-0 accent-black"
						/>
						<span className="min-w-0 flex-1 space-y-1 text-sm">
							<span className="flex justify-between gap-3">
								<span className="text-black">{rate.name}</span>
								<span className="shrink-0 font-bold text-black tabular-nums">{rate.price}</span>
							</span>
							{rate.description ? <span className="block text-xs text-charcoal">{rate.description}</span> : null}
							{rate.pickupAddress ? (
								<span className="flex gap-1.5 text-xs text-charcoal">
									<MapPin className="mt-px size-3.5 shrink-0 text-gold" aria-hidden />
									{rate.pickupAddress}
								</span>
							) : null}
							{rate.pickupDetails ? <span className="block text-xs text-charcoal">{rate.pickupDetails}</span> : null}
						</span>
					</label>
				);
			})}
		</div>
	);
}
