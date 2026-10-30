import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

const QUOTE_PATH = "/get-a-quote-for-custom-made-furniture-in-lagos/";
const apply = { label: "Apply for trade access", href: "#apply" };
const discuss = { label: "Discuss your project", href: QUOTE_PATH };

export const tradeProgram = definePage({
	id: "tradeProgram",
	wpId: 6135,
	path: "/majeurs-trade-program/",
	title: "Trade Program page content",
	fields: {
		heroEyebrow: text("Hero: label", "The Majeurs Trade Program"),
		heroTitle: text("Hero: title", "For Professionals Who Specify Furniture, Not Just Select It"),
		heroText: textarea(
			"Hero: text",
			"Architects, interior designers, property developers, hoteliers and procurement teams: this is built for you. Work directly with the manufacturer behind the furniture, with custom dimensions, material and finish flexibility, coordinated production, a dedicated point of contact and trade discounts of up to 20%.",
		),
		heroImage: image("Hero: image", upload("majeurs-trade-programme-bespoke-furniture-specification.webp"), "Also the closing banner's background."),
		heroApply: link("Hero: apply button", apply),
		heroDiscuss: link("Hero: second button", discuss),

		stats: list(
			"Key numbers",
			{ value: text("Number"), label: text("Label") },
			[
				{ value: "Up to 20%", label: "Trade discount, tiered by annual spend" },
				{ value: "3 tiers", label: "Silver, Gold and Platinum partnerships" },
				{ value: "1 contact", label: "A dedicated point of contact for your projects" },
				{ value: "1 year", label: "Structural warranty on custom furniture" },
			],
			{ itemLabel: "number" },
		),

		audiencesEyebrow: text("Who it’s for: label", "Who it’s for"),
		audiencesTitle: text("Who it’s for: title", "Built for the people who specify"),
		audiencesText: textarea(
			"Who it’s for: intro",
			"If your work involves choosing furniture for clients, buildings or guests, the Trade Program gives you manufacturer access without the retail middle step.",
		),
		audiences: list(
			"Who it’s for: professions",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "Architects", text: "Furniture detailed to your drawings, with custom dimensions and finishes that respect the building." },
				{ title: "Interior designers", text: "A full material and finish library, 3D-ready models and fast prototyping for client sign-off." },
				{ title: "Property developers", text: "End-to-end furnishing for estates, show homes and serviced apartments from a single manufacturer." },
				{ title: "Hospitality", text: "Contract furniture for hotels, restaurants, lounges and members’ clubs, built for heavy daily use." },
				{ title: "Procurement teams", text: "Clear quotations, coordinated production timelines and one accountable contact." },
				{ title: "Project managers", text: "Production planned around your project, with on-site measurement and installation support." },
			],
			{ itemLabel: "profession" },
		),

		benefitsImage: image("What you get: image", upload("Looking-for-a-furniture-manufacturer-to-help-bring-your-interior-design-ideas-to-life.webp")),
		benefitsImageAlt: text("What you get: image description", "An interior designer reviewing material samples with Majeurs"),
		benefitsEyebrow: text("What you get: label", "What you get"),
		benefitsTitle: text("What you get: title", "A direct line to the workshop"),
		benefitsText: textarea(
			"What you get: intro",
			"Trade members work with the people who actually make the furniture, so decisions happen faster and nothing gets lost between specification and delivery.",
		),
		benefits: list(
			"What you get: benefits",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "Trade pricing", text: "Up to 20% off, with discounts that grow with your cumulative annual spend." },
				{ title: "Priority lead times", text: "Trade projects move ahead of first-time retail enquiries." },
				{ title: "A dedicated contact", text: "One person who knows your project, from first quotation to installation." },
				{ title: "Made to your spec", text: "Custom dimensions, materials and upholstery, with metal inlays, stitching details and veneer matching." },
				{ title: "Samples and 3D models", text: "Fast prototyping and sample approval, plus 3D-ready models for your design software." },
				{ title: "On-site support", text: "Measurement and installation support, so every piece lands exactly as specified." },
			],
			{ itemLabel: "benefit" },
		),

		tiersEyebrow: text("Partnership tiers: label", "Partnership tiers"),
		tiersTitle: text("Partnership tiers: title", "Rewards that grow with your projects"),
		tiersText: textarea(
			"Partnership tiers: intro",
			"Your tier is set by your cumulative annual spend with Majeurs. Every tier includes a dedicated contact and full access to the Trade Program.",
		),
		tiers: list(
			"Partnership tiers: tiers",
			{
				name: text("Tier"),
				badge: text("Badge", "", "Optional, e.g. Most rewarding. A tier with a badge is highlighted."),
				discount: text("Discount"),
				spend: text("Spend"),
				perks: list("Perks", { perk: text("Perk") }, [], { itemLabel: "perk" }),
			},
			[
				{ name: "Silver", badge: "", discount: "5% off", spend: "From ₦10M annual spend", perks: [{ perk: "Priority sampling" }, { perk: "Faster quotations" }, { perk: "Access to newer finishes" }] },
				{
					name: "Gold",
					badge: "",
					discount: "12–15% off",
					spend: "From ₦25M annual spend",
					perks: [{ perk: "Dedicated designer liaison" }, { perk: "Priority production slots" }, { perk: "Custom moodboard support" }],
				},
				{
					name: "Platinum",
					badge: "Most rewarding",
					discount: "15–20% off",
					spend: "From ₦50M annual spend",
					perks: [{ perk: "Co-create signature products" }, { perk: "Annual showroom credit" }, { perk: "Premium sample box" }, { perk: "VIP prototyping" }],
				},
			],
			{ itemLabel: "tier" },
		),
		tiersApply: link("Partnership tiers: button", apply),

		stepsEyebrow: text("How it works: label", "How it works"),
		stepsTitle: text("How it works: title", "From application to installation"),
		steps: list(
			"How it works: steps",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "Apply", text: "Complete the registration form below with your company details and business licence." },
				{ title: "Review", text: "Our team reviews your details, and a member of the Majeurs team contacts you directly." },
				{ title: "Onboard", text: "Share your project frequency, material preferences and delivery details, and meet your dedicated contact." },
				{ title: "Specify and build", text: "Send your briefs, approve samples and prototypes, and we produce and install to your furniture." },
			],
			{ itemLabel: "step" },
		),

		seriesEyebrow: text("Collections: label", "Collections for every brief"),
		seriesTitle: text("Collections: title", "Three series, one standard of make"),
		seriesText: textarea(
			"Collections: intro",
			"Whether you are furnishing a serviced-apartment block or a single statement suite, every piece is made in our Lagos workshop to the same standard.",
		),
		seriesMaterialsLabel: text("Collections: materials heading", "Materials"),
		series: list(
			"Collections: series",
			{ title: text("Title"), text: textarea("Text"), materials: textarea("Materials") },
			[
				{ title: "Essential Series", text: "For budget-conscious projects and volume fit-outs.", materials: "MDF, laminate, textured board and standard joinery." },
				{ title: "Signature Series", text: "For mid to high-end residential and hospitality interiors.", materials: "Veneer finishes, bouclé and velvet upholstery, soft-close hardware." },
				{ title: "Bespoke Series", text: "For statement pieces and luxury interiors.", materials: "Solid wood, marble, high-gloss lacquer and custom metalwork." },
			],
			{ itemLabel: "series" },
		),
		seriesQuote: link("Collections: first button", { label: "Request a project quote", href: QUOTE_PATH }),
		seriesBrowse: link("Collections: second button", { label: "Browse the catalogue", href: "/shop/" }),

		aftercareEyebrow: text("Aftercare: label", "Aftercare"),
		aftercareTitle: text("Aftercare: title", "Built to last, and backed when it matters"),
		aftercareNote: textarea("Aftercare: small print", "Warranty excludes damage from misuse, pets, spills or unauthorised modifications."),
		aftercare: list(
			"Aftercare: cover",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "1 year · Structure", text: "Structural warranty on all custom furniture." },
				{ title: "6 months · Upholstery", text: "Cover for stitching and foam." },
				{ title: "1 year · Hardware", text: "Hinges and sliders, plus 3 months on surface wear." },
				{ title: "Maintenance packages", text: "Optional care plans for show homes and short-let apartments, with refinishing and replacement parts." },
			],
			{ itemLabel: "item" },
		),

		applyEyebrow: text("Apply: label", "Apply"),
		applyTitle: text("Apply: title", "Apply for trade access"),
		applyText: textarea(
			"Apply: intro",
			"Have your company details and business licence ready (image or PDF, up to 5MB). Our team reviews every application, and a member of the Majeurs team will contact you directly.",
		),

		faqEyebrow: text("FAQ: label", "FAQs"),
		faqTitle: text("FAQ: title", "Questions from the trade"),
		faqText: textarea("FAQ: intro", "Can’t find what you need? Talk to us about your project."),
		faqCta: link("FAQ: button", discuss),
		faqs: list(
			"FAQ: questions",
			{ q: text("Question"), a: textarea("Answer") },
			[
				{
					q: "Who can join the Trade Program?",
					a: "Architects, interior designers, property developers, hospitality designers and operators, procurement teams and project managers. If you specify furniture for clients or projects in another role, choose “Others” on the form and tell us about your work.",
				},
				{
					q: "Is there a minimum spend to join?",
					a: "No. You can register at any stage. Trade discounts then unlock by cumulative annual spend: 5% from ₦10M, 12–15% from ₦25M and 15–20% from ₦50M.",
				},
				{ q: "What do I need to apply?", a: "Your company details and a copy of your business licence or registration, as an image or PDF of up to 5MB." },
				{ q: "What happens after I register?", a: "Our team reviews your details, and a member of the Majeurs team contacts you directly to discuss your project and next steps." },
				{
					q: "Can you make furniture to my drawings?",
					a: "Yes. We work to your dimensions, materials and finishes, including custom detailing such as metal inlays, upholstery stitching and veneer matching. We can also provide 3D-ready models for your design software.",
				},
				{
					q: "Do you offer samples and prototypes?",
					a: "Yes. We offer fast prototyping and sample approval. Silver partners and above get priority sampling, and Platinum partners receive a premium sample box.",
				},
				{
					q: "What warranty comes with trade orders?",
					a: "1 year structural on custom furniture, 6 months on upholstery stitching and foam, 1 year on hinges and sliders and 3 months on surface wear. It excludes misuse, pets, spills and unauthorised modifications.",
				},
			],
			{ itemLabel: "question" },
		),

		insightsEyebrow: text("Insights: label", "Stay updated"),
		insightsTitle: text("Insights: title", "Insights for specifiers", "The three newest posts in the Trade Program category show below."),
		insightsText: textarea("Insights: intro", "Guides and updates for designers, developers and hospitality teams working with Majeurs."),
		insightsCta: link("Insights: button", { label: "Visit the journal", href: "/category/trade-program/" }),

		closingEyebrow: text("Closing banner: label", "Ready when you are"),
		closingTitle: text("Closing banner: title", "Have a project on the table?"),
		closingText: textarea("Closing banner: text", "Tell us what you are working on and we will come back with options, samples and a plan."),
		closingApply: link("Closing banner: first button", apply),
		closingDiscuss: link("Closing banner: second button", discuss),
	},
});
