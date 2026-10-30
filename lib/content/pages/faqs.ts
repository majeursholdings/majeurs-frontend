import { definePage, list, rich, text } from "../model.ts";

/**
 * Fixed from WP: "Where are you located?" showed Academy text; plain-text paths ("/mande", "/contact") are real
 * links; "/mande/demo" and "/academy/program" don't exist, so they point at the live pages.
 */
export const faqs = definePage({
	id: "faqs",
	wpId: 90,
	path: "/faqs/",
	title: "FAQs page content",
	fields: {
		heroTitle: text("Hero: title", "Frequently Asked Questions"),
		navTitle: text("Sidebar: sections heading", "Sections"),
		socialTitle: text("Sidebar: social media heading", "Social media"),
		sections: list(
			"FAQ: sections",
			{
				anchor: text("Anchor", "", "Short id in the section's link, e.g. ordering for /faqs/#ordering. Keep it unchanged once shared."),
				title: text("Title"),
				items: list("Questions", { q: text("Question"), a: rich("Answer") }, [], { itemLabel: "question" }),
			},
			[
				{
					anchor: "ordering",
					title: "Ordering",
					items: [
						{
							q: "How do I place an order?",
							a: "<p>For stocked items, order online or contact us with the SKU and quantity. For made-to-order items, we confirm specs (materials, finishes, dimensions), timeline and payment terms before production begins. You’ll receive order confirmations and status updates by email.</p>",
						},
						{
							q: "Do you make bespoke pieces?",
							a: `<p>Yes. We specialise in custom furniture and fit-outs. After a brief, we produce drawings/specs for approval. Once approved and deposit received, we start production. Changes after approval may impact cost and lead time. <a href="/custom-made-furniture-in-lagos/">Start a custom request</a>.</p>`,
						},
						{
							q: "Typical lead times?",
							a: "<p>Lead times vary by scope and materials. We’ll share an estimated window at order confirmation and keep you updated through production and logistics.</p>",
						},
					],
				},
				{
					anchor: "shipping-delivery",
					title: "Shipping & Delivery",
					items: [
						{
							q: "Do you ship internationally?",
							a: "<p>Yes. We ship globally from our Lagos operations; charges are shown at checkout or quoted with your order. Customs and local duties are the customer’s responsibility.</p>",
						},
						{
							q: "Who handles installation?",
							a: "<p>For projects, we can provide delivery and installation. For product orders, curbside delivery is standard; white-glove service is available in select locations on request.</p>",
						},
						{
							q: "What if the carrier delays my shipment?",
							a: "<p>Once goods are handed to the carrier, risk of loss transfers to the customer. We’ll support tracking and claims, but carrier or customs delays are outside our control.</p>",
						},
					],
				},
				{
					anchor: "warranty",
					title: "12-Month Warranty",
					items: [
						{
							q: "What’s covered?",
							a: `<p>Manufacturing defects in materials or workmanship for 12 months from delivery. We repair or replace the affected part/item at our discretion. <a href="/warranty-policy/">Read the warranty policy</a>.</p>`,
						},
						{
							q: "What’s not covered?",
							a: "<p>Normal wear and tear, misuse, neglect, accidents, improper care, unauthorized repairs or alterations, and natural variations in materials (e.g., wood grain, color, texture) that are not defects.</p>",
						},
						{
							q: "How do I file a claim?",
							a: `<p>Email <a href="mailto:customerservice@majeursholdings.com">customerservice@majeursholdings.com</a> with your order number, description of the issue and photos. We’ll review and advise next steps.</p>`,
						},
					],
				},
				{
					anchor: "mande",
					title: "Mande",
					items: [
						{
							q: "What is Mande?",
							a: `<p>Mande is our collaboration platform that connects design, sourcing, production and delivery with ISO-aligned checklists, approvals and analytics. See <a href="/mande/">Mande</a>.</p>`,
						},
						{
							q: "Can I see a demo?",
							a: `<p>Yes — book a live walkthrough with Demi from the <a href="/mande/">Mande page</a>.</p>`,
						},
					],
				},
				{
					anchor: "custom-projects",
					title: "Custom Projects",
					items: [
						{
							q: "What’s the process for custom work?",
							a: "<p>Brief → Design/Specs → Quote & Timeline → Approval & Deposit → Production with stage-gate QC → Delivery/Install. We can collaborate with your designer or work from our own development.</p>",
						},
						{
							q: "Who owns the designs?",
							a: "<p>All content on our website and drawings we create are Majeurs’ intellectual property unless otherwise agreed in writing. Client-supplied IP remains the client’s; we request permission to fabricate from approved files.</p>",
						},
					],
				},
				{
					anchor: "refunds-returns",
					title: "Refunds & Returns",
					items: [
						{
							q: "Can I get a refund?",
							a: "<p>Refunds are offered on all items except custom-made products (final sale). Shipping fees are non-refundable. Returned items must be unused, undamaged and in original packaging.</p>",
						},
						{
							q: "How do I start a return?",
							a: `<p>Email <a href="mailto:support@majeursholdings.com">support@majeursholdings.com</a> with your order number and reason. All returns must be shipped to our Lagos HQ at the customer’s cost. Refunds are processed after inspection.</p>`,
						},
						{
							q: "When will my refund arrive?",
							a: "<p>Once the item is received and approved, refunds are issued within 14 working days in the original payment currency (product amount only, excluding shipping).</p>",
						},
					],
				},
				{
					anchor: "payments",
					title: "Payments",
					items: [
						{
							q: "What are your payment terms?",
							a: "<p>Online orders: 100% in advance.</p><p>Local orders from our Lagos factory: 80% deposit before production and 20% balance before delivery. Orders are released only after cleared payment.</p>",
						},
						{
							q: "What currencies do you accept?",
							a: "<p>Nigerian Naira (₦) and other global currencies as displayed on our platforms or stated in your invoice.</p>",
						},
					],
				},
				{
					anchor: "academy",
					title: "Majeurs Academy",
					items: [
						{
							q: "What programs do you offer?",
							a: `<p>Professional Diploma (training + SIWES) and Advanced Professional Diploma (advanced training + SIWES). Explore the <a href="/majeurs-furniture-academy/">Majeurs Furniture Academy</a> for the program and course outline.</p>`,
						},
						{
							q: "How do I register, partner or donate?",
							a: `<p>Registration, partnerships and donations all start on the <a href="/majeurs-furniture-academy/">Majeurs Furniture Academy</a> page.</p>`,
						},
					],
				},
				{
					anchor: "general",
					title: "General",
					items: [
						{
							q: "Where are you located?",
							a: `<p>Our headquarters, showroom and workshop are at 32, QMB Builders Mart Road, opposite Elf Bus Stop, Lekki Phase 1, Lagos, Nigeria. We also have an office at 71–75 Shelton Street, Covent Garden, London. Visits are by appointment: <a href="/plan-a-visitation/">plan a visit</a>.</p>`,
						},
						{
							q: "What are your hours?",
							a: "<p>Lagos: Mon–Fri, 8:00–18:00 (WAT) • London: Mon–Fri, 8:00–17:00 (GMT). Closed on weekends and public holidays.</p>",
						},
						{
							q: "How do I contact support?",
							a: `<p>Email <a href="mailto:support@majeursholdings.com">support@majeursholdings.com</a> or visit our <a href="/contact-majeurs-holdings/">contact page</a>.</p><p>General: <a href="mailto:info@majeursholdings.com">info@majeursholdings.com</a></p><p>Partnerships & Media: <a href="mailto:partnerships@majeursholdings.com">partnerships@majeursholdings.com</a></p>`,
						},
					],
				},
			],
			{ itemLabel: "section" },
		),
	},
});
