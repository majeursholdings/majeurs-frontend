// Copy from the live Trade Program page (majeurs.com/majeurs-trade-program/, 28 Oct 2026)

import { WP_URL } from "@/lib/api/wp";

export const UPLOADS = `${WP_URL}/wp-content/uploads`;
export const QUOTE_PATH = "/get-a-quote-for-custom-made-furniture-in-lagos/";

export const stats = [
	{ value: "Up to 20%", label: "Trade discount, tiered by annual spend" },
	{ value: "3 tiers", label: "Silver, Gold and Platinum partnerships" },
	{ value: "1 contact", label: "A dedicated point of contact for your projects" },
	{ value: "1 year", label: "Structural warranty on custom furniture" },
];

export const audiences = [
	{ title: "Architects", text: "Furniture detailed to your drawings, with custom dimensions and finishes that respect the building." },
	{ title: "Interior designers", text: "A full material and finish library, 3D-ready models and fast prototyping for client sign-off." },
	{ title: "Property developers", text: "End-to-end furnishing for estates, show homes and serviced apartments from a single manufacturer." },
	{ title: "Hospitality", text: "Contract furniture for hotels, restaurants, lounges and members’ clubs, built for heavy daily use." },
	{ title: "Procurement teams", text: "Clear quotations, coordinated production timelines and one accountable contact." },
	{ title: "Project managers", text: "Production planned around your project, with on-site measurement and installation support." },
];

export const benefits = [
	{ title: "Trade pricing", text: "Up to 20% off, with discounts that grow with your cumulative annual spend." },
	{ title: "Priority lead times", text: "Trade projects move ahead of first-time retail enquiries." },
	{ title: "A dedicated contact", text: "One person who knows your project, from first quotation to installation." },
	{ title: "Made to your spec", text: "Custom dimensions, materials and upholstery, with metal inlays, stitching details and veneer matching." },
	{ title: "Samples and 3D models", text: "Fast prototyping and sample approval, plus 3D-ready models for your design software." },
	{ title: "On-site support", text: "Measurement and installation support, so every piece lands exactly as specified." },
];

export const tiers = [
	{ name: "Silver", discount: "5% off", spend: "From ₦10M annual spend", perks: ["Priority sampling", "Faster quotations", "Access to newer finishes"] },
	{ name: "Gold", discount: "12–15% off", spend: "From ₦25M annual spend", perks: ["Dedicated designer liaison", "Priority production slots", "Custom moodboard support"] },
	{
		name: "Platinum",
		badge: "Most rewarding",
		discount: "15–20% off",
		spend: "From ₦50M annual spend",
		perks: ["Co-create signature products", "Annual showroom credit", "Premium sample box", "VIP prototyping"],
		featured: true,
	},
];

export const steps = [
	{ title: "Apply", text: "Complete the registration form below with your company details and business licence." },
	{ title: "Review", text: "Our team reviews your details, and a member of the Majeurs team contacts you directly." },
	{ title: "Onboard", text: "Share your project frequency, material preferences and delivery details, and meet your dedicated contact." },
	{ title: "Specify and build", text: "Send your briefs, approve samples and prototypes, and we produce and install to your furniture." },
];

export const series = [
	{ title: "Essential Series", text: "For budget-conscious projects and volume fit-outs.", materials: "MDF, laminate, textured board and standard joinery." },
	{ title: "Signature Series", text: "For mid to high-end residential and hospitality interiors.", materials: "Veneer finishes, bouclé and velvet upholstery, soft-close hardware." },
	{ title: "Bespoke Series", text: "For statement pieces and luxury interiors.", materials: "Solid wood, marble, high-gloss lacquer and custom metalwork." },
];

export const aftercare = [
	{ title: "1 year · Structure", text: "Structural warranty on all custom furniture." },
	{ title: "6 months · Upholstery", text: "Cover for stitching and foam." },
	{ title: "1 year · Hardware", text: "Hinges and sliders, plus 3 months on surface wear." },
	{ title: "Maintenance packages", text: "Optional care plans for show homes and short-let apartments, with refinishing and replacement parts." },
];

export const faqs = [
	{
		q: "Who can join the Trade Program?",
		a: "Architects, interior designers, property developers, hospitality designers and operators, procurement teams and project managers. If you specify furniture for clients or projects in another role, choose “Others” on the form and tell us about your work.",
	},
	{
		q: "Is there a minimum spend to join?",
		a: "No. You can register at any stage. Trade discounts then unlock by cumulative annual spend: 5% from ₦10M, 12–15% from ₦25M and 15–20% from ₦50M.",
	},
	{ q: "What do I need to apply?", a: "Your company details and a copy of your business licence or registration, as an image or PDF of up to 5MB." },
	{ q: "What happens after I register?", a: "Our team reviews your details, and a member of the Majeurs team contacts you directly to discuss your project and next steps." },
	{
		q: "Can you make furniture to my drawings?",
		a: "Yes. We work to your dimensions, materials and finishes, including custom detailing such as metal inlays, upholstery stitching and veneer matching. We can also provide 3D-ready models for your design software.",
	},
	{
		q: "Do you offer samples and prototypes?",
		a: "Yes. We offer fast prototyping and sample approval. Silver partners and above get priority sampling, and Platinum partners receive a premium sample box.",
	},
	{
		q: "What warranty comes with trade orders?",
		a: "1 year structural on custom furniture, 6 months on upholstery stitching and foam, 1 year on hinges and sliders and 3 months on surface wear. It excludes misuse, pets, spills and unauthorised modifications.",
	},
];
