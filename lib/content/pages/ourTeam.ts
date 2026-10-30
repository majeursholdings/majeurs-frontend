import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

export const ourTeam = definePage({
	id: "ourTeam",
	wpId: 877,
	path: "/our-team/",
	title: "Our Team page content",
	fields: {
		heroTitle: text("Hero: title", "Our Team"),
		heroText: textarea(
			"Hero: text",
			"Meet the craftspeople, designers and engineers who bring Majeurs to life. From upholstery and joinery to CAD/CAM, operations and aftercare, our team blends heritage craft with modern systems to deliver world-class work—responsibly.",
		),
		heroImage: image("Hero: image", upload("contact-majeurs-furniture-brand-lagos-nigeria.webp")),

		teamTitle: text("Team: title", "Meet the team"),
		teamLinks: list("Team: links", { cta: link("Link") }, [
			{ cta: { label: "Our Leadership", href: "/majeurs-leadership/" } },
			{ cta: { label: "Join us", href: "/career/" } },
		]),
		members: list(
			"Team: members",
			{ name: text("Name"), role: text("Role"), image: image("Photo", "", "Landscape, 3:2") },
			[
				{ name: "Adejumoke Adefila", role: "Group Brand + Strategy", image: upload("Frame-5.webp") },
				{ name: "Funmilola", role: "Group Human Resource Head", image: upload("Frame-4.webp") },
				{ name: "Joy", role: "Group Revenue", image: upload("Frame-7.webp") },
				{ name: "Joshua", role: "Group Finance", image: upload("Frame-2.webp") },
				{ name: "Precious", role: "Production + Operations", image: upload("Frame-1.webp") },
				{ name: "Janet", role: "Compliance", image: upload("Frame-6.webp") },
			],
			{ itemLabel: "member" },
		),
	},
});
