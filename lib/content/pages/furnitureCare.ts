import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

export const furnitureCare = definePage({
	id: "furnitureCare",
	wpId: 74,
	path: "/furniture-care-service/",
	title: "Furniture restoration page content",
	fields: {
		seoTitle: text("SEO: title", "Furniture Restoration & Repair in Lagos", "Browser tab and search results, until Rank Math's headless endpoint is on"),
		seoDescription: textarea(
			"SEO: description",
			"Sofa reupholstery, frame and joinery repair, wood refinishing and foam replacement by Majeurs craftsmen in Lagos. Send photos for a free quote.",
		),

		heroEyebrow: text("Hero: label", "Furniture restoration in Lagos"),
		heroTitle: text("Hero: title", "Bring your furniture back to life"),
		heroText: text("Hero: text", "Repair, reupholstery and refinishing by the craftsmen who build Majeurs furniture."),
		heroImage: image("Hero: image", upload("contact-majeurs-furniture-brand-lagos-nigeria.webp")),
		heroCta: link("Hero: button", { label: "Get a free quote", href: "#repair" }, "#repair jumps to the form"),

		videoId: text("Video: YouTube video ID", "gweTL08_VEU", "The part after watch?v= in the YouTube link"),
		videoTitle: text("Video: title", "Majeurs furniture restoration", "Read out by screen readers"),
		introEyebrow: text("Intro: label", "Why restore"),
		introTitle: text("Intro: title", "Keep the piece you love, make it feel new"),
		introText: textarea(
			"Intro: text",
			"A sagging sofa, a wobbly chair or a worn finish doesn’t mean it’s time to replace your furniture. Good frames are worth saving, and restoring one usually costs less than buying new.\n\nOur specialists rebuild what’s broken, reshape what has lost its form and refinish what has faded, keeping the wood quality and material density that made the piece last in the first place. You get furniture that looks, feels and sits like new, in your home or office again.",
		),
		introCta: link("Intro: button", { label: "Request a restoration quote", href: "#repair" }, "#repair jumps to the form below"),

		servicesEyebrow: text("Services: label", "What we restore"),
		servicesTitle: text("Services: title", "Furniture restoration services"),
		servicesText: textarea("Services: intro", "From a single dining chair to a full office of seating, we handle the work in our Lagos workshop."),
		services: list(
			"Services",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "Sofa reupholstery", text: "New leather, velvet or fabric on your existing frame, cut and fitted by hand." },
				{ title: "Foam and cushion replacement", text: "Fresh, high-density foam to fix sagging seats and flat cushions." },
				{ title: "Frame and joinery repair", text: "Broken legs, loose joints and cracked frames rebuilt to be solid again." },
				{ title: "Wood refinishing", text: "Scratches, stains and faded finishes sanded back and refinished." },
				{ title: "Reshaping and remakes", text: "Change the shape, size or style of a piece to suit a new space." },
				{ title: "Leather and velvet restoration", text: "Worn, marked or faded upholstery cleaned, repaired and revived." },
			],
			{ itemLabel: "service" },
		),

		stepsEyebrow: text("Process: label", "How it works"),
		stepsTitle: text("Process: title", "From worn to restored in four steps"),
		steps: list(
			"Process: steps",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "Send photos", text: "Fill in the form below with photos of your piece and what needs fixing." },
				{ title: "Get your quote", text: "We assess the work and send you a price and timeline." },
				{ title: "We restore it", text: "Our craftsmen repair, reupholster or refinish your piece in our workshop." },
				{ title: "Enjoy it again", text: "Your furniture comes back ready to use for years to come." },
			],
			{ itemLabel: "step" },
		),

		factsEyebrow: text("Facts: label", "Proven results"),
		factsTitle: text("Facts: title", "Trusted by homes and businesses across Lagos"),
		facts: list(
			"Facts",
			{ value: text("Figure"), label: text("Label") },
			[
				{ value: "4300+", label: "Pieces restored" },
				{ value: "170+", label: "Satisfied customers" },
				{ value: "73", label: "Business customers" },
				{ value: "13", label: "Restoration specialists" },
			],
			{ itemLabel: "fact" },
		),

		faqEyebrow: text("FAQs: label", "Questions"),
		faqTitle: text("FAQs: title", "Furniture restoration FAQs"),
		faqs: list(
			"FAQs",
			{ q: text("Question"), a: textarea("Answer") },
			[
				{
					q: "Is it worth restoring my old sofa instead of buying a new one?",
					a: "If the frame is solid, usually yes. Reupholstery and new foam give you a sofa that feels new, often for less than replacing it, and you keep a piece that already fits your space.",
				},
				{
					q: "How much does furniture restoration cost?",
					a: "It depends on the piece, its condition and the materials you choose. Send photos through the form and we’ll give you a quote before any work starts.",
				},
				{
					q: "How long does a restoration take?",
					a: "Timelines depend on the work needed. We include one with your quote, so you know when to expect your piece back.",
				},
				{
					q: "Can I choose a new fabric or colour?",
					a: "Yes. Choose from our leathers, velvets and upholstery fabrics, and we’ll help you match colour and texture to your space.",
				},
				{
					q: "My Majeurs piece has a fault. Is the repair covered?",
					a: "Manufacturing faults, material defects and workmanship issues are covered by our 12-month warranty. Outside the warranty, we offer paid repairs and replacement parts.",
				},
			],
			{ itemLabel: "question" },
		),
		faqCta: link("FAQs: link", { label: "Read the warranty policy", href: "/warranty-policy/" }),

		formTitle: text("Form: title", "Tell us about your piece"),
		formIntro: textarea("Form: intro", "Share photos and a few details. Our restoration team will reply with a quote and next steps."),
	},
});
