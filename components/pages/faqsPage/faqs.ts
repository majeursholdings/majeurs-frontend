/**
 * FAQ copy from majeurs.com/faqs/ (28 Oct 2026). Answers are text runs with optional links, so the same
 * data renders the accordions and the FAQPage JSON-LD.
 * Fixed from WP: "Where are you located?" showed Academy text; plain-text paths ("/mande", "/contact")
 * are real links; "/mande/demo" and "/academy/program" don't exist, so they point at the live pages.
 */
export type Run = string | { text: string; href: string };
export type Faq = { q: string; a: Run[][] };
export type FaqSection = { id: string; title: string; items: Faq[] };

export const faqSections: FaqSection[] = [
	{
		id: "ordering",
		title: "Ordering",
		items: [
			{
				q: "How do I place an order?",
				a: [
					[
						"For stocked items, order online or contact us with the SKU and quantity. For made-to-order items, we confirm specs (materials, finishes, dimensions), timeline and payment terms before production begins. You’ll receive order confirmations and status updates by email.",
					],
				],
			},
			{
				q: "Do you make bespoke pieces?",
				a: [
					[
						"Yes. We specialise in custom furniture and fit-outs. After a brief, we produce drawings/specs for approval. Once approved and deposit received, we start production. Changes after approval may impact cost and lead time. ",
						{ text: "Start a custom request", href: "/custom-made-furniture-in-lagos/" },
						".",
					],
				],
			},
			{
				q: "Typical lead times?",
				a: [["Lead times vary by scope and materials. We’ll share an estimated window at order confirmation and keep you updated through production and logistics."]],
			},
		],
	},
	{
		id: "shipping-delivery",
		title: "Shipping & Delivery",
		items: [
			{
				q: "Do you ship internationally?",
				a: [["Yes. We ship globally from our Lagos operations; charges are shown at checkout or quoted with your order. Customs and local duties are the customer’s responsibility."]],
			},
			{
				q: "Who handles installation?",
				a: [["For projects, we can provide delivery and installation. For product orders, curbside delivery is standard; white-glove service is available in select locations on request."]],
			},
			{
				q: "What if the carrier delays my shipment?",
				a: [["Once goods are handed to the carrier, risk of loss transfers to the customer. We’ll support tracking and claims, but carrier or customs delays are outside our control."]],
			},
		],
	},
	{
		id: "warranty",
		title: "12-Month Warranty",
		items: [
			{
				q: "What’s covered?",
				a: [
					[
						"Manufacturing defects in materials or workmanship for 12 months from delivery. We repair or replace the affected part/item at our discretion. ",
						{ text: "Read the warranty policy", href: "/warranty-policy/" },
						".",
					],
				],
			},
			{
				q: "What’s not covered?",
				a: [
					[
						"Normal wear and tear, misuse, neglect, accidents, improper care, unauthorized repairs or alterations, and natural variations in materials (e.g., wood grain, color, texture) that are not defects.",
					],
				],
			},
			{
				q: "How do I file a claim?",
				a: [
					[
						"Email ",
						{ text: "customerservice@majeursholdings.com", href: "mailto:customerservice@majeursholdings.com" },
						" with your order number, description of the issue and photos. We’ll review and advise next steps.",
					],
				],
			},
		],
	},
	{
		id: "mande",
		title: "Mande",
		items: [
			{
				q: "What is Mande?",
				a: [
					[
						"Mande is our collaboration platform that connects design, sourcing, production and delivery with ISO-aligned checklists, approvals and analytics. See ",
						{ text: "Mande", href: "/mande/" },
						".",
					],
				],
			},
			{
				q: "Can I see a demo?",
				a: [["Yes — book a live walkthrough with Demi from the ", { text: "Mande page", href: "/mande/" }, "."]],
			},
		],
	},
	{
		id: "custom-projects",
		title: "Custom Projects",
		items: [
			{
				q: "What’s the process for custom work?",
				a: [
					[
						"Brief → Design/Specs → Quote & Timeline → Approval & Deposit → Production with stage-gate QC → Delivery/Install. We can collaborate with your designer or work from our own development.",
					],
				],
			},
			{
				q: "Who owns the designs?",
				a: [
					[
						"All content on our website and drawings we create are Majeurs’ intellectual property unless otherwise agreed in writing. Client-supplied IP remains the client’s; we request permission to fabricate from approved files.",
					],
				],
			},
		],
	},
	{
		id: "refunds-returns",
		title: "Refunds & Returns",
		items: [
			{
				q: "Can I get a refund?",
				a: [
					[
						"Refunds are offered on all items except custom-made products (final sale). Shipping fees are non-refundable. Returned items must be unused, undamaged and in original packaging.",
					],
				],
			},
			{
				q: "How do I start a return?",
				a: [
					[
						"Email ",
						{ text: "support@majeursholdings.com", href: "mailto:support@majeursholdings.com" },
						" with your order number and reason. All returns must be shipped to our Lagos HQ at the customer’s cost. Refunds are processed after inspection.",
					],
				],
			},
			{
				q: "When will my refund arrive?",
				a: [["Once the item is received and approved, refunds are issued within 14 working days in the original payment currency (product amount only, excluding shipping)."]],
			},
		],
	},
	{
		id: "payments",
		title: "Payments",
		items: [
			{
				q: "What are your payment terms?",
				a: [
					["Online orders: 100% in advance."],
					["Local orders from our Lagos factory: 80% deposit before production and 20% balance before delivery. Orders are released only after cleared payment."],
				],
			},
			{
				q: "What currencies do you accept?",
				a: [["Nigerian Naira (₦) and other global currencies as displayed on our platforms or stated in your invoice."]],
			},
		],
	},
	{
		id: "academy",
		title: "Majeurs Academy",
		items: [
			{
				q: "What programs do you offer?",
				a: [
					[
						"Professional Diploma (training + SIWES) and Advanced Professional Diploma (advanced training + SIWES). Explore the ",
						{ text: "Majeurs Furniture Academy", href: "/majeurs-furniture-academy/" },
						" for the program and course outline.",
					],
				],
			},
			{
				q: "How do I register, partner or donate?",
				a: [["Registration, partnerships and donations all start on the ", { text: "Majeurs Furniture Academy", href: "/majeurs-furniture-academy/" }, " page."]],
			},
		],
	},
	{
		id: "general",
		title: "General",
		items: [
			{
				q: "Where are you located?",
				a: [
					[
						"Our headquarters, showroom and workshop are at 32, QMB Builders Mart Road, opposite Elf Bus Stop, Lekki Phase 1, Lagos, Nigeria. We also have an office at 71–75 Shelton Street, Covent Garden, London. Visits are by appointment: ",
						{ text: "plan a visit", href: "/plan-a-visitation/" },
						".",
					],
				],
			},
			{
				q: "What are your hours?",
				a: [["Lagos: Mon–Fri, 8:00–18:00 (WAT) • London: Mon–Fri, 8:00–17:00 (GMT). Closed on weekends and public holidays."]],
			},
			{
				q: "How do I contact support?",
				a: [
					[
						"Email ",
						{ text: "support@majeursholdings.com", href: "mailto:support@majeursholdings.com" },
						" or visit our ",
						{ text: "contact page", href: "/contact-majeurs-holdings/" },
						".",
					],
					["General: ", { text: "info@majeursholdings.com", href: "mailto:info@majeursholdings.com" }],
					["Partnerships & Media: ", { text: "partnerships@majeursholdings.com", href: "mailto:partnerships@majeursholdings.com" }],
				],
			},
		],
	},
];

export const runText = (run: Run) => (typeof run === "string" ? run : run.text);
