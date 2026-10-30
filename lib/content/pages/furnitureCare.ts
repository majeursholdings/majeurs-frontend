import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

export const furnitureCare = definePage({
	id: "furnitureCare",
	wpId: 74,
	path: "/furniture-care-service/",
	title: "Furniture care page content",
	fields: {
		heroTitle: text("Hero: title", "Furniture Repair Services"),
		heroText: text("Hero: text", "Looking to have your old sofa or furniture fixed or professionally reshaped?"),
		heroImage: image("Hero: image", upload("contact-majeurs-furniture-brand-lagos-nigeria.webp")),

		videoId: text("Video: YouTube video ID", "gweTL08_VEU", "The part after watch?v= in the YouTube link"),
		videoTitle: text("Video: title", "Majeurs furniture repair", "Read out by screen readers"),
		introTitle: text("Intro: title", "Your Furniture, As New Again"),
		introText: textarea(
			"Intro: text",
			"At Majeurs, you've come to the right place for your furniture reshape, fix-up, and complete furniture remake. Our specialists maintain the wood quality, material density, and thorough process planning, giving your furniture a new look, energy, and aesthetics to match your space, home, and office again.",
		),
		introCta: link("Intro: button", { label: "Request a quote now", href: "#repair" }, "#repair jumps to the form below"),

		factsEyebrow: text("Facts: label", "Don't believe us, believe the facts!"),
		factsTitle: text("Facts: title", "The facts say a lot about our services"),
		facts: list(
			"Facts",
			{ value: text("Figure"), label: text("Label") },
			[
				{ value: "170+", label: "Satisfied customers" },
				{ value: "13", label: "Fixers" },
				{ value: "73", label: "Business customers" },
				{ value: "4300+", label: "Furniture like new" },
			],
			{ itemLabel: "fact" },
		),

		formTitle: text("Form: title", "Our sofa fixers are ready to help you"),
		formIntro: textarea("Form: intro", "Book an appointment now or contact us for the furniture remake."),
	},
});
