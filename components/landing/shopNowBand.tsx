import Image from "next/image";
import Link from "next/link";
import { DEFAULT_HERO_IMAGE } from "@/components/common/pageHero";

const WOOD = "https://majeurs.com/wp-content/uploads/wood-skin.webp";

/**
 * WP "Shop Now" closer (Leadership, Catalogue, Custom Request): a wood-grain band with the showroom photo
 * set into it and a framed "Shop Now" sign, then the brand line and a "Let's shop" button.
 */
export function ShopNowBand() {
	return (
		<section className="pb-16 md:pb-24">
			<div className="relative isolate pt-10 md:pt-14">
				<Image src={WOOD} alt="" fill sizes="100vw" className="-z-20 object-cover [clip-path:inset(0_0_35%_0)]" />
				<Link href="/shop/" className="group relative mx-auto block aspect-[16/7] w-[calc(100%-1.25rem)] max-w-[720px] md:w-[90%]">
					<Image src={DEFAULT_HERO_IMAGE} alt="Majeurs showroom sofa" fill sizes="(min-width: 800px) 720px, 100vw" className="object-cover" />
					<span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 border-4 border-black bg-white px-6 py-2 font-display text-2xl text-black shadow-[0_0_0_4px_white] transition-colors group-hover:bg-black group-hover:text-white md:px-10 md:py-3 md:text-4xl">
						Shop Now
					</span>
				</Link>
			</div>
			<div className="mx-auto mt-14 max-w-2xl space-y-6 px-2.5 text-center">
				<p className="text-sm text-charcoal">
					Our passion lies in creating a collection that embodies sophistication, elegance, and timeless design. We strive to be more than just
					another furniture manufacturer; we aim to be a destination where individuals and businesses with a love for opulence and style can
					discover and embrace the art of luxury living.
				</p>
				<Link href="/shop/" className="btn border-black bg-black text-white hover:bg-gold hover:border-gold">
					Let&apos;s shop
				</Link>
			</div>
		</section>
	);
}

export default ShopNowBand;
