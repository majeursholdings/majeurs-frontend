import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

export const about = definePage({
	id: "about",
	wpId: 70,
	path: "/about-majeurs-holdings/",
	title: "About page content",
	fields: {
		heroTitle: text("Hero title", "About Majeurs Holdings"),
		heroText: textarea("Hero text", "Founded in London in 2010 and rooted in Lagos since 2016, Majeurs makes furniture that improves with use."),
		heroImage: image("Hero image", upload("Close-up-picture-of-Demi-Samande-of-Majeurs-working-on-a-furniture-product-sketch.webp")),

		aboutTitle: text("About: title", "About Majeurs"),
		aboutText: textarea(
			"About: text",
			"Majeurs Holdings is a Lagos-based furniture house built on three pillars: Craft, Technology and Sustainability. We design and make handcrafted furniture under the Majeurs brand, power a growing community of independent furniture makers through MANDE, and turn our own workshop off-cuts into homeware with Àtúnlo. Everything we do works toward one goal: proving that furniture made in Africa can meet, and set, global standards.",
		),
		aboutImage: image("About: image", upload("Majeurs-furniture-workman-working-on-a-wood-piece.webp")),

		storyTitle: text("Our story: title", "Our Story"),
		storyText: textarea(
			"Our story: text",
			"We started as furniture restorers, and the pieces we repaired taught us how good materials and honest joinery age. That respect still shapes everything we make. Today we pair artisan skill with modern production systems and circular thinking, so every piece is built well, delivered on time and made responsibly, while creating skilled jobs in Lagos.",
		),
		storyImage: image("Our story: image", upload("Demi-Samande-of-Majeurs-working-on-a-furniture-product-sketch.webp")),

		values: list(
			"Mission and vision",
			{ eyebrow: text("Label"), title: text("Title"), text: textarea("Text"), image: image("Image") },
			[
				{
					eyebrow: "Mission",
					title: "Revolutionise Furniture Manufacturing",
					text: "Bring craftsmanship, technology and sustainability together so African makers can produce at global standards, with traceability, efficiency and pride in every piece.",
					image: upload("The-Atunlo-collection-sketch-work-done-by-Demi-Samande.webp"),
				},
				{
					eyebrow: "Vision",
					title: "Africa Competing on the World Stage",
					text: "A new era of African manufacturing, where local talent and businesses scale globally without compromising on quality or the planet.",
					image: upload("Soft-touch-of-Majeurs-Umoya-ArmChair.webp"),
				},
			],
			{ itemLabel: "statement" },
		),

		pillarsEyebrow: text("Pillars: label", "Our Pillars"),
		pillarsTitle: text("Pillars: title", "Craft. Technology. Sustainability."),
		pillarsText: textarea("Pillars: intro", "Three parts of one business, each built to raise the standard of furniture made in Africa."),
		pillars: list(
			"Pillars",
			{ eyebrow: text("Label"), title: text("Title"), text: textarea("Text"), image: image("Image"), cta: link("Button") },
			[
				{
					eyebrow: "Craft",
					title: "Majeurs Furniture",
					text: "Handcrafted furniture designed and made in our Lagos workshop, with solid materials, honest joinery and finishes built to age beautifully. Every piece is made to order, with custom sizes and fabrics available, and our six-month Majeurs Academy trains the artisans behind it.",
					image: upload("close-up-shoot-showing-Majeurs-workman-working-on-a-wood-piece.webp"),
					cta: { label: "Shop the collection", href: "/shop/" },
				},
				{
					eyebrow: "Technology",
					title: "MANDE",
					text: "A community of furniture makers with shared access to industrial machinery, a CAD and tech suite, a material library, mentorship and business coaching, backed by a staged, photo-documented payment system that builds trust between makers and their clients.",
					image: upload("Majeurs-Academy-students-learningf-from-their-instructor.webp"),
					cta: { label: "Explore MANDE", href: "/mande/" },
				},
				{
					eyebrow: "Sustainability",
					title: "Àtúnlo",
					text: "Nothing of value is wasted. Àtúnlo turns reclaimed timber off-cuts from our workshop into handcrafted bowls, trays, stools and serveware, keeping material at its highest value. The collection supports UN Sustainable Development Goal 12, Responsible Consumption and Production, and creates skilled local jobs along the way.",
					image: upload("Atunlo-Collection-SetUp-1024x683.webp"),
					cta: { label: "Discover Àtúnlo", href: "https://atunlo.majeurs.com/?referral=majeurs-about", external: true },
				},
			],
			{ itemLabel: "pillar" },
		),

		tradeEyebrow: text("Trade program: label", "The Majeurs Trade Program"),
		tradeTitle: text("Trade program: title", "Up to 20% trade discount for industry professionals"),
		tradeText: textarea(
			"Trade program: text",
			"Open to architects, interior designers, property developers, hoteliers, procurement teams and project managers. Trade members work directly with our Lagos workshop and get custom dimensions, material and finish flexibility, coordinated production timelines and a dedicated project contact, with discounts that grow with your annual spend.",
		),
		tradeImage: image("Trade program: image", upload("For-interior-designers-designers-architects-and-FFE-specifiers-1024x765.webp")),
		tradeTiers: list(
			"Trade program: tiers",
			{ name: text("Tier"), discount: text("Discount"), spend: text("Spend") },
			[
				{ name: "Silver", discount: "5% off", spend: "From ₦10M annual spend" },
				{ name: "Gold", discount: "12–15% off", spend: "From ₦25M annual spend" },
				{ name: "Platinum", discount: "15–20% off", spend: "From ₦50M annual spend" },
			],
			{ itemLabel: "tier" },
		),
		tradeCtas: list("Trade program: buttons", { cta: link("Button") }, [
			{ cta: { label: "Join the Trade Program", href: "/majeurs-trade-program/#tradeProgramForm" } },
			{ cta: { label: "See full trade benefits", href: "/majeurs-trade-program/" } },
		]),

		people: list(
			"Leadership and careers cards",
			{ title: text("Title"), image: image("Image"), cta: link("Button") },
			[
				{ title: "Our Leadership", image: upload("Demi-Samande-Majeurs-Holdings.webp"), cta: { label: "View Leadership", href: "/majeurs-leadership/" } },
				{ title: "Career", image: upload("The-Majeurs-Academy-Program-Guarantee-1024x683.webp"), cta: { label: "Join Us", href: "/career/" } },
			],
			{ itemLabel: "card" },
		),

		projectsEyebrow: text("Projects: label", "Our Projects"),
		projectsTitle: text("Projects: title", "Spaces we have designed, made and installed"),
		projectsText: textarea(
			"Projects: intro",
			"From members’ clubs to full commercial fit-outs, we take projects from first drawing to final installation, with every piece made in our Lagos workshop.",
		),
		projects: list(
			"Projects",
			{ eyebrow: text("Label", "", "e.g. Hospitality · Lagos · 2022"), title: text("Title"), text: textarea("Text"), image: image("Image"), cta: link("Button") },
			[
				{
					eyebrow: "Hospitality · Lagos · 2022",
					title: "GAIA Africa Lounge",
					text: "The lounge for GAIA Africa, a private members’ business club for women in Lagos. We designed and furnished its seating zones, bar and drinks station.",
					image: upload("Gaia-Africa-Lounge-Area-1024x1024.webp"),
					cta: { label: "View project", href: "/project/gaia-africa-lounge-area/" },
				},
				{
					eyebrow: "Commercial · Lagos",
					title: "Gerrard Holdings",
					text: "A complete turnkey commercial interior, designed, manufactured and installed by Majeurs from start to finish.",
					image: upload("A-complete-turnkey-commercial-interior-1024x765.webp"),
					cta: { label: "Discuss a similar project", href: "/get-a-quote-for-custom-made-furniture-in-lagos/" },
				},
			],
			{ itemLabel: "project" },
		),

		ctaImage: image("Closing banner: image", upload("Close-up-picture-of-Demi-Samande-of-Majeurs-working-on-a-furniture-product-sketch.webp")),
	},
});
