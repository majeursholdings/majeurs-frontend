import { definePage, upload } from "../model.ts";
import { collectionsLandingFields } from "./collectionsLanding.ts";

export const bespokeCollections = definePage({
	id: "bespokeCollections",
	wpId: 3616,
	path: "/bespoke-furniture-collections-for-interior-designers/",
	title: "Bespoke Collections for Interior Designers page content",
	fields: collectionsLandingFields({
		audience: "Interior Designers",
		heroText:
			"Whether you're styling a residential apartment, a boutique hotel, a corporate space, or a luxury show home, Majeurs offers bespoke furniture collections for interior designers and designer-focused support: material libraries, finish samples, 3D integration, and a production workflow that protects your creative integrity from concept to installation.",
		introText:
			"Every interior designer knows the frustration of seeing a perfect concept compromised by poor craftsmanship, limited material options, or unreliable local suppliers. At Majeurs, we exist to bridge that gap, turning your ideas, mood boards, and digital renders into precise, beautifully crafted furniture that elevates the spaces you design.",
		collectionsTitle: "Our frontline Furniture Collections for Interior designers",
		collectionsText: "Majeurs Furniture has unique furniture collections for interior designers.",
		offerTitle: "What does Majeurs offer interior designers?",
		offerText:
			"With 14+ years of manufacturing experience, eco-conscious standards, and an advanced prototyping process, we collaborate with designers to deliver custom pieces that honour your aesthetic vision while meeting your budget and timeline.",
		offerPoints: [
			"A full material & finish library",
			"Custom detailing (metal inlays, upholstery stitching, veneer matching)",
			"3D-ready models for your design software",
			"Fast prototyping and sample approval",
			"On-site measurement & installation support",
			"Sustainable manufacturing options for eco-conscious projects",
		],
		offerCta: { label: "", href: "" },
		pricingText:
			"Interior designers work across varying client budgets, materials, and project scopes. Our pricing structure is designed to give you creative freedom, clear cost expectations, and preferential trade benefits that reward long-term collaboration.",
		series: [
			{
				eyebrow: "Budget-Friendly, High Quality",
				title: "Essential Series",
				text: "Perfect for mid-range residential projects, short-lets, student housing, or AirBnB setups.",
				prices: "₦350,000 – ₦700,000 per room set\n₦120,000 – ₦350,000 per piece (small furniture)",
				includes: "MDF + laminate or textured board\nStandard joinery\nDurable fabrics and clean, modern silhouettes",
				image: upload("EZIGBO-The-Deal-Collection.webp"),
				cta: { label: "", href: "" },
			},
			{
				eyebrow: "Mid–High End, Design-Driven",
				title: "Signature Series",
				text: "Ideal for stylish homes, corporate apartments, boutique hotels, and show houses.",
				prices: "₦1.2M – ₦5.3M per room set\n₦250,000 – ₦850,000 per piece",
				includes: "Veneer finishes, boucle/velvet upholstery\nModern trims, soft-close hardware\nRich textures and premium craftsmanship",
				image: upload("Majeurs-Umoya-ArmChair.webp"),
				cta: { label: "", href: "" },
			},
			{
				eyebrow: "Luxury Custom Creations",
				title: "Bespoke Series",
				text: "For designers working on penthouses, luxury hotels, or high-net-worth private clients.",
				prices: "₦1.2M – ₦6M+ per room set\n₦650,000 – ₦2.5M+ per piece",
				includes: "Solid wood, marble, high-gloss lacquer\nCustom metalwork, LED accents\nSculptural forms, handcrafted detailing",
				image: upload("Ewa-The-Deal-Collection.webp"),
				cta: { label: "", href: "" },
			},
		],
		tiersText:
			"To support our interior designers' growth and reward you for choosing Majeurs, we offer an official Designer Trade Program with tiered benefits. The more projects you execute, the more advantages you unlock.",
		joinTitle: "Join Our Designer Partnership Programme.",
		joinText:
			"Apply once for tiered trade discounts of up to 20%, priority sampling and faster quotations, with more benefits as your projects with Majeurs grow.",
	}),
});
