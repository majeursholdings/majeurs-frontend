// Copy and images from the live /majeurs-furniture-academy/ page (28 Oct 2026)
import { WP_URL } from "@/lib/api/wp";

const UPLOADS = `${WP_URL}/wp-content/uploads`;

/** The Academy's own WhatsApp (its social links on WP); hiring requests go to the main sales line as on WP */
export const ACADEMY_WHATSAPP = "2348185893377";

export function academyWhatsapp(text: string): string {
	return `https://wa.me/${ACADEMY_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export const VIDEO = { id: "gweTL08_VEU", title: "Majeurs Furniture Academy: empowering future manufacturers in Africa" };

export const IMAGES = {
	sketch: `${UPLOADS}/The-Atunlo-collection-sketch-work-done-by-Demi-Samande.webp`,
	team: `${UPLOADS}/The-Majeurs-Academy-Program-Guarantee.webp`,
};

export const gains = [
	"Practical, real-world furniture manufacturing skills",
	"Training aligned with industry and ISO-level systems",
	"Exposure to live commercial projects",
	"Structured pathway into employment or independent production",
];

export const forYou = [
	"You are serious about building a long-term career in manufacturing",
	"You are ready to commit fully for 6 months",
	"You are willing to be trained to a high standard",
	"You want to earn, grow, and build real value",
];

export const notForYou = [
	"You are looking for a casual or part-time skill",
	"You are not ready for structure, discipline, and accountability",
	"You are unsure about committing to a demanding program",
];

export const tracks = [
	{
		title: "Self-Funded Track",
		subtitle: "For individuals ready to invest in their future",
		points: ["Priority consideration", "Faster onboarding process", "Full access to training and placement pathways"],
		image: IMAGES.sketch,
	},
	{
		// WP repeats "This program is NOT for you if:" as this card's title
		title: "Sponsored Track",
		subtitle: "For individuals who require financial support",
		points: ["Limited slots available", "Additional screening required", "Subject to funding availability", "May include structured placement agreements post-training"],
		image: IMAGES.team,
	},
];

export const employerCards = [
	{ title: "Production-ready skills", text: "Practical furniture making and manufacturing skills, built on exposure to live commercial projects." },
	{ title: "Trained to a standard", text: "Structured training aligned with industry and ISO-level systems, with discipline and accountability built in." },
	{ title: "Full-time roles or internships", text: "Hire graduates for full-time production roles, or host students for structured SIWES work experience." },
];

export const sponsorships = [
	{ title: "Internships", text: "Host students for structured work experience with defined competencies and QC gates aligned to your shop floor.", image: `${UPLOADS}/Internships.webp` },
	{ title: "Scholarships", text: "Fund full or partial tuition for promising students; receive anonymised progress reports and impact summaries.", image: `${UPLOADS}/Scholarships.webp` },
	{ title: "Equipment Grants", text: "Provide tools or materials to upgrade training rigs and labs, accelerating mastery of modern processes.", image: `${UPLOADS}/Equipment-Grants.webp` },
	{ title: "Mentorship and Masterclasses", text: "Lead clinics on upholstery, CAD/CAM, finishing, safety or entrepreneurship; shape the industry you hire from.", image: IMAGES.team },
	{ title: "Curriculum and Assessment", text: "Co-design modules and practicals; help define competency rubrics that mirror real-world expectations.", image: `${UPLOADS}/Curriculum-and-Assessment-1.webp` },
	{ title: "Employment Pipeline", text: "Pre-screen graduates for roles or apprenticeships; benefit from a steady flow of job-ready talent.", image: `${UPLOADS}/Employment-Pipeline.webp` },
];

export const socials = [
	{ label: "Instagram", href: "https://www.instagram.com/majeursacademy/", icon: "instagram" as const },
	{ label: "LinkedIn", href: "https://ng.linkedin.com/company/majeurs-institute", icon: "linkedin" as const },
	{ label: "Facebook", href: "https://www.facebook.com/majeursacademy/", icon: "facebook" as const },
	{ label: "WhatsApp", href: `https://wa.me/${ACADEMY_WHATSAPP}`, icon: "whatsapp" as const },
];
