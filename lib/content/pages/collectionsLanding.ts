/**
 * Fields shared by the two trade landing pages (For Architects and Developers, Bespoke Collections for Interior
 * Designers): same sections, each page with its own copy. Not a page itself; see forDevelopers.ts and bespokeCollections.ts.
 */
import { image, link, list, text, textarea, upload, type Cta } from "../model.ts";

export const CATALOGUE_PATH = "/catalogue/";
export const QUOTE_PATH = "/get-a-quote-for-custom-made-furniture-in-lagos/";

const consultation: Cta = { label: "Book a consultation", href: QUOTE_PATH };
const catalogue: Cta = { label: "Download Catalogue", href: CATALOGUE_PATH };
const none: Cta = { label: "", href: "" };
const lines = "One item per line.";

type Series = { eyebrow: string; title: string; text: string; prices: string; includes: string; image: string; cta: Cta };

/** Copy that differs between the two pages */
export type CollectionsCopy = {
	audience: string;
	heroText: string;
	introText: string;
	collectionsTitle: string;
	collectionsText: string;
	offerTitle: string;
	offerText: string;
	offerPoints: string[];
	offerCta: Cta;
	pricingText: string;
	series: Series[];
	tiersText: string;
	joinTitle: string;
	joinText: string;
};

export const collectionsLandingFields = (copy: CollectionsCopy) => ({
	heroEyebrow: text("Hero: label", "Bespoke Furniture Collections for"),
	heroTitle: text("Hero: title", copy.audience),
	heroText: textarea("Hero: text", copy.heroText),
	heroImage: image("Hero: image", upload("Majeurs-the-top-furniture-brand-in-Lagos-Nigeria-1.webp")),
	heroCtas: list("Hero: buttons", { cta: link("Button") }, [{ cta: { label: "Download the Brochure", href: CATALOGUE_PATH } }, { cta: consultation }]),

	introTitle: text("Intro: title", "Looking for a furniture manufacturer to help bring your interior design ideas to life"),
	introText: textarea("Intro: text", copy.introText),
	introImage: image("Intro: image", upload("Looking-for-a-furniture-manufacturer-to-help-bring-your-interior-design-ideas-to-life.webp")),
	introImageAlt: text("Intro: image description", "A tablet showing an interior render among fabric and colour swatches", "Alt text for screen readers"),
	introCta: link("Intro: button", consultation),

	collectionsTitle: text("Collections: title", copy.collectionsTitle),
	collectionsText: textarea("Collections: intro", copy.collectionsText),
	collections: list(
		"Collections",
		{ title: text("Title"), image: image("Image", "", "Square"), cta: link("Button") },
		[
			{ title: "Living room", image: upload("Ayomi_L-Shape_Majeurs_Furnitures_05-1024x1024.webp"), cta: catalogue },
			{ title: "Roots and Reverence", image: upload("Tolu_armchair_Majeurs_Furnitures_06-1024x1024.webp"), cta: catalogue },
			{ title: "Beddings", image: upload("Asamo_Majeurs_Furnitures_05-1024x1024.webp"), cta: catalogue },
			{ title: "Atunlo", image: upload("9-1024x1024.webp"), cta: catalogue },
		],
		{ itemLabel: "collection" },
	),

	offerTitle: text("What we offer: title", copy.offerTitle),
	offerText: textarea("What we offer: text", copy.offerText),
	offerPoints: list(
		"What we offer: points",
		{ point: text("Point") },
		copy.offerPoints.map((point) => ({ point })),
		{ itemLabel: "point" },
	),
	offerImage: image("What we offer: image", upload("Majeurs-offer-interior-designers.webp")),
	offerCta: link("What we offer: button", copy.offerCta, "Leave empty for no button."),

	pricingTitle: text("Pricing: title", "Pricing & Trade Discount Structure"),
	pricingText: textarea("Pricing: intro", copy.pricingText),
	pricesLabel: text("Pricing: price range heading", "Price Range:"),
	includesLabel: text("Pricing: includes heading", "Includes:"),
	series: list(
		"Pricing: series",
		{
			eyebrow: text("Label"),
			title: text("Title"),
			text: textarea("Text"),
			prices: textarea("Price range", "", lines),
			includes: textarea("Includes", "", lines),
			image: image("Image"),
			cta: link("Button", none, "Leave empty for no button."),
		},
		copy.series,
		{ itemLabel: "series" },
	),

	tiersTitle: text("Trade discounts: title", "Trade Discount Structure"),
	tiersText: textarea("Trade discounts: intro", copy.tiersText),
	discountLabel: text("Trade discounts: word after the discount", "discount"),
	tiers: list(
		"Trade discounts: tiers",
		{ discount: text("Discount", "", "e.g. 12-15%"), name: text("Tier"), spend: text("Spend"), perks: textarea("Benefits") },
		[
			{ discount: "5%", name: "Silver Partner", spend: "₦10M+ per year spent", perks: "Priority sampling, faster quotations, access to newer finishes" },
			{ discount: "12-15%", name: "Gold Partner", spend: "₦25M+ per year spent", perks: "Dedicated designer liaison, priority production slot, custom moodboard support" },
			{
				discount: "15-20%",
				name: "Platinum Partner",
				spend: "₦50M+ per year spent",
				perks: "Co-create signature products, annual showroom credit, premium sample box, VIP prototyping",
			},
		],
		{ itemLabel: "tier" },
	),

	warrantyTitle: text("Warranty: title", "Warranty & Aftercare"),
	warrantyText: textarea(
		"Warranty: intro",
		"Every Majeurs piece is built with performance, durability, and craftsmanship in mind. To protect both you and your clients, we offer:",
	),
	warrantyBlocks: list(
		"Warranty: blocks",
		{
			eyebrow: text("Label"),
			image: image("Image"),
			groups: list("Lists", { title: text("Title"), items: textarea("Items", "", lines) }, [], { itemLabel: "list" }),
		},
		[
			{
				eyebrow: "We stand behind every piece we build",
				image: upload("Close-up-picture-of-Majeurs-Umoya-ArmChair.webp"),
				groups: [
					{ title: "Furniture Warranty", items: "1-year structural warranty on all custom furniture\n6-month warranty on upholstery stitching and foam integrity" },
					{ title: "Coverage includes:", items: "Structural failure\nManufacturing defects\nHardware faults" },
					{ title: "Exclusions", items: "Damage due to misuse, spills, pets, or environmental exposure\nThird-party installations\nUnauthorised modifications" },
				],
			},
			{
				eyebrow: "",
				image: upload("close-up-shoot-showing-Majeurs-workman-making-a-marking-on-a-wood-piece.webp"),
				groups: [
					{ title: "Joinery Warranty", items: "1-year warranty on hinges, sliders, internal structures\n3 months on surface scratches or wear from installation" },
					{
						title: "Aftercare Support",
						items: "Optional maintenance package for AirBnb/Show Homes\nFabric and surface cleaning guides\nReplacement parts available on request\nRefinishing or reupholstery service for older pieces",
					},
				],
			},
		],
		{ itemLabel: "block" },
	),

	galleryTitle: text("Crafts gallery: title", "Our Furniture Crafts in Detail"),
	galleryText: textarea("Crafts gallery: intro", "We make your design profitable, predictable, and stress-free."),
	gallery: list(
		"Crafts gallery: images",
		{ image: image("Image", "", "Square") },
		[
			"Waseyi_armchair_Majeurs_Furnitures_02.webp",
			"Nonso_side-table_Majeurs_Furnitures_04.webp",
			"Sodiq_bedroom_Majeurs_Furnitures_01.webp",
			"Ifuna_2-seaters_Majeurs_Furnitures_06.webp",
			"Enonife_armchair_Majeurs_Furnitures_06.webp",
			"Ireti_L-shape_Majeurs_Furnitures_06.webp",
			"dinner-table-5_Majeurs_Furnitures_01.webp",
			"Ayomi_Armchair_Majeurs_Furnitures_06.webp",
			"Eniola_sofa_Majeurs_Furnitures_06.webp",
			"Morire_Arm-chair_Majeurs_Furnitures_06.webp",
			"Durotimi_L-shaped_sofa_Majeurs_Furnitures_01.webp",
			"Yachi_Arm-Chair_Majeurs_Furnitures_07.webp",
		].map((file) => ({ image: upload(file) })),
		{ itemLabel: "image" },
	),
	galleryCta: link("Crafts gallery: button", { label: "See More", href: "/shop/" }),

	trustTitle: text("Trust strip: title", "Trusted by thousands"),
	trust: trustItems(),

	visionTitle: text("Closing: title", "Let’s Bring Your Design Vision to Life"),
	visionText: textarea(
		"Closing: text",
		"Every great interior space starts with a conversation, a straightforward exchange of ideas, materials, sketches, or mood boards. At Majeurs, we transition from concept to beautifully crafted reality: seamless, predictable, and creatively rewarding.",
	),
	visionCta: link("Closing: button", consultation),

	joinTitle: text("Trade program band: title", copy.joinTitle),
	joinText: textarea("Trade program band: text", copy.joinText),
	joinCta: link("Trade program band: button", { label: "Apply for trade access", href: "/majeurs-trade-program/#tradeProgramForm" }),
});

/** "Trusted by thousands" strip (also on For Interior Designers); icons stay in code, in this order */
export const trustItems = () =>
	list(
		"Trust strip: items",
		{ title: text("Title"), text: textarea("Text") },
		[
			{ title: "Loved by Customers", text: "Join thousands of satisfied customers who trust us for timeless, quality furniture." },
			{ title: "Fast Shipping", text: "Delivered by our own team, with shipping costs confirmed up front, before you pay." },
			{ title: "Guaranteed Quality", text: "Every piece is designed to last and is backed by our satisfaction guarantee for peace of mind." },
			{ title: "24/7 Support", text: "Our dedicated customer support team is available 24/7 to assist you with any questions." },
		],
		{ itemLabel: "item", instructions: "Four items; the icons follow this order (people, delivery van, badge, phone)." },
	);
