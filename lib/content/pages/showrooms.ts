import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

/** Addresses from the contact page and the Rank Math local KML (app/(seo)/locations.kml); phone numbers stay in code */
export const showrooms = definePage({
	id: "showrooms",
	wpId: 76,
	path: "/showrooms/",
	title: "Showrooms page content",
	fields: {
		heroTitle: text("Hero: title", "Showrooms"),
		heroText: textarea("Hero: text", "Visit our Lagos showroom and workshop. We welcome visitors by appointment."),

		lagosImage: image("Lagos showroom: image", upload("contact-majeurs-furniture-brand-lagos-nigeria.webp"), "Also the closing banner's background."),
		lagosImageAlt: text("Lagos showroom: image description", "Majeurs showroom in Lagos"),
		lagosEyebrow: text("Lagos showroom: label", "Lagos, Nigeria"),
		lagosName: text("Lagos showroom: title", "Lagos showroom and workshop"),
		lagosStreet: text("Lagos showroom: street", "32, QMB Builders Mart Road, Opposite Elf Bus Stop", "Also used for Get directions and the search engine listing."),
		lagosArea: text("Lagos showroom: area", "Lekki Phase 1, Lagos State, Nigeria"),
		lagosPostcode: text("Lagos showroom: postcode", "105102"),
		lagosHours: text("Lagos showroom: opening note", "Open by appointment only. Book a time and we'll have a specialist ready for you."),
		lagosVisit: link("Lagos showroom: visit button", { label: "Plan a visit", href: "/plan-a-visitation/" }),
		lagosDirections: text("Lagos showroom: directions button", "Get directions", "Opens Google Maps at the address above."),
		lagosWhatsapp: text("Lagos showroom: WhatsApp button", "WhatsApp us"),
		lagosWhatsappMessage: text("Lagos showroom: WhatsApp message", "Hello Majeurs, I'd like to visit your Lagos showroom.", "Filled in when the visitor opens WhatsApp."),

		visitEyebrow: text("Why visit: label", "Why visit"),
		visitTitle: text("Why visit: title", "See it, sit on it, make it yours"),
		visitText: textarea(
			"Why visit: intro",
			"Book a time with our in-store brand specialists, in person or digitally, for styling consultations, shopping advice or a walk-through of our latest collections.",
		),
		visitReasons: list(
			"Why visit: reasons",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "Styling consultations", text: "Bring your floor plan or a few photos and our brand specialists will help you choose pieces, sizes and finishes." },
				{ title: "Shopping advice", text: "Sit on the sofas, feel the leathers, velvets and woven fabrics, and compare finishes side by side." },
				{ title: "A tour of the workshop", text: "See how every piece is made to order in Lagos, from frame and joinery to upholstery." },
			],
			{ itemLabel: "reason" },
		),

		ukImage: image("UK office: image", upload("Demi-Samande-Majeurs-Holdings.webp")),
		ukEyebrow: text("UK office: label", "London, United Kingdom"),
		ukName: text("UK office: title", "United Kingdom office"),
		ukText: textarea(
			"UK office: text",
			"For enquiries from the UK and Europe. Our furniture is made in Lagos and delivered worldwide; get in touch to arrange a consultation.",
		),
		ukAddress: text("UK office: address", "71–75 Shelton Street, Covent Garden, London, WC2H 9JQ"),
		ukCta: link("UK office: button", { label: "Contact us", href: "/contact-majeurs-holdings/" }),
	},
});
