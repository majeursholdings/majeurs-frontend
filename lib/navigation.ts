/**
 * Site navigation, mirrored from the WordPress header (template 6795) and footer.
 * Keep labels and URLs identical to WP until a redesign is agreed.
 */

export type NavLink = { label: string; href: string; external?: boolean };

/** Desktop top bar (beige strip above the header). On mobile these show as the "More from Majeurs" tiles. */
export const topBarLinks: NavLink[] = [
	{ label: "About", href: "/about-majeurs-holdings/" },
	{ label: "Catalogue", href: "/catalogue/" },
	{ label: "Furniture Care", href: "/furniture-care-service/" },
	{ label: "Trade Program", href: "/majeurs-trade-program/" },
];

/** Categories in the Shop mega menu and the mobile menu */
export const shopCategories: NavLink[] = [
	{ label: "Armchair", href: "/product-category/armchairs/" },
	{ label: "Beds", href: "/product-category/beds/" },
	{ label: "Children", href: "/product-category/children/" },
	{ label: "Office", href: "/product-category/office/" },
	{ label: "Sofa", href: "/product-category/sofas/" },
	{ label: "Stool", href: "/product-category/stool/" },
	{ label: "Table", href: "/product-category/tables/" },
];

export const mainNav: NavLink[] = [
	{ label: "Custom-Made Furniture", href: "/custom-made-furniture-in-lagos/" },
	{ label: "Our Collections", href: "/root-and-reverence-collection/" },
];

export const footerColumns: { title: string; links: NavLink[] }[] = [
	{
		title: "Shop",
		links: [
			{ label: "Armchair", href: "/product-category/armchairs/" },
			{ label: "Beds", href: "/product-category/beds/" },
			{ label: "Children", href: "/product-category/children/" },
			{ label: "Office", href: "/product-category/office/" },
			{ label: "Sofa", href: "/product-category/sofas/" },
			{ label: "Table", href: "/product-category/tables/" },
		],
	},
	{
		title: "Discover",
		links: [
			{ label: "Catalogue", href: "/catalogue/" },
			{ label: "Our Blog", href: "/blog/" },
			{ label: "Mande", href: "https://www.mande.com.ng/", external: true },
			{ label: "Furniture Academy", href: "/majeurs-furniture-academy/" },
			{ label: "Sustainability Program", href: "https://atunlo.majeurs.com/?referral=majeurs-footer", external: true },
			{ label: "Careers", href: "/career/" },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About Us", href: "/about-majeurs-holdings/" },
			{ label: "Trade Program", href: "/majeurs-trade-program/" },
			{ label: "Root and Reverence", href: "/root-and-reverence-collection/" },
			{ label: "FAQs", href: "/faqs/" },
			{ label: "Contact Us", href: "/contact-majeurs-holdings/" },
			{ label: "Furniture Restoration", href: "/furniture-care-service/" },
		],
	},
	{
		title: "Policies",
		links: [
			{ label: "Privacy Policy", href: "/privacy-policy/" },
			{ label: "Warranty Policy", href: "/warranty-policy/" },
			{ label: "Shipping Policy", href: "/shipping-policy/" },
			{ label: "Return Policy", href: "/refund_returns/" },
			{ label: "Cookie Policy", href: "/cookie-policy/" },
			{ label: "Terms of Use", href: "/terms-of-use/" },
		],
	},
];

export const socialLinks: NavLink[] = [
	{ label: "Instagram", href: "https://www.instagram.com/majeursholdings/", external: true },
	{ label: "LinkedIn", href: "https://ng.linkedin.com/company/majeursholdings", external: true },
	{ label: "YouTube", href: "https://www.youtube.com/@MAJEURSHOLDINGS", external: true },
];

export const blogCategories: NavLink[] = [
	{ label: "Academy", href: "/category/academy/" },
	{ label: "Community", href: "/category/community/" },
	{ label: "Design", href: "/category/design/" },
	{ label: "Manufacturing", href: "/category/manufacturing/" },
	{ label: "Product", href: "/category/product/" },
	{ label: "Trade Program", href: "/category/trade-program/" },
];
