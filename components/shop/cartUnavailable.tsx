"use client";

/** The cart didn't load (WordPress down or slow) */
export function CartUnavailable({ onRetry }: { onRetry: () => void }) {
	return (
		<div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
			<p className="text-h4">We couldn’t load your cart</p>
			<p className="max-w-md text-sm text-charcoal">This is usually brief. Please try again in a moment.</p>
			<button type="button" onClick={onRetry} className="btn mt-5 border-black bg-black text-white hover:border-gold hover:bg-gold">
				Try again
			</button>
		</div>
	);
}
