import { definePage, image, link, text, textarea, upload } from "../model.ts";

/** "Dimensions · Finishes · Timeline" intro, the default on both the custom request and quote pages */
export const bespokeIntro =
	"Tell us about your bespoke furniture or interior project. Share dimensions, materials, finishes and delivery window. We’ll scope options, align on budget and propose a sustainable, high-quality build plan.";

export const customRequest = definePage({
	id: "customRequest",
	wpId: 1264,
	path: "/custom-made-furniture-in-lagos/",
	title: "Custom request page content",
	fields: {
		heroTitle: text("Hero: title", "Custom Request"),
		heroText: text("Hero: text", "Complete your dream home with your dream furniture style"),
		heroImage: image("Hero: image", upload("Demi-Samande-of-Majeurs-working-on-a-furniture-product-sketch.webp")),

		introTitle: text("Intro: title", "Custom made Furniture"),
		introText: textarea(
			"Intro: text",
			"Have an idea for your space? Let’s build it, from first sketch to final detail. Majeurs is the best custom-made furniture manufacturer in Lagos, Nigeria. Majeurs specializes in custom-made built-in furniture. From your long sofa chairs to full office furniture sets, home offices, bedroom furniture sets, kitchens, and more. Everything is tailored to fit your space and your style.\n\nWe offer fine carpentry and renovation work for homes, offices, hotels, and shops. Whether you already have a plan or just a rough idea, we’ll help you bring it to life.",
		),
		introImage: image("Intro: image", upload("Majeurs-workman-actively-working-on-a-Atunlo-collection-design.webp")),
		introImageAlt: text("Intro: image description", "A Majeurs craftsman working on an Atunlo collection piece", "Alt text for screen readers"),
		introCta: link("Intro: request button", { label: "Submit request", href: "#request" }, "#request jumps to the form below"),
		whatsappLabel: text("Intro: WhatsApp button", "Contact support"),
		whatsappMessage: text("Intro: WhatsApp message", "Hello Majeurs, I'd like to talk about a custom furniture project.", "Pre-filled in the WhatsApp chat the button opens"),

		formTitle: text("Form: title", "Dimensions · Finishes · Timeline"),
		formIntro: textarea("Form: intro", bespokeIntro),
	},
});
