import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { CheckoutView } from "@/components/checkout/checkoutView";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/checkout/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, { title: page.title }, { robots: { index: false, follow: false } });
}

export default function Page({ searchParams }: PageProps<"/checkout">) {
	return (
		<div className="space-y-8 px-2.5">
			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
				<h1 className="text-h2">Checkout</h1>
				<Link href="/cart/" className="group inline-flex items-center gap-2 pb-1 text-sm text-bronze underline-offset-4 hover:underline">
					<MoveLeft className="size-4 transition-[translate] duration-150 ease-out group-hover:-translate-x-0.5" strokeWidth={1.5} aria-hidden />
					Back to cart
				</Link>
			</div>
			{/* the cart loads in the browser; ?payment=failed comes back from a card payment that didn't go through */}
			<Suspense fallback={<CheckoutView />}>
				<Content searchParams={searchParams} />
			</Suspense>
		</div>
	);
}

async function Content({ searchParams }: Pick<PageProps<"/checkout">, "searchParams">) {
	const { payment } = await searchParams;
	return <CheckoutView paymentFailed={payment === "failed"} />;
}
