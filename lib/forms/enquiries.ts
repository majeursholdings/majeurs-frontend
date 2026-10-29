// The site's enquiry forms (ex-Elementor). Shared by the form components (client) and submitEnquiryAction
// (server), so keep it free of server imports. Options are copied from the live WP forms (28 Oct 2026).
import { z } from "zod";
import type { TrackedFormName } from "@/lib/analytics";
import type { UploadPurpose } from "@/lib/api/media";

const required = (message: string) => z.string().trim().min(1, message);
const optional = z.string().trim().max(5000).optional().default("");
const email = z.string().trim().email("Please enter a valid email address");
const phone = z.string().trim().regex(/^\+?[0-9\s()-]{7,20}$/, "Please enter a valid phone number");
const oneOf = <T extends readonly string[]>(options: T, message: string) => z.enum(options as unknown as [string, ...string[]], { message });

export const visitationReasons = ["Create a custom design", "Shopping advice", "Become a partner", "Others"] as const;
export const urgencyOptions = ["As soon as possible", "In a few weeks", "In 2-4 months", "Yet to decide"] as const;
export const customProjectTypes = ["Bespoke Furniture", "Interior Fit-Out", "Restoration", "Other"] as const;
export const customBudgets = ["₦0 - ₦2,000,000", "₦2,000,001 - ₦10,000,000", "₦10,000,001 - ₦50,000,000", "₦50,000,000+"] as const;
export const repairProjectTypes = ["Fix broken part", "Restoration", "Other"] as const;
export const professionalRoles = [
	"Architect",
	"Interior Designer",
	"Property Developer",
	"Hospitality Designer or Operator",
	"Procurement",
	"Project Manager",
	"Others",
] as const;
export const quoteProjectFor = [
	"My own home",
	"A property I'm developing, renting or short-letting",
	"My business premises (hotel, office, restaurant, showroom)",
	"A client (I'm an interior designer or architect)",
	"Trade/reseller purchase",
] as const;
export const quoteNeeds = [
	"Sofas and armchairs",
	"Beds and headboards",
	"Dining",
	"Wardrobes and storage",
	"Office furniture",
	"Full home or full project fit-out",
	"Restoration or reupholstery",
	"Other",
] as const;
export const quoteScope = ["One room", "Two to four rooms", "Five to ten rooms", "More than ten rooms, or multiple units"] as const;
export const quoteDelivery = ["Lagos", "Another Nigerian state", "Outside Nigeria"] as const;
// WP skips ₦12M – ₦25M; added so every budget has a band
export const quoteBudgets = ["Under ₦6M", "₦6M – ₦12M", "₦12M – ₦25M", "₦25M – ₦50M", "₦50M – ₦100M", "Above ₦100M", "Not set yet"] as const;
export const quoteTimelines = ["Within 4 weeks", "1–3 months", "3–6 months", "More than 6 months", "Not sure yet"] as const;
export const quoteStages = [
	"Still gathering ideas",
	"Space is ready — I want to start now",
	"Still building or renovating",
	"I have drawings or a specification and need a quote",
] as const;
export const quoteDecisionMaker = ["Yes", "I decide jointly", "I'm specifying on someone else's behalf"] as const;
export const waitlistPieces = ["Abobaku", "Dandan", "Erelu", "All three"] as const;

export const contactDepartments = ["Sales", "Customer Service", "Media", "Others"] as const;
export const contactSubjects = ["General", "Partnership", "Inquiries", "Support", "Product Care"] as const;
export const feedbackTypes = ["Complaint", "Suggestion", "Compliment", "Inquiry"] as const;
export const serviceRatings = ["Excellent", "Good", "Satisfactory", "Not So Good", "Terrible"] as const;

export const tradeProjectTypes = [
	"Residential (single)",
	"Residential Development",
	"Hospitality (Hotel, Serviced Apartments, Restaurant)",
	"Commercial",
	"Office",
	"Other",
] as const;

