import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

/** The Academy's own WhatsApp (also in components/pages/academyPage/content.ts), until the Academy portal exists */
const academyWhatsapp = (message: string) => `https://wa.me/2348185893377?text=${encodeURIComponent(message)}`;

const partner = (title: string) => ({ label: "Become a partner", href: academyWhatsapp(`Hello Majeurs Furniture Academy, I'd like to become a partner: ${title}.`), external: true });

export const academy = definePage({
	id: "academy",
	wpId: 99,
	path: "/majeurs-furniture-academy/",
	title: "Majeurs Furniture Academy page content",
	fields: {
		heroEyebrow: text("Hero: label", "Majeurs Furniture Academy"),
		heroTitle: text("Hero: title", "Build a Career in Furniture Manufacturing, Not Just a Skill."),
		heroText: textarea(
			"Hero: text",
			"Join a selective 6-month training program designed to produce world-class furniture makers and manufacturers.\n\nWe train, test, and place serious individuals into real production environments.",
		),
		heroNote: text("Hero: note above the button", "Only 2 cohorts per year. Limited seats per cohort."),
		heroCta: link("Hero: button", { label: "Apply for the next cohort", href: academyWhatsapp("Hello Majeurs Furniture Academy, I'd like to apply for the next cohort."), external: true }),
		heroFootnote: text("Hero: note below the button", "Applications are reviewed. Only qualified candidates will be selected."),

		programTitle: text("What this program is: title", "What This Program Is"),
		programVideoId: text("What this program is: YouTube video ID", "gweTL08_VEU", "The part after watch?v= in the YouTube link."),
		programVideoTitle: text("What this program is: video title", "Majeurs Furniture Academy: empowering future manufacturers in Africa"),
		programText: textarea(
			"What this program is: text",
			"At Majeurs Furniture Academy, we don't train hobbyists. We develop disciplined, production-ready furniture manufacturers.\n\nThis is a hands-on, high-performance program built within a real furniture manufacturing environment.",
		),
		gainsTitle: text("What this program is: list heading", "What you gain:"),
		gains: list(
			"What this program is: what you gain",
			{ text: text("Point") },
			[
				{ text: "Practical, real-world furniture manufacturing skills" },
				{ text: "Training aligned with industry and ISO-level systems" },
				{ text: "Exposure to live commercial projects" },
				{ text: "Structured pathway into employment or independent production" },
			],
			{ itemLabel: "point" },
		),

		audienceTitle: text("Who this is for: title", "Who This Is For"),
		audienceText: textarea("Who this is for: text", "Become a furniture maker and manufacturer in 6 months."),
		sessionLabel: text("Who this is for: session label", "Session:"),
		session: text("Who this is for: session", "March – August"),
		priceLabel: text("Who this is for: price label", "Price:"),
		price: text("Who this is for: price", "₦1.5 million for boarding | ₦650,000 for day"),
		forYouTitle: text("For you: title", "This program is for you if:"),
		forYouImage: image("For you: image", upload("The-Atunlo-collection-sketch-work-done-by-Demi-Samande.webp")),
		forYou: list(
			"For you: points",
			{ text: text("Point") },
			[
				{ text: "You are serious about building a long-term career in manufacturing" },
				{ text: "You are ready to commit fully for 6 months" },
				{ text: "You are willing to be trained to a high standard" },
				{ text: "You want to earn, grow, and build real value" },
			],
			{ itemLabel: "point" },
		),
		notForYouTitle: text("Not for you: title", "This program is NOT for you if:"),
		notForYouImage: image("Not for you: image", upload("The-Majeurs-Academy-Program-Guarantee.webp")),
		notForYou: list(
			"Not for you: points",
			{ text: text("Point") },
			[
				{ text: "You are looking for a casual or part-time skill" },
				{ text: "You are not ready for structure, discipline, and accountability" },
				{ text: "You are unsure about committing to a demanding program" },
			],
			{ itemLabel: "point" },
		),

		fundingTitle: text("Funding options: title", "Funding Options"),
		fundingText: textarea("Funding options: text", "We offer two pathways for entry."),
		tracks: list(
			"Funding options: tracks",
			{ title: text("Title"), subtitle: text("Subtitle"), image: image("Image"), points: list("Points", { text: text("Point") }, [], { itemLabel: "point" }) },
			[
				{
					title: "Self-Funded Track",
					subtitle: "For individuals ready to invest in their future",
					image: upload("The-Atunlo-collection-sketch-work-done-by-Demi-Samande.webp"),
					points: [{ text: "Priority consideration" }, { text: "Faster onboarding process" }, { text: "Full access to training and placement pathways" }],
				},
				{
					title: "Sponsored Track",
					subtitle: "For individuals who require financial support",
					image: upload("The-Majeurs-Academy-Program-Guarantee.webp"),
					points: [
						{ text: "Limited slots available" },
						{ text: "Additional screening required" },
						{ text: "Subject to funding availability" },
						{ text: "May include structured placement agreements post-training" },
					],
				},
			],
			{ itemLabel: "track" },
		),

		hireEyebrow: text("Hire a graduate: label", "For employers"),
		hireTitle: text("Hire a graduate: title", "Hire an Academy graduate"),
		hireText: textarea(
			"Hire a graduate: text",
			"Need skilled furniture makers? Majeurs Furniture Academy graduates complete a selective 6-month, hands-on program inside a working furniture manufacturing environment, and are tested before they finish. We connect workshops, factories and interiors businesses with graduates and SIWES interns who are ready for real production work.",
		),
		hireCards: list(
			"Hire a graduate: cards",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "Production-ready skills", text: "Practical furniture making and manufacturing skills, built on exposure to live commercial projects." },
				{ title: "Trained to a standard", text: "Structured training aligned with industry and ISO-level systems, with discipline and accountability built in." },
				{ title: "Full-time roles or internships", text: "Hire graduates for full-time production roles, or host students for structured SIWES work experience." },
			],
			{ itemLabel: "card" },
		),
		hireButton: text("Hire a graduate: WhatsApp button", "Hire a graduate", "Opens WhatsApp to the Majeurs sales line."),
		hireMessage: text("Hire a graduate: WhatsApp message", "Hello Majeurs, I'd like to hire a Majeurs Furniture Academy graduate."),
		hireContactCta: link("Hire a graduate: second button", { label: "Contact us", href: "/contact-majeurs-holdings/" }),

		sponsorTitle: text("Become a sponsor: title", "Become A Sponsor"),
		sponsorText: textarea(
			"Become a sponsor: text",
			"Collaborate with Majeurs Academy to train the next generation of African furniture makers. Support internships (SIWES), scholarships, equipment grants and industry mentorship.",
		),
		sponsorships: list(
			"Become a sponsor: ways to partner",
			{ title: text("Title"), text: textarea("Text"), image: image("Image"), cta: link("Button") },
			[
				{
					title: "Internships",
					text: "Host students for structured work experience with defined competencies and QC gates aligned to your shop floor.",
					image: upload("Internships.webp"),
					cta: partner("Internships"),
				},
				{
					title: "Scholarships",
					text: "Fund full or partial tuition for promising students; receive anonymised progress reports and impact summaries.",
					image: upload("Scholarships.webp"),
					cta: partner("Scholarships"),
				},
				{
					title: "Equipment Grants",
					text: "Provide tools or materials to upgrade training rigs and labs, accelerating mastery of modern processes.",
					image: upload("Equipment-Grants.webp"),
					cta: partner("Equipment Grants"),
				},
				{
					title: "Mentorship and Masterclasses",
					text: "Lead clinics on upholstery, CAD/CAM, finishing, safety or entrepreneurship; shape the industry you hire from.",
					image: upload("The-Majeurs-Academy-Program-Guarantee.webp"),
					cta: partner("Mentorship and Masterclasses"),
				},
				{
					title: "Curriculum and Assessment",
					text: "Co-design modules and practicals; help define competency rubrics that mirror real-world expectations.",
					image: upload("Curriculum-and-Assessment-1.webp"),
					cta: partner("Curriculum and Assessment"),
				},
				{
					title: "Employment Pipeline",
					text: "Pre-screen graduates for roles or apprenticeships; benefit from a steady flow of job-ready talent.",
					image: upload("Employment-Pipeline.webp"),
					cta: partner("Employment Pipeline"),
				},
			],
			{ itemLabel: "way to partner" },
		),

		startEyebrow: text("Get started: label", "Get started"),
		startTitle: text("Get started: title", "Earn a diploma in furniture making in 6 months."),
		startText: textarea("Get started: text", "Get a diploma in furniture manufacturing and an Advanced Professional Diploma with our 6-month program."),
		startImage: image("Get started: background image", upload("The-Majeurs-Academy-Program-Guarantee.webp")),
		startCta: link("Get started: button", {
			label: "Sign up now",
			href: academyWhatsapp("Hello Majeurs Furniture Academy, I'd like to sign up for the 6-month diploma program."),
			external: true,
		}),
	},
});
