import { definePage, upload } from "../model.ts";
import { CATALOGUE_PATH, collectionsLandingFields } from "./collectionsLanding.ts";

const brochure = { label: "Download Brochure to learn more", href: CATALOGUE_PATH };

export const forDevelopers = definePage({
	id: "forDevelopers",
	wpId: 86,
	path: "/for-developers/",
	title: "For Architects and Developers page content",
	fields: collectionsLandingFields({
		audience: "Architects and Developers",
		heroText:
			"Whether you’re developing residential estates, corporate offices, or mixed-use properties, Majeurs offers end-to-end furnishing solutions that reduce procurement stress, improve delivery speed, and elevate the perceived value of your developments.",
		introText:
			"Every architect and developer knows the frustration of seeing a perfect concept compromised by poor craftsmanship, limited material options, or unreliable local suppliers. At Majeurs, we exist to bridge that gap, turning your ideas, mood boards, and digital renders into precise, beautifully crafted furniture that elevates the spaces you design.",
		collectionsTitle: "Our frontline Furniture Collections for architects and Developers",
		collectionsText: "Majeurs Furniture has unique furniture collections for architects and developers.",
		offerTitle: "What does Majeurs offer architects & Developers?",
		offerText:
			"At Majeurs, our product philosophy is built around three principles: durability, scalability, and timeless design.\n\nFor developers, this translates into solutions that don’t just fill a space; they add measurable value to every square metre of your development. Whether outfitting an entire residential estate, a corporate office tower, or a mixed-use development, Majeurs delivers end-to-end furnishing systems designed to align with your vision, budget, and timelines.",
		offerPoints: [],
		offerCta: brochure,
		pricingText:
			"Developments vary in budget, unit mix and finish level. Our pricing structure gives you clear per-room costs, from efficiency apartments to executive suites, and preferential trade benefits that reward long-term collaboration.",
		series: [
			{
				eyebrow: "Budget-Friendly, High Quality",
				title: "Essential Series",
				text: "Should hit a sweet spot and get your project up and moving. Functional, durable, and attractive, without the frills of custom design or imported luxury finishes.",
				prices:
					"Bedroom (₦200,000–₦530,000 per room total)\nLiving Room (₦250,000–₦350,000 total)\nDining Area (₦180,000–₦300,000 total)\nStudy / Work Area (₦120,000–₦250,000 total)",
				includes: "Covers all essential furniture\nExcludes decor, curtains, lighting (sold separately)\nTarget: efficiency apartments or standard room fit-outs",
				image: upload("EZIGBO-The-Deal-Collection.webp"),
				cta: brochure,
			},
			{
				eyebrow: "Mid–High End, Design-Driven",
				title: "Signature Series",
				text: "The Signature Series embodies the balance between form and function, designed for developers who demand sophistication without the inflated cost or delays of imports.",
				prices:
					"Bedroom (₦500,000–₦900,000 per room total)\nLiving Room (₦580,000–₦900,000 total)\nDining Area (₦400,000–₦700,000 total)\nWork / Study Area (₦250,000–₦450,000 total)",
				includes: "Full executive bedroom setup\nOptional LED accent lighting or built-in sockets\nRicher textures, cohesive design, coordinated sets",
				image: upload("Majeurs-Umoya-ArmChair.webp"),
				cta: brochure,
			},
			{
				eyebrow: "Luxury Custom Creations",
				title: "Bespoke Series",
				text: "The Bespoke Series represents the pinnacle of Majeurs’ craftsmanship, where every curve, texture, and joint tells a story of mastery. Each collection is made-to-order, designed collaboratively with the developer’s architects and interior designers, and hand-finished by our most skilled artisans. This is not mass production, it’s curated manufacturing, made for those who build to inspire.",
				prices:
					"Bedroom Suites (₦1.2M–₦2.5M+ per room)\nLiving Room Suites (₦1.5M–₦3M+)\nDining & Lounge Areas (₦1M–₦3M+)\nExecutive & Commercial Suites (₦2.5M–₦6M+)",
				includes: "Solid wood, marble, high-gloss lacquer\nCustom metalwork, LED accents\nSculptural forms, handcrafted detailing",
				image: upload("Ewa-The-Deal-Collection.webp"),
				cta: brochure,
			},
		],
		tiersText:
			"To reward architects and developers for choosing Majeurs, we offer an official Trade Program with tiered benefits. The more projects you execute, the more advantages you unlock.",
		joinTitle: "Join the Majeurs Trade Program",
		joinText:
			"Register your firm once for tiered trade discounts of up to 20%, priority sampling and faster quotations, with more benefits as your developments with Majeurs grow.",
	}),
});
