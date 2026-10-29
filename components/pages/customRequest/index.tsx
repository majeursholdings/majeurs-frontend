import { PageHero } from "@/components/common/pageHero";
import { BrandIcon } from "@/components/common/brandIcons";
import { ShopNowBand } from "@/components/landing/shopNowBand";
import { SplitFeature } from "@/components/landing/splitFeature";
import { whatsappLink } from "@/lib/contact";
import { CustomRequestForm } from "./customRequestForm";
import { BESPOKE_INTRO, FormSection } from "./formSection";

const UPLOADS = "https://majeurs.com/wp-content/uploads";

/** /custom-made-furniture-in-lagos/: hero, "Custom made Furniture" split, the request form, Shop Now closer */
export default function CustomRequestPage() {
	return (
		<>
			<PageHero
				title="Custom Request"
				description="Complete your dream home with your dream furniture style"
				image={`${UPLOADS}/Demi-Samande-of-Majeurs-working-on-a-furniture-product-sketch.webp`}
			/>

			<SplitFeature
				image={`${UPLOADS}/Majeurs-workman-actively-working-on-a-Atunlo-collection-design.webp`}
				imageAlt="A Majeurs craftsman working on an Atunlo collection piece"
				title="Custom made Furniture"
				actions={
					<>
						<a href="#request" className="btn border-black text-black hover:bg-black hover:text-white">
							Submit request
						</a>
						<a
							href={whatsappLink("Hello Majeurs, I'd like to talk about a custom furniture project.")}
							target="_blank"
							rel="noopener noreferrer"
							className="btn border-black bg-black text-white hover:border-gold hover:bg-gold"
						>
							<BrandIcon name="whatsapp" className="size-4" />
							Contact support
						</a>
					</>
				}
			>
				<p>
					Have an idea for your space? Let’s build it, from first sketch to final detail. Majeurs is the best custom-made furniture manufacturer
					in Lagos, Nigeria. Majeurs specializes in custom-made built-in furniture. From your long sofa chairs to full office furniture sets, home
					offices, bedroom furniture sets, kitchens, and more. Everything is tailored to fit your space and your style.
				</p>
				<p>
					We offer fine carpentry and renovation work for homes, offices, hotels, and shops. Whether you already have a plan or just a rough idea,
					we’ll help you bring it to life.
				</p>
			</SplitFeature>

			<FormSection id="request" title="Dimensions · Finishes · Timeline" intro={BESPOKE_INTRO}>
				<CustomRequestForm />
			</FormSection>

			<ShopNowBand />
		</>
	);
}