/** Honeypot: hidden from people, filled by bots. Every schema carries it; the action drops non-empty ones. */
const base = { website: z.string().optional().default("") };

const visitation = z.object({
	...base,
	first_name: required("Enter your first name"),
	last_name: optional,
	email,
	phone: z.union([phone, z.literal("")]).optional().default(""),
	reason: oneOf(visitationReasons, "Choose a reason"),
	date: required("Pick a date"),
	time: required("Pick a time"),
	message: optional,
});

const customRequest = z.object({
	...base,
	first_name: required("Enter your first name"),
	last_name: optional,
	email,
	phone,
	location: required("Enter your city and country"),
	project_type: oneOf(customProjectTypes, "Choose a project type"),
	budget: oneOf(customBudgets, "Choose a budget"),
	urgency: oneOf(urgencyOptions, "Tell us when you need it"),
	furniture_type: required("Tell us what furniture you need"),
	message: optional,
});

const quote = z.object({
	...base,
	first_name: required("Enter your first name"),
	last_name: optional,
	business_name: required("Enter your business name"),
	email,
	phone,
	location: required("Enter your city and country"),
	role: oneOf(professionalRoles, "Choose your role"),
	project_for: oneOf(quoteProjectFor, "Tell us who the project is for"),
	need: oneOf(quoteNeeds, "Tell us what you need"),
	scope: oneOf(quoteScope, "Tell us how much you're furnishing"),
	delivery: oneOf(quoteDelivery, "Tell us where it will be delivered"),
	budget: oneOf(quoteBudgets, "Choose an investment range"),
	timeline: oneOf(quoteTimelines, "Tell us when you need it"),
	stage: oneOf(quoteStages, "Tell us where you are in the process"),
	decision_maker: oneOf(quoteDecisionMaker, "Tell us who decides"),
	message: optional,
});

const repair = z.object({
	...base,
	first_name: required("Enter your first name"),
	last_name: optional,
	email,
	phone,
	location: required("Enter your city and country"),
	furniture_type: required("Tell us what needs repairing"),
	project_type: oneOf(repairProjectTypes, "Choose a project type"),
	urgency: oneOf(urgencyOptions, "Tell us when you need it"),
	message: optional,
});

const trade = z.object({
	...base,
	first_name: required("Enter your first name"),
	last_name: optional,
	work_email: email,
	phone,
	company: required("Enter your company name"),
	location: required("Enter your city and country"),
	industry: oneOf(professionalRoles, "Choose your industry"),
	project_types: z.array(oneOf(tradeProjectTypes, "Choose a project type")).optional().default([]),
	heard_about: required("Tell us how you heard about Majeurs"),
});

/** Catalogue download (ex-Elementor popup 5349): name is kept in first_name so WP titles the enquiry with it */
const catalogueRequest = z.object({
	...base,
	first_name: required("Enter your first name"),
	last_name: required("Enter your last name"),
	role: oneOf(professionalRoles, "Choose your professional role"),
	email,
	phone,
	catalogue: required("Choose a catalogue"),
});

const waitlist = z.object({
	...base,
	first_name: required("Enter your first name"),
	last_name: required("Enter your last name"),
	email,
	phone,
	piece: oneOf(waitlistPieces, "Choose a piece"),
});

const contact = z.object({
	...base,
	first_name: required("Enter your first name"),
	last_name: optional,
	email,
	phone: z.union([phone, z.literal("")]).optional().default(""),
	department: oneOf(contactDepartments, "Choose a department"),
	subject: oneOf(contactSubjects, "Choose a subject"),
	message: optional,
});

