// The Academy's social links (its accounts on WP). The page's copy, images and buttons are in lib/content/pages/academy.ts

/** The Academy's own WhatsApp (its social links on WP); hiring requests go to the main sales line as on WP */
export const ACADEMY_WHATSAPP = "2348185893377";

export const socials = [
	{ label: "Instagram", href: "https://www.instagram.com/majeursacademy/", icon: "instagram" as const },
	{ label: "LinkedIn", href: "https://ng.linkedin.com/company/majeurs-institute", icon: "linkedin" as const },
	{ label: "Facebook", href: "https://www.facebook.com/majeursacademy/", icon: "facebook" as const },
	{ label: "WhatsApp", href: `https://wa.me/${ACADEMY_WHATSAPP}`, icon: "whatsapp" as const },
];
