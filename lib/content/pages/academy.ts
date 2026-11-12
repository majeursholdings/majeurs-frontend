import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

/** The Academy's own WhatsApp (also in components/pages/academyPage/content.ts), for partner enquiries until the Academy portal exists */
const academyWhatsapp = (message: string) => `https://wa.me/2348185893377?text=${encodeURIComponent(message)}`;

const partner = (title: string) => ({
	label: "Become a partner",
	href: academyWhatsapp(`Hello Majeurs Furniture Academy, I'd like to become a partner: ${title}.`),
	external: true,
});

export const academy = definePage({
	id: "academy",
	wpId: 99,
	path: "/majeurs-furniture-academy/",
	title: "Majeurs Furniture Academy page content",
	fields: {
		heroEyebrow: text("Hero: label", "Majeurs Furniture Academy"),
		heroTitle: text("Hero: title", "Build a career in furniture making"),
		heroText: textarea("Hero: text", "A selective 6-month program inside a working furniture factory in Lagos. We train you, test you and help place you in real production work."),
		heroCta: link("Hero: button", { label: "Join the waitlist", href: "#waitlist" }, "Also the button on the fees and funding cards. #waitlist scrolls to the waitlist form."),
		heroFootnote: text("Hero: note below the button", "Two cohorts a year, limited seats. We review every application."),
		heroImage: image("Hero: image", upload("The-Atunlo-collection-sketch-work-done-by-Demi-Samande.webp")),

		facts: list(
			"Key facts",
			{ value: text("Figure"), label: text("Label") },
			[
				{ value: "6 months", label: "Full-time program" },
				{ value: "Mar – Aug", label: "Next session" },
				{ value: "2", label: "Cohorts a year" },
				{ value: "₦650k", label: "Day fee" },
			],
			{ itemLabel: "fact" },
		),

		programEyebrow: text("Program: label", "The program"),
		programTitle: text("Program: title", "Learn in a real factory, not a classroom"),
		programVideoId: text("Program: YouTube video ID", "gweTL08_VEU", "The part after watch?v= in the YouTube link."),
		programVideoTitle: text("Program: video title", "Majeurs Furniture Academy: empowering future manufacturers in Africa"),
		programText: textarea(
			"Program: text",
			"We don't train hobbyists. We develop disciplined furniture makers who are ready for production from day one.\n\nYou learn hands-on, inside the Majeurs workshop, working on the same commercial projects our craftsmen deliver.",
		),
		gainsTitle: text("Program: list heading", "What you gain"),
		gains: list(
			"Program: what you gain",
			{ text: text("Point") },
			[
				{ text: "Practical furniture making and manufacturing skills" },
				{ text: "Training aligned with industry and ISO-level systems" },
				{ text: "Experience on live commercial projects" },
				{ text: "A clear path into employment or your own production" },
			],
			{ itemLabel: "point" },
		),

		stepsEyebrow: text("Steps: label", "How it works"),
		stepsTitle: text("Steps: title", "From application to placement"),
		steps: list(
			"Steps",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "Join the waitlist", text: "Add your name to the waitlist. We'll contact you when applications for the next cohort open." },
				{ title: "Get selected", text: "We review every application. Sponsored places include extra screening." },
				{ title: "Train for 6 months", text: "Hands-on training on live projects, to industry and ISO-level standards." },
				{ title: "Graduate and get placed", text: "Earn your diploma and move into employment or independent production." },
			],
			{ itemLabel: "step" },
		),

		fitEyebrow: text("Fit: label", "Is it right for you?"),
		fitTitle: text("Fit: title", "A demanding program for serious makers"),
		forYouTitle: text("For you: title", "This program is for you if"),
		forYou: list(
			"For you: points",
			{ text: text("Point") },
			[
				{ text: "You want a long-term career in furniture manufacturing" },
				{ text: "You can commit fully for 6 months" },
				{ text: "You are ready to be trained to a high standard" },
				{ text: "You want to earn, grow and build real value" },
			],
			{ itemLabel: "point" },
		),
		notForYouTitle: text("Not for you: title", "It isn't for you if"),
		notForYou: list(
			"Not for you: points",
			{ text: text("Point") },
			[
				{ text: "You want a casual or part-time skill" },
				{ text: "You aren't ready for structure, discipline and accountability" },
				{ text: "You're unsure about committing to a demanding program" },
			],
			{ itemLabel: "point" },
		),

		fundingEyebrow: text("Fees and funding: label", "Fees and funding"),
		fundingTitle: text("Fees and funding: title", "Two ways to join"),
		fundingText: textarea("Fees and funding: intro", "Fees are ₦650,000 for day students and ₦1.5 million for boarding."),
		tracks: list(
			"Fees and funding: tracks",
			{ title: text("Title"), subtitle: text("Subtitle"), points: list("Points", { text: text("Point") }, [], { itemLabel: "point" }) },
			[
				{
					title: "Self-funded",
					subtitle: "Invest in your own future",
					points: [{ text: "Priority consideration" }, { text: "Faster onboarding" }, { text: "Full access to training and placement" }],
				},
				{
					title: "Sponsored",
					subtitle: "For students who need financial support",
					points: [{ text: "Limited places, subject to funding" }, { text: "Extra screening required" }, { text: "May include a placement agreement after training" }],
				},
			],
			{ itemLabel: "track" },
		),

		hireEyebrow: text("Hire a graduate: label", "For employers"),
		hireTitle: text("Hire a graduate: title", "Hire an Academy graduate"),
		hireText: textarea(
			"Hire a graduate: text",
			"Our graduates finish a selective, hands-on program inside a working factory and are tested before they leave. We connect workshops, factories and interiors businesses with graduates and SIWES interns ready for production work.",
		),
		hireCards: list(
			"Hire a graduate: cards",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "Production-ready skills", text: "Practical making and manufacturing skills, built on live commercial projects." },
				{ title: "Trained to a standard", text: "Structured training aligned with industry and ISO-level systems." },
				{ title: "Full-time roles or internships", text: "Hire graduates for production roles, or host students for SIWES work experience." },
			],
			{ itemLabel: "card" },
		),
		hireButton: text("Hire a graduate: WhatsApp button", "Hire a graduate", "Opens WhatsApp to the Majeurs sales line."),
		hireMessage: text("Hire a graduate: WhatsApp message", "Hello Majeurs, I'd like to hire a Majeurs Furniture Academy graduate."),
		hireContactCta: link("Hire a graduate: second button", { label: "Contact us", href: "/contact-majeurs-holdings/" }),

		sponsorEyebrow: text("Partner: label", "For partners"),
		sponsorTitle: text("Partner: title", "Help train Africa's next furniture makers"),
		sponsorText: textarea("Partner: text", "Support internships, scholarships, equipment and mentorship, and shape the talent your industry hires from."),
		sponsorships: list(
			"Partner: ways to partner",
			{ title: text("Title"), text: textarea("Text"), image: image("Image"), cta: link("Button") },
			[
				{
					title: "Internships",
					text: "Host students for structured SIWES work experience, with clear skills and quality checks for your shop floor.",
					image: upload("Internships.webp"),
					cta: partner("Internships"),
				},
				{
					title: "Scholarships",
					text: "Fund full or partial fees for promising students, and receive progress reports and impact summaries.",
					image: upload("Scholarships.webp"),
					cta: partner("Scholarships"),
				},
				{
					title: "Equipment grants",
					text: "Provide tools or materials to upgrade our training workshop and teach modern processes faster.",
					image: upload("Equipment-Grants.webp"),
					cta: partner("Equipment grants"),
				},
				{
					title: "Mentorship and masterclasses",
					text: "Lead sessions on upholstery, CAD/CAM, finishing, safety or entrepreneurship.",
					image: upload("The-Majeurs-Academy-Program-Guarantee.webp"),
					cta: partner("Mentorship and masterclasses"),
				},
				{
					title: "Curriculum and assessment",
					text: "Co-design modules and practicals, and help set skills standards that match real work.",
					image: upload("Curriculum-and-Assessment-1.webp"),
					cta: partner("Curriculum and assessment"),
				},
				{
					title: "Employment pipeline",
					text: "Pre-screen graduates for roles or apprenticeships and get a steady flow of job-ready talent.",
					image: upload("Employment-Pipeline.webp"),
					cta: partner("Employment pipeline"),
				},
			],
			{ itemLabel: "way to partner" },
		),

		waitlistEyebrow: text("Waitlist: label", "Next cohort"),
		waitlistTitle: text("Waitlist: title", "Join the Academy waitlist"),
		waitlistText: textarea("Waitlist: text", "Leave your details and we'll contact you when applications for the next cohort open. Seats are limited, and people on the waitlist hear first."),
		waitlistButton: text("Waitlist: form button", "Join the waitlist"),

		faqEyebrow: text("FAQs: label", "Questions"),
		faqTitle: text("FAQs: title", "Academy FAQs"),
		faqs: list(
			"FAQs",
			{ q: text("Question"), a: textarea("Answer") },
			[
				{ q: "How long is the program?", a: "Six months, full time. The next session runs from March to August, and we run two cohorts a year." },
				{ q: "How much does it cost?", a: "₦650,000 for day students and ₦1.5 million for boarding." },
				{
					q: "Can I get a sponsored place?",
					a: "Yes, while funding lasts. Sponsored places are limited, need extra screening and may include a placement agreement after training.",
				},
				{ q: "What qualification do I get?", a: "You graduate with a diploma in furniture manufacturing and an Advanced Professional Diploma." },
				{ q: "How do I apply?", a: "Join the waitlist on this page. When applications for the next cohort open, we'll contact you with the next steps. We review every application and contact selected candidates." },
			],
			{ itemLabel: "question" },
		),

		startEyebrow: text("Closing banner: label", "Next cohort"),
		startTitle: text("Closing banner: title", "Earn your furniture making diploma in 6 months"),
		startText: textarea("Closing banner: text", "Seats are limited. Join the waitlist, or follow the Academy for intake news."),
		startImage: image("Closing banner: background image", upload("The-Majeurs-Academy-Program-Guarantee.webp")),
		startCta: link("Closing banner: button", { label: "Join the waitlist", href: "#waitlist" }, "#waitlist scrolls to the waitlist form."),
	},
});