/** Six steps on the page (A–F); one schema here */
const complaint = z.object({
	...base,
	// A: customer information
	first_name: required("Enter your first name"),
	last_name: optional,
	company_name: optional,
	phone,
	email,
	address: optional,
	// B: product or service
	product_name: required("Enter the product name"),
	invoice_number: required("Enter your order or invoice number"),
	purchase_date: required("Enter the date of purchase or service"),
	delivery_location: required("Enter the delivery location"),
	// C, D
	feedback_type: oneOf(feedbackTypes, "Choose a type of feedback"),
	description: required("Describe your feedback"),
	// E: ratings
	rating_product: oneOf(serviceRatings, "Rate the product"),
	rating_packaging: oneOf(serviceRatings, "Rate the packaging"),
	rating_delivery: oneOf(serviceRatings, "Rate the delivery time"),
	rating_service: oneOf(serviceRatings, "Rate our customer service"),
	// F
	expected_resolution: required("Tell us what resolution you expect"),
});

const jobApplication = z.object({
	...base,
	first_name: required("Enter your first name"),
	last_name: optional,
	email,
	phone,
	role: required("Enter the role you're applying for"),
	portfolio: z.union([z.string().trim().url("Enter a full link, e.g. https://…"), z.literal("")]).optional().default(""),
	cover_letter: required("Write a short cover letter").pipe(z.string().max(10000, "Keep your cover letter under 10,000 characters")),
	additional_information: optional,
});

export type EnquiryDefinition = {
	/** Subject in wp-admin and the email, e.g. "Get a quote" */
	title: string;
	schema: z.ZodObject;
	/** Field -> label in the email, in display order. Fields not listed are not sent. */
	labels: Record<string, string>;
	/** Field holding the visitor's email (Reply-To) */
	replyTo: string;
	trackingName: TrackedFormName;
	/** Fields that hold several values (checkbox groups) */
	arrays?: string[];
	/** File fields: what their files are for, and whether at least one is required */
	uploads?: { field: string; label: string; purpose: UploadPurpose; required?: boolean }[];
	/** Thank-you page after a successful submit; otherwise a toast */
	successPath?: string;
	successMessage: string;
};

