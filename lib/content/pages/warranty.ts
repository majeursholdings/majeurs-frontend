import { definePage, link, list, rich, text, textarea } from "../model.ts";

const items = (label: string, values: string[], itemLabel = "item") => list(label, { text: text("Text") }, values.map((v) => ({ text: v })), { itemLabel });

export const warranty = definePage({
	id: "warranty",
	wpId: 94,
	path: "/warranty-policy/",
	title: "Warranty Policy page content",
	fields: {
		heroEyebrow: text("Hero: label", "Warranty & after-sales support"),
		heroTitle: text("Hero: title", "A 12-month warranty on every Majeurs piece"),
		heroText: textarea(
			"Hero: text",
			"Every piece is handcrafted to last. If something goes wrong because of how it was made, we’ll make it right. Your warranty runs for 12 months from the day your furniture is delivered or installed.",
		),
		chips: list(
			"Hero: jump links",
			{ cta: link("Link", undefined, "Point at a section on this page: #coverage, #exclusions, #claim or #process.") },
			[
				{ cta: { label: "What’s covered", href: "#coverage" } },
				{ cta: { label: "What’s not covered", href: "#exclusions" } },
				{ cta: { label: "Make a claim", href: "#claim" } },
				{ cta: { label: "What happens next", href: "#process" } },
			],
			{ itemLabel: "link" },
		),
		summary: list(
			"Hero: summary cards",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "12 months", text: "From the date of delivery or installation." },
				{ title: "Faults, materials, workmanship", text: "Covers manufacturing faults, material defects and workmanship issues." },
				{ title: "Repair or replacement", text: "Valid claims are repaired, or parts or the piece replaced." },
			],
			{ itemLabel: "card" },
		),

		coverageEyebrow: text("Coverage: label", "Coverage"),
		coverageTitle: text("Coverage: title", "What your warranty covers"),
		coverageText: textarea(
			"Coverage: intro",
			"Majeurs provides warranty support for defects caused by manufacturing faults, material defects or workmanship issues. Coverage depends on the part of the piece:",
		),
		coverageHeadPart: text("Coverage: table first heading", "Part"),
		coverageHeadCover: text("Coverage: table second heading", "Warranty coverage"),
		coverage: list(
			"Coverage: table rows",
			{ part: text("Part"), cover: text("Warranty coverage") },
			[
				{ part: "Furniture structure (frame and joinery)", cover: "12 months" },
				{ part: "Upholstery stitching", cover: "6 months" },
				{ part: "Hardware (hinges, runners, fittings)", cover: "Manufacturer’s warranty, up to 12 months where applicable" },
				{ part: "Finishes and coatings", cover: "Limited warranty, up to 12 months where applicable" },
			],
			{ itemLabel: "row" },
		),
		coverageNote: textarea(
			"Coverage: small print",
			"Where a component carries its own manufacturer’s warranty, that warranty applies within the 12-month period. Your exact start and expiry dates are on your warranty certificate.",
		),
		coveragePests: textarea(
			"Coverage: pest note",
			"Every Majeurs piece is treated against pests before delivery. To protect your furniture, avoid prolonged exposure to pests, as long-term exposure can cause lasting damage.",
		),

		validEyebrow: text("Eligibility: label", "Eligibility"),
		validTitle: text("Eligibility: title", "When a claim is valid"),
		valid: items("Eligibility: conditions", [
			"The defect appeared within the 12-month warranty period.",
			"The Majeurs tag is still on the piece.",
			"The defect comes from a manufacturing or material failure.",
			"The piece has been used and cared for under normal conditions.",
		], "condition"),
		validNote: rich(
			"Eligibility: small print",
			`<p>Keep the Majeurs tag attached and follow our <a href="/materials-and-care/">material &amp; care guide</a> to keep your warranty valid.</p>`,
		),

		excludedEyebrow: text("Exclusions: label", "Exclusions"),
		excludedTitle: text("Exclusions: title", "What’s not covered"),
		excluded: items("Exclusions: list", [
			"Accidental damage",
			"Misuse or abuse",
			"Modifications or repairs by third parties",
			"Improper handling after delivery",
			"Exposure to extreme conditions, such as water, fire or excessive weight",
			"Normal wear and tear",
			"Pest exposure or infestation after the first 12 months",
		], "exclusion"),

		claimEyebrow: text("Make a claim: label", "Make a claim"),
		claimTitle: text("Make a claim: title", "How to make a warranty claim"),
		claimText: textarea("Make a claim: intro", "Contact us through any of these channels:", "The WhatsApp, phone, email and showroom cards come from the site's contact details."),
		readyTitle: text("Make a claim: checklist title", "Have these ready"),
		ready: items("Make a claim: checklist", [
			"Your name and order or invoice reference",
			"A description of the product and the issue",
			"The delivery or installation date",
			"Photos or a short video of the issue",
		]),

		processEyebrow: text("Process: label", "The process"),
		processTitle: text("Process: title", "What happens after you make a claim"),
		steps: list(
			"Process: steps",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "Claim logged", text: "We record your request and confirm that we’ve received it." },
				{ title: "Initial review", text: "We check that the claim is within the warranty period and appears to be manufacturing-related." },
				{ title: "Inspection", text: "Our team assesses the piece by photo review, a remote technical assessment or a site visit to find the root cause." },
				{ title: "Decision", text: "We share what we found, our decision and the next steps." },
				{ title: "Resolution", text: "Approved claims are resolved by repair, component replacement or, in extreme cases, full product replacement, within agreed timelines." },
				{ title: "Case closed", text: "Once the repair or replacement is complete, we close the case and keep the outcome on file." },
			],
			{ itemLabel: "step" },
		),
		outcomesTitle: text("Process: outcomes title", "Possible outcomes"),
		outcomesHeadOutcome: text("Process: outcomes first heading", "Outcome"),
		outcomesHeadResult: text("Process: outcomes second heading", "What happens"),
		outcomes: list(
			"Process: outcomes",
			{ outcome: text("Outcome"), result: text("What happens") },
			[
				{ outcome: "Valid claim", result: "Repair or replacement approved" },
				{ outcome: "Partially valid", result: "Partial repair support" },
				{ outcome: "Not valid", result: "Claim declined, with an explanation" },
			],
			{ itemLabel: "outcome" },
		),

		beyondEyebrow: text("Beyond your warranty: label", "Beyond your warranty"),
		beyondTitle: text("Beyond your warranty: title", "Support that doesn’t expire"),
		beyondText: textarea("Beyond your warranty: intro", "Even when an issue falls outside your warranty, we’re here to help with:"),
		beyond: items("Beyond your warranty: services", ["Paid repair services", "Replacement components", "Technical advice"], "service"),
		beyondCta: link("Beyond your warranty: link", { label: "Furniture repair & restoration", href: "/furniture-care-service/" }),

		certificateEyebrow: text("Certificate: label", "Your certificate"),
		certificateTitle: text("Certificate: title", "Your warranty certificate"),
		certificateText: textarea(
			"Certificate: text",
			"You receive a warranty certificate once payment is complete. It forms part of your purchase agreement and records your warranty start and expiry dates, so please keep it for the length of your warranty.\n\nFor order changes, cancellations, refunds or delivery timelines, see our other policies:",
		),
		policies: list(
			"Certificate: policy links",
			{ cta: link("Link") },
			[{ cta: { label: "Refund & returns policy", href: "/refund_returns/" } }, { cta: { label: "Shipping policy", href: "/shipping-policy/" } }],
			{ itemLabel: "link" },
		),

		closingTitle: text("Closing banner: title", "Something not right with your piece?"),
		closingText: textarea("Closing banner: text", "Send us your order reference and a few photos, and we’ll take it from there."),
		closingWhatsapp: text("Closing banner: WhatsApp button", "Start a claim on WhatsApp", "Opens WhatsApp with the claim message filled in."),
		closingCall: text("Closing banner: call button", "Call", "Shown before the phone number."),
	},
});
