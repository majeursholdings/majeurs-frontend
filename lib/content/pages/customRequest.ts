import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

/** "Dimensions · Finishes · Timeline" intro on the quote page */
export const bespokeIntro =
	"Tell us about your bespoke furniture or interior project. Share dimensions, materials, finishes and delivery window. We’ll scope options, align on budget and propose a sustainable, high-quality build plan.";

const card = { title: text("Title"), text: textarea("Text") };

export const customRequest = definePage({
	id: "customRequest",
	wpId: 1264,
	path: "/custom-made-furniture-in-lagos/",
	title: "Custom request page content",
	fields: {
		heroEyebrow: text("Hero: label", "Made to order in Lagos"),
		heroTitle: text("Hero: title", "Custom-made furniture"),
		heroText: text("Hero: text", "Designed around your space, built by hand in our Lagos workshop."),
		heroImage: image("Hero: image", upload("Demi-Samande-of-Majeurs-working-on-a-furniture-product-sketch.webp")),

		quoteLabel: text("Quote button", "Get a quote", "Opens the quote form in a pop-up. Used by every quote button on the page."),
		quoteTitle: text("Quote pop-up: title", "Tell us about your project"),
		quoteText: textarea("Quote pop-up: intro", "Share what you need, where it’s going and when. We reply within 24 hours."),

		introEyebrow: text("Intro: label", "Bespoke furniture & fit-outs"),
		introTitle: text("Intro: title", "From first sketch to final detail"),
		introText: textarea(
			"Intro: text",
			"Bring us a plan, a photo or a rough idea. We design and build furniture that fits your space exactly: sofas of any length, bedroom sets, kitchens, home offices and full office fit-outs.\n\nOur carpenters and upholsterers also handle built-in joinery and renovation work for homes, offices, hotels and shops.",
		),
		introImage: image("Intro: image", upload("Majeurs-workman-actively-working-on-a-Atunlo-collection-design.webp")),
		introImageAlt: text("Intro: image description", "A Majeurs craftsman working on an Atunlo collection piece", "Alt text for screen readers"),
		whatsappLabel: text("Intro: WhatsApp button", "Chat on WhatsApp"),
		whatsappMessage: text("Intro: WhatsApp message", "Hello Majeurs, I'd like to talk about a custom furniture project.", "Pre-filled in the WhatsApp chat the button opens"),

		stepsEyebrow: text("Process: label", "How it works"),
		stepsTitle: text("Process: title", "Four steps to your piece"),
		steps: list(
			"Process: steps",
			card,
			[
				{ title: "Share your brief", text: "Tell us what you need, with dimensions, photos or sketches if you have them." },
				{ title: "Design and quote", text: "We propose materials, finishes and a price, and refine the design with you." },
				{ title: "Handmade in Lagos", text: "Our craftsmen build your piece to order in our own workshop." },
				{ title: "Delivery and installation", text: "We deliver, install and hand over your warranty certificate." },
			],
			{ itemLabel: "step" },
		),

		assuranceEyebrow: text("Assurance: label", "Made to last"),
		assuranceTitle: text("Assurance: title", "Every custom piece comes with"),
		warrantyTitle: text("Warranty card: title", "A 12-month warranty"),
		warrantyText: textarea("Warranty card: text", "Covers manufacturing faults, material defects and workmanship from the day of delivery or installation."),
		warrantyPoints: list("Warranty card: points", { text: text("Point") }, [{ text: "Frame and joinery: 12 months" }, { text: "Upholstery stitching: 6 months" }, { text: "Treated against pests before delivery" }], { itemLabel: "point" }),
		warrantyCta: link("Warranty card: link", { label: "Read the warranty policy", href: "/warranty-policy/" }),
		materialsTitle: text("Materials card: title", "Materials you choose"),
		materialsText: textarea("Materials card: text", "Pick the leather, velvet or upholstery fabric that suits how you live. We help you match colour and texture to your space."),
		materialsPoints: list("Materials card: points", { text: text("Point") }, [{ text: "Genuine leather" }, { text: "Velvet" }, { text: "Jacquards and textured weaves" }], { itemLabel: "point" }),
		materialsCta: link("Materials card: link", { label: "Explore our materials", href: "/materials-and-care/" }),
		careTitle: text("Care card: title", "Care after delivery"),
		careText: textarea("Care card: text", "Simple habits keep your piece looking new, and our repair team is here when it needs more."),
		carePoints: list("Care card: points", { text: text("Point") }, [{ text: "Keep it out of direct sun and heat" }, { text: "Blot spills, never rub" }, { text: "Rotate cushions every week or two" }], { itemLabel: "point" }),
		careCta: link("Care card: link", { label: "See repair and restoration", href: "/furniture-care-service/" }),

		closingTitle: text("Closing banner: title", "Ready to start your piece?"),
		closingText: textarea("Closing banner: text", "Send us your brief. A designer will reply within 24 hours to talk through options and pricing."),
		closingImage: image("Closing banner: image", upload("Demi-Samande-of-Majeurs-working-on-a-furniture-product-sketch.webp")),
	},
});