export const enquiries = {
	"plan-a-visitation": {
		title: "Plan a visitation",
		schema: visitation,
		labels: { first_name: "First name", last_name: "Last name", email: "Email", phone: "Phone", reason: "Reason", date: "Date", time: "Time", message: "Message" },
		replyTo: "email",
		trackingName: "visitation",
		successMessage: "Thank you! We'll confirm your visit shortly.",
	},
	"custom-request": {
		title: "Custom furniture request",
		schema: customRequest,
		labels: {
			first_name: "First name",
			last_name: "Last name",
			email: "Email",
			phone: "Phone",
			location: "Location",
			project_type: "Project type",
			budget: "Estimated budget",
			urgency: "How soon",
			furniture_type: "Furniture type(s)",
			message: "Message",
		},
		replyTo: "email",
		trackingName: "custom_order",
		uploads: [{ field: "files", label: "Reference", purpose: "custom-order-reference" }],
		successMessage: "Thank you! Our design team will be in touch within 24 hours.",
	},
	quote: {
		title: "Get a quote",
		schema: quote,
		labels: {
			first_name: "First name",
			last_name: "Last name",
			business_name: "Business name",
			email: "Email",
			phone: "Phone",
			location: "Location",
			role: "Professional role",
			project_for: "Project is for",
			need: "What they need",
			scope: "How much",
			delivery: "Delivery",
			budget: "Investment range",
			timeline: "Needed by",
			stage: "Stage",
			decision_maker: "Decision-maker",
			message: "Message",
		},
		replyTo: "email",
		trackingName: "quote_request",
		uploads: [{ field: "files", label: "Reference", purpose: "custom-order-reference" }],
		successPath: "/get-a-quote-for-custom-made-furniture-in-lagos/quote-request-received/",
		successMessage: "Thank you! Your quote request has been received.",
	},
	"furniture-repair": {
		title: "Furniture repair",
		schema: repair,
		labels: {
			first_name: "First name",
			last_name: "Last name",
			email: "Email",
			phone: "Phone",
			location: "Location",
			furniture_type: "Furniture type(s)",
			project_type: "Project type",
			urgency: "How soon",
			message: "Message",
		},
		replyTo: "email",
		trackingName: "furniture_repair",
		uploads: [{ field: "files", label: "Reference", purpose: "custom-order-reference" }],
		successMessage: "Thank you! Our sofa fixers will be in touch shortly.",
	},
	"trade-program": {
		title: "Trade Program application",
		schema: trade,
		labels: {
			first_name: "First name",
			last_name: "Last name",
			work_email: "Work email",
			phone: "Phone",
			company: "Company",
			location: "Location",
			industry: "Business industry",
			project_types: "Project types",
			heard_about: "Heard about Majeurs",
		},
		replyTo: "work_email",
		trackingName: "trade_program",
		arrays: ["project_types"],
		uploads: [{ field: "licence", label: "Business licence", purpose: "trade-document", required: true }],
		successPath: "/majeurs-trade-program/majeurs-trade-program-registration-completed/",
		successMessage: "Thank you! Your application has been received.",
	},
	"catalogue-request": {
		title: "Catalogue download",
		schema: catalogueRequest,
		labels: { first_name: "First name", last_name: "Last name", role: "Professional role", email: "Email", phone: "Phone", catalogue: "Catalogue" },
		replyTo: "email",
		trackingName: "catalogue_request",
		successMessage: "Thank you! Your catalogue is ready to download.",
	},
	waitlist: {
		title: "Roots and Reverence waitlist",
		schema: waitlist,
		labels: { first_name: "First name", last_name: "Last name", email: "Email", phone: "Phone", piece: "Preferred piece" },
		replyTo: "email",
		trackingName: "waitlist",
		successMessage: "You're on the waitlist. We'll email you when it's your turn.",
	},
	contact: {
		title: "Contact",
		schema: contact,
		labels: { first_name: "First name", last_name: "Last name", email: "Email", phone: "Phone", department: "Department", subject: "Subject", message: "Message" },
		replyTo: "email",
		trackingName: "contact",
		successMessage: "Thank you! We'll get back to you shortly.",
	},
	complaint: {
		title: "Complaint or feedback",
		schema: complaint,
		labels: {
			first_name: "First name",
			last_name: "Last name",
			company_name: "Company",
			phone: "Phone",
			email: "Email",
			address: "Address",
			product_name: "Product",
			invoice_number: "Order / invoice number",
			purchase_date: "Date of purchase / service",
			delivery_location: "Delivery location",
			feedback_type: "Type of feedback",
			description: "Description",
			rating_product: "Rating: product",
			rating_packaging: "Rating: packaging",
			rating_delivery: "Rating: delivery time",
			rating_service: "Rating: customer service",
			expected_resolution: "Expected resolution",
		},
		replyTo: "email",
		trackingName: "complaint",
		successMessage: "Thank you for your feedback. Our customer service team will be in touch.",
	},
	"job-application": {
		title: "Job application",
		schema: jobApplication,
		labels: {
			role: "Role",
			first_name: "First name",
			last_name: "Last name",
			email: "Email",
			phone: "Phone",
			portfolio: "Portfolio",
			cover_letter: "Cover letter",
			additional_information: "Additional information",
		},
		replyTo: "email",
		trackingName: "job_application",
		uploads: [
			{ field: "resume", label: "CV / resume", purpose: "job-application", required: true },
			{ field: "previous_results", label: "Previous results", purpose: "job-application" },
		],
		successMessage: "Thank you! Your application has been received. We'll be in touch if you're shortlisted.",
	},
} satisfies Record<string, EnquiryDefinition>;

export type EnquiryId = keyof typeof enquiries;
export type EnquiryValues<T extends EnquiryId> = z.input<(typeof enquiries)[T]["schema"]>;

/** Files per upload field and size per file (lib/api/media.ts enforces the same 5MB) */
export const ENQUIRY_MAX_FILES = 4;
export const ENQUIRY_MAX_FILE_MB = 5;
