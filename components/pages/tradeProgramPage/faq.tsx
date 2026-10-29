import { ChevronDown } from "lucide-react";
import { faqs } from "./content";

/** "Questions from the trade": native <details>, one row per question */
export function TradeFaq() {
	return (
		<div className="border-t border-sand">
			{faqs.map((item) => (
				<details key={item.q} className="group border-b border-sand">
					<summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm text-black [&::-webkit-details-marker]:hidden">
						<h3 className="text-sm">{item.q}</h3>
						<ChevronDown className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-180" aria-hidden />
					</summary>
					<p className="pb-5 pr-8 text-sm text-charcoal">{item.a}</p>
				</details>
			))}
		</div>
	);
}
