import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

const member = { name: text("Name"), focus: textarea("Focus"), image: image("Photo") };

export const leadership = definePage({
	id: "leadership",
	wpId: 988,
	path: "/majeurs-leadership/",
	title: "Majeurs Leadership page content",
	fields: {
		heroTitle: text("Hero: title", "Majeurs Leadership"),
		heroText: textarea(
			"Hero: text",
			"CEO and Founder Demi Samande leads Majeurs Leadership, supported by a board with strong experience in brand, venture growth, operations, and talent. Majeurs pairs craftsmanship with technology to build resilient, sustainable manufacturing.",
		),
		heroImage: image("Hero: image", upload("majeurs-leadership.webp")),

		founderImage: image("Founder: photo", upload("Demi-Samande-Majeurs-Holdings.webp")),
		founderImageAlt: text("Founder: photo description", "Demi Samande, CEO & Founder of Majeurs"),
		founderName: text("Founder: name", "Demi Samande"),
		founderRole: text("Founder: role", "CEO & Founder"),
		founderBio: textarea(
			"Founder: bio",
			"Manufacturing innovation, artisan empowerment and sustainable enterprise. Demi founded Majeurs in London (2010) and expanded operations to Lagos (2016), shaping a model where local craftsmanship meets modern systems. With Mande — our vertical-integration platform — and the Majeurs Academy, she champions quality, jobs and resilient supply chains.",
		),

		boardTeamCta: link("Board headers: first link", { label: "Our team", href: "/our-team/" }),
		boardJoinCta: link("Board headers: second link", { label: "Join us", href: "/career/" }),

		academyTitle: text("Academy board: title", "Academy board members"),
		academyBoard: list(
			"Academy board: members",
			member,
			[
				{ name: "Vivienne Ochee-Bamgboye", focus: "Transformation, capacity-building, multi-sectoral expertise.", image: upload("Vivienne-Ochee-Bamgboye.webp") },
				{ name: "Andrea Geday", focus: "Visionary construction leader, quality-first approach.", image: upload("Andrea-Geday.webp") },
				{ name: "Yemi Charles Candide-Johnson", focus: "Legal authority, arbitration, infrastructure advisor.", image: upload("Yemi-Charles-Candide-Johnson.webp") },
				{ name: "Tejumola Abisoye", focus: "Development strategist, youth empowerment, national skill-building.", image: upload("tejumola-abisoye.webp") },
			],
			{ itemLabel: "member" },
		),

		furnitureTitle: text("Furniture board: title", "Furniture board members"),
		furnitureBoard: list(
			"Furniture board: members",
			member,
			[
				{ name: "Toyosi Olatunji", focus: "Growth strategy, operational clarity, adaptive business models.", image: upload("Toyosi-Olatunji.webp") },
				{ name: "Steve Babaeko", focus: "Brand storytelling, African consumer culture, creative engagement.", image: upload("Steve-Babaeko.webp") },
				{ name: "Tiwalola (Abbo D’Léon)", focus: "Data-driven marketing, digital growth, strategic branding.", image: upload("Tiwalola-Abbo-DLeon.webp") },
				{ name: "Eric Idiahi", focus: "Venture scaling, portfolio strategy, sustainable governance.", image: upload("Eric-Idiahi.webp") },
				{ name: "Olumide Adeleye", focus: "Industrial scale, lean systems, manufacturing operations.", image: upload("Olumide-Adeleye.webp") },
				{ name: "Akanimo Ekong PCC", focus: "Talent strategy, team culture, organisational wellbeing.", image: upload("Akanimo-Ekong-PCC.webp") },
				{ name: "Adenike Ogunlesi", focus: "Inclusive manufacturing, entrepreneurship, and apparel innovation.", image: upload("Adenike-Ogunlesi.webp") },
				{ name: "Tosin Oshunkoya", focus: "Private equity, global expansion, investment risk insight.", image: upload("Tosin-Oshunkoya.webp") },
			],
			{ itemLabel: "member" },
		),
	},
});
