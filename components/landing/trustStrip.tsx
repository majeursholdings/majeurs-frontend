import { BadgeCheck, Phone, Truck, Users } from "lucide-react";

/** Icons by position, matching the WP strip (customers, shipping, quality, support) */
const icons = [Users, Truck, BadgeCheck, Phone];

/** WP "Trusted by thousands" strip: four icon + title + line columns */
export function TrustStrip({ title, items }: { title: string; items: { title: string; text: string }[] }) {
	return (
		<section className="px-2.5 py-12.5 md:px-5 md:py-20">
			<div className="container-site space-y-10">
				<h2 className="text-center text-h3 font-display">{title}</h2>
				<ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{items.map((item, i) => {
						const Icon = icons[i % icons.length];
						return (
							<li key={item.title} className="space-y-2 text-center">
								<Icon className="mx-auto size-6 text-gold" strokeWidth={1.5} aria-hidden />
								<h3 className="text-sm uppercase tracking-button text-black">{item.title}</h3>
								<p className="mx-auto max-w-64 text-sm text-charcoal">{item.text}</p>
							</li>
						);
					})}
				</ul>
			</div>
		</section>
	);
}
