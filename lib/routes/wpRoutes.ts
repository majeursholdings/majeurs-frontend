/**
 * Every public URL of the WordPress site (majeurs.com), captured 27 Oct 2026 from the
 * WP REST API, the Rank Math sitemaps and Rank Math > Redirections.
 *
 * This file is the single source of truth for "did we cover every URL?":
 *  - app/ has a route (folder) for every entry below.
 *  - next.config.ts turns `legacyRedirects` into redirects().
 *  - proxy.ts answers `goneUrls` with HTTP 410.
 *  - scripts/check-routes.mjs requests every URL here against a running server and
 *    fails on any 404 / 5xx.
 *
 * Product, category, post and project slugs are a snapshot. Once the WP data layer exists,
 * generateStaticParams should read them from WordPress instead (dynamicParams stays on,
 * so products added in wp-admin later still render).
 */

export type StaticPage = {
	path: string;
	/** WordPress page ID (null = archive / new route) */
	wpId: number | null;
	title: string;
	/** Build phase from docs/IMPLEMENTATION_PLAN.md */
	phase: 1 | 2 | 3 | 4;
	note?: string;
};

export const staticPages: StaticPage[] = [
	{ path: "/", wpId: 6276, title: "Home", phase: 1 },
	{ path: "/shop/", wpId: 10, title: "Shop", phase: 1 },
	{ path: "/blog/", wpId: 2217, title: "Blog", phase: 2 },
	{ path: "/about-majeurs-holdings/", wpId: 70, title: "About Majeurs Holdings", phase: 2 },
	{ path: "/our-team/", wpId: 877, title: "Our Team", phase: 2 },
	{ path: "/majeurs-leadership/", wpId: 988, title: "Majeurs Leadership", phase: 2 },
	{ path: "/catalogue/", wpId: 84, title: "Catalogue", phase: 2 },
	{ path: "/catalogue/check-your-inbox-for-catalogue/", wpId: 6686, title: "Check Your Inbox for the Catalogue", phase: 2, note: "Thank-you page after the catalogue form. Not in the sitemap; keep noindex." },
	{ path: "/showrooms/", wpId: 76, title: "Showrooms", phase: 2, note: "Live page is empty (title only). Build properly or redirect." },
	{ path: "/plan-a-visitation/", wpId: 1186, title: "Plan a Visitation", phase: 2 },
	{ path: "/events/", wpId: 78, title: "Events", phase: 2, note: "Live page is empty (title only). Build properly or redirect." },
	{ path: "/majeurs-trade-program/", wpId: 6135, title: "Majeurs Trade Program", phase: 2 },
	{ path: "/majeurs-trade-program/majeurs-trade-program-registration-completed/", wpId: 6204, title: "Trade Program Registration Completed", phase: 2, note: "Thank-you page. Not in the sitemap; keep noindex." },
	{ path: "/for-interior-designers/", wpId: 88, title: "For Interior Designers", phase: 2 },
	{ path: "/bespoke-furniture-collections-for-interior-designers/", wpId: 3616, title: "Bespoke Furniture Collections for Interior Designers", phase: 2 },
	{ path: "/for-developers/", wpId: 86, title: "For Architects and Developers", phase: 2 },
	{ path: "/custom-made-furniture-in-lagos/", wpId: 1264, title: "Custom-Made Furniture in Lagos", phase: 2 },
	{ path: "/get-a-quote-for-custom-made-furniture-in-lagos/", wpId: 5684, title: "Get a Quote for Custom-Made Furniture in Lagos", phase: 2 },
	{ path: "/get-a-quote-for-custom-made-furniture-in-lagos/quote-request-received/", wpId: 6767, title: "Quote Request Received", phase: 2, note: "Thank-you page. Not in the sitemap; keep noindex." },
	{ path: "/bespoke-product/", wpId: 80, title: "Bespoke Product", phase: 2, note: "Live page is empty (title only). Build properly or redirect." },
	{ path: "/root-and-reverence-collection/", wpId: 5807, title: "Root and Reverence Collection", phase: 2 },
	{ path: "/mande/", wpId: 101, title: "Mande", phase: 2 },
	{ path: "/furniture-care-service/", wpId: 74, title: "Furniture Care Service", phase: 2 },
	{ path: "/materials-and-care/", wpId: 7448, title: "Materials & Care", phase: 2 },
	{ path: "/warranty-policy/", wpId: 94, title: "Warranty Policy", phase: 2 },
	{ path: "/shipping-policy/", wpId: 2468, title: "Shipping Policy", phase: 2 },
	{ path: "/refund_returns/", wpId: 14, title: "Refund and Returns Policy", phase: 2 },
	{ path: "/terms-of-use/", wpId: 2485, title: "Terms of Use", phase: 2 },
	{ path: "/privacy-policy/", wpId: 3, title: "Privacy Policy", phase: 2 },
	{ path: "/cookie-policy/", wpId: 5251, title: "Cookie Policy", phase: 2 },
	{ path: "/faqs/", wpId: 90, title: "FAQs", phase: 2 },
	{ path: "/contact-majeurs-holdings/", wpId: 72, title: "Contact Majeurs Holdings", phase: 2 },
	{ path: "/customer-complaint-and-feedback-form/", wpId: 4828, title: "Customer Complaint and Feedback Form", phase: 2 },
	{ path: "/majeurs-furniture-academy/", wpId: 99, title: "Majeurs Furniture Academy", phase: 2, note: "Full page; sign-up and sponsor links go to WhatsApp until the Academy portal exists." },
	{ path: "/career/", wpId: 788, title: "Careers", phase: 2, note: "Openings list + job pages (/career/<slug>/) from the WP career post type." },
	{ path: "/project/", wpId: null, title: "Projects", phase: 2, note: "Archive of the 'project' post type." },
	{ path: "/search/", wpId: null, title: "Search", phase: 1, note: "Replaces WP's /?s=keyword&post_type=product (redirected in proxy.ts)." },
	{ path: "/cart/", wpId: 11, title: "Cart", phase: 3 },
	{ path: "/checkout/", wpId: 12, title: "Checkout", phase: 3 },
	{ path: "/wishlist/", wpId: 1568, title: "Wishlist", phase: 1 },
	{ path: "/my-account/", wpId: 13, title: "My Account", phase: 4, note: "Stays on WooCommerce until Phase 4." },
];

/** /product/<slug>/ */
export const productSlugs: string[] = ["luxury-4-seater-sofa-nigeria-handcrafted-chair", "olamide-purposeful-2-seater-living-room-sofa", "osisi-the-oval-meeting-table", "haske-the-round-side-table", "saro-the-metal-frame-shelved-workstation", "ukunhi-the-executive-l-shaped-office-table", "ujama-the-open-storage-wooden-desk", "eziokwu-the-minimalist-workstation-chair", "ireti-the-soft-clean-ottoman", "oramma-a-mix-of-textures-stool", "nnedi-the-classic-stool", "ganam-strong-and-steady-stool", "gbeze-the-tall-storage-bookshelf", "lafiya-the-minimalist-desk-chair", "sama-the-simple-kids-desk", "tufafi-the-multi-section-toy-storage", "girma-the-low-wall-shelf", "uwa-the-new-life-child-bed", "sodiq-the-double-cushion-bed", "kunle-the-deep-tufted-wingback-bed", "gida-the-modern-panel-bed", "amara-the-tall-diamond-stitched-bed", "arike-the-wrap-around-bed", "zamani-the-slim-stone-dining-table", "tari-the-round-stone-dining-table", "odu-the-solid-wooden-coffee-table", "chia-the-marble-column-table", "yara-the-two-section-hourglass-table", "tola-the-floating-marble-side-table", "luxury-3-seater-velvet-sofa-chair", "uzoe-2-seaters-leather-sofa", "chioma-the-architecture-of-a-home", "uzoe-3-seaters-leather-sofa", "ifuna-the-art-of-close-conversation", "yachi-2-seaters-sofa", "ayomi-joy-unfolding-l-shaped-sofa", "ireti-the-shape-of-hope", "eniola-3-seaters-handcrafted-luxury-sofa-chair", "orisa-the-l-shaped-sectional-sofa", "imole-the-sofa-that-carries-the-warmth-of-home", "ayanfe-luxury-bespoke-leather-sofa-chair", "tiambi-luxury-velvet-lounge-sofa", "obie-ike-luxury-3-seater-leather-sofa", "fansa-the-luxury-bespoke-leather-sofa", "faraja-luxury-handcrafted-lounge-sofa", "uzuri-luxury-3-seater-sofa", "komi-the-focused-task-lounge-chair", "morire-the-light-filled-accent-chair", "waseyi-the-accomplished-lounge-chair", "tolu-the-high-back-sanctuary-chair", "ebonife-the-modern-swivel-lounge", "ranma-the-elegant-side-armchair", "ziko-the-architectural-statement-chair", "chinedu-the-grounded-lounge-chair", "somto-the-generous-club-chair", "uzoe-armchair-the-industrial-leather-armchair", "yachi-armchair-the-curved-sanctuary-chair", "kamsi-the-tufted-leather-high-back", "eze-the-sculptural-pedestal-chair", "wadani-the-open-frame-lounge-chair", "sarki-the-layered-command-chair", "ichie-the-architectural-statement-chair", "irorun-the-mixed-material-lounge-chair", "rafiki-the-welcoming-club-chair", "awo-the-deep-set-seclusion-chair", "umoya-the-minimalist-slipper-chair", "okiki-the-sculptural-curved-chair", "dukiya-the-deep-seated-lounge-chair", "ayomi-armchair-the-vibrant-accent-chair", "ayomi-joy-unfolding-3-seaters-modular-sofa", "asamo-the-curved-minimalist-bed", "arikede-the-plush-sanctuary-chair", "amarachi-the-pill-shaped-coffee-table"];

/** /product-category/<path>/ (nested categories keep their parent path) */
export const productCategoryPaths: string[] = ["armchairs", "sofas", "sofas/2-seaters", "sofas/3-seaters", "sofas/4-seaters", "sofas/l-shaped", "beds", "children", "children/beds-children", "children/chair", "children/desk", "children/shelf", "children/storage", "office", "stool", "tables", "tables/coffee-tables", "tables/dining-tables", "tables/side-tables"];

/** /product-tag/<slug>/ */
export const productTagSlugs: string[] = ["boutique-hotel-rooms", "boutique-lounges", "calm-commercial-interiors", "contemporary-living-rooms", "creative-office-spaces", "creative-studios", "designer-homes", "executive-boardrooms", "executive-office-lounges", "family-living-rooms", "high-end-lounge-areas", "hospitality-lounges", "large-family-dining-rooms", "modern-entryways", "modern-hospitality-spaces", "modern-living-rooms", "rustic-modern-lounges", "small-apartments"];

/** Blog posts live at the site root: /<slug>/ */
export const blogPostSlugs: string[] = ["opening-a-trade-account-with-majeurs-an-african-luxury-furniture-house-what-interior-designers-should-know", "luxury-contract-furniture-supplier-for-boutique-hotels", "ffe-furniture-supplier-west-africa-specifiers-guide", "furniture-manufacturing-skills-gap", "engineered-childrens-furniture-high-performance", "the-15th-floor-problem-the-monolithic-modular-solution", "the-uzoe-collection-where-furniture-meets-design", "what-it-really-means-to-build-a-manufacturing-business-in-africa", "the-next-chapter-our-vision-for-african-design-manufacturing-beginning-2026", "more-than-an-object-why-legacy-gifting-is-the-future-of-meaningful-holidays"];

/** /category/<slug>/ (blog categories) */
export const blogCategorySlugs: string[] = ["academy", "community", "design", "manufacturing", "product", "trade-program"];

/** /project/<slug>/ */
export const projectSlugs: string[] = ["gaia-africa-lounge-area"];

/** /career/<slug>/ (WP "career" post type) */
export const careerSlugs: string[] = ["nysc-procurement-officer", "group-general-manager-head-of-company-operations-performance", "lead-conversion-executive", "head-of-academy-growth", "welding-and-fabrication-lead-craft-instructor", "upholstery-lead-craft-instructor", "technical-drawing-instructor", "furniture-and-woodwork-lead-craft-instructor", "lead-generation-and-digital-marketing-lead"];

export type LegacyRedirect = { source: string; destination: string; permanent: boolean; note: string };

/** Old URLs that must keep working. permanent:false = still to confirm (see note). */
export const legacyRedirects: LegacyRedirect[] = [
	{ source: "/home/", destination: "/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/locations/", destination: "/contact-majeurs-holdings/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/academy/partner-with-us/", destination: "/majeurs-furniture-academy/become-a-partner-or-sponsor/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/sofas/", destination: "/product-category/sofas/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/children/", destination: "/product-category/children/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/budget/", destination: "/shop/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/beds/", destination: "/product-category/beds/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/arm_chair/", destination: "/product-category/armchairs/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/sodiq-the-double-cushion-bed-king/", destination: "/product/sodiq-the-double-cushion-bed/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/sodiq-the-double-cushion-bed-queen/", destination: "/product/sodiq-the-double-cushion-bed/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/luxury-4-seater-sofa-nigeria-handcrafted-chair-dusty-beige/", destination: "/product/luxury-4-seater-sofa-nigeria-handcrafted-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/luxury-4-seater-sofa-nigeria-handcrafted-chair-gazebo-grey/", destination: "/product/luxury-4-seater-sofa-nigeria-handcrafted-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/sofas/obi_ike/", destination: "/product/obie-ike-luxury-3-seater-leather-sofa/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/obie-ike-luxury-3-seater-leather-sofa-medium-toned-ash-blue/", destination: "/product/obie-ike-luxury-3-seater-leather-sofa/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/obie-ike-luxury-3-seater-leather-sofa-black-rose/", destination: "/product/obie-ike-luxury-3-seater-leather-sofa/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/sofas/imole/", destination: "/product/imole-the-sofa-that-carries-the-warmth-of-home/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/imole-the-sofa-that-carries-the-warmth-of-home-crimson-valor/", destination: "/product/imole-the-sofa-that-carries-the-warmth-of-home/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/imole-the-sofa-that-carries-the-warmth-of-home-medium-dark-blue/", destination: "/product/imole-the-sofa-that-carries-the-warmth-of-home/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/imole-the-sofa-that-carries-the-warmth-of-home-medium-toned-ash-blue/", destination: "/product/imole-the-sofa-that-carries-the-warmth-of-home/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/sofas/fansa/", destination: "/product/fansa-the-luxury-bespoke-leather-sofa/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/fansa-the-luxury-bespoke-leather-sofa-el-paso-green/", destination: "/product/fansa-the-luxury-bespoke-leather-sofa/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/fansa-the-luxury-bespoke-leather-sofa-black-rose/", destination: "/product/fansa-the-luxury-bespoke-leather-sofa/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/office/ukunhi/", destination: "/product/ukunhi-the-executive-l-shaped-office-table/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/office/ujama/", destination: "/product/ujama-the-open-storage-wooden-desk/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/office/saro/", destination: "/product/saro-the-metal-frame-shelved-workstation/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/office/osisi/", destination: "/product/osisi-the-oval-meeting-table/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/office/eziokwu/", destination: "/product/eziokwu-the-minimalist-workstation-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/children/uwa/", destination: "/product/uwa-the-new-life-child-bed/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/children/sama/", destination: "/product/sama-the-simple-kids-desk/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/children/girma/", destination: "/product/girma-the-low-wall-shelf/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/budget/lafiya/", destination: "/product/lafiya-the-minimalist-desk-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/beds/arike/", destination: "/product/arike-the-wrap-around-bed/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/arm_chair/wadani/", destination: "/product/wadani-the-open-frame-lounge-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/wadani-the-open-frame-lounge-chair-electric-blue/", destination: "/product/wadani-the-open-frame-lounge-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/wadani-the-open-frame-lounge-chair-medium-toned-ash-blue/", destination: "/product/wadani-the-open-frame-lounge-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/wadani-the-open-frame-lounge-chair-sweet-mulled-cider/", destination: "/product/wadani-the-open-frame-lounge-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/arm_chair/sarki/", destination: "/product/sarki-the-layered-command-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/arm_chair/rafiki/", destination: "/product/rafiki-the-welcoming-club-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/arm_chair/okiki/", destination: "/product/okiki-the-sculptural-curved-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/okiki-the-sculptural-curved-chair-burnt-maroon/", destination: "/product/okiki-the-sculptural-curved-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/okiki-the-sculptural-curved-chair-cola/", destination: "/product/okiki-the-sculptural-curved-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/okiki-the-sculptural-curved-chair-dusty-beige/", destination: "/product/okiki-the-sculptural-curved-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/arm_chair/irorun/", destination: "/product/irorun-the-mixed-material-lounge-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/arm_chair/ichie/", destination: "/product/ichie-the-architectural-statement-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/ichie-the-architectural-statement-chair-leather/", destination: "/product/ichie-the-architectural-statement-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/product/ichie-the-architectural-statement-chair-velvet/", destination: "/product/ichie-the-architectural-statement-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/arm_chair/dukiya/", destination: "/product/dukiya-the-deep-seated-lounge-chair/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/category/arm_chair/dandan/", destination: "/root-and-reverence-collection/", permanent: true, note: "Rank Math redirection (live WP)" },
	{ source: "/industrial-access/", destination: "/majeurs-trade-program/", permanent: true, note: "Old page, replaced by the Trade Program page" },
	{ source: "/compare/", destination: "/shop/", permanent: true, note: "Product compare removed in the rebuild" },
	{ source: "/product-category/3-seaters-2/", destination: "/shop/", permanent: false, note: "Empty/unused WP product category. Confirm, then make permanent" },
	{ source: "/product-category/4-seaters-2/", destination: "/shop/", permanent: false, note: "Empty/unused WP product category. Confirm, then make permanent" },
	{ source: "/product-category/the-deal-collection/", destination: "/shop/", permanent: false, note: "Empty/unused WP product category. Confirm, then make permanent" },
	{ source: "/product-category/uncategorized/", destination: "/shop/", permanent: false, note: "Empty/unused WP product category. Confirm, then make permanent" },
	{ source: "/product-tag/group-fansa/", destination: "/shop/", permanent: false, note: "Empty internal 'group-' tag. Confirm, then make permanent" },
	{ source: "/product-tag/group-ichie/", destination: "/shop/", permanent: false, note: "Empty internal 'group-' tag. Confirm, then make permanent" },
	{ source: "/product-tag/group-imole/", destination: "/shop/", permanent: false, note: "Empty internal 'group-' tag. Confirm, then make permanent" },
	{ source: "/product-tag/group-obie-ike/", destination: "/shop/", permanent: false, note: "Empty internal 'group-' tag. Confirm, then make permanent" },
	{ source: "/product-tag/group-okiki/", destination: "/shop/", permanent: false, note: "Empty internal 'group-' tag. Confirm, then make permanent" },
	{ source: "/product-tag/group-olamide/", destination: "/shop/", permanent: false, note: "Empty internal 'group-' tag. Confirm, then make permanent" },
	{ source: "/product-tag/group-sodiq/", destination: "/shop/", permanent: false, note: "Empty internal 'group-' tag. Confirm, then make permanent" },
	{ source: "/product-tag/group-wadani/", destination: "/shop/", permanent: false, note: "Empty internal 'group-' tag. Confirm, then make permanent" },
	{ source: "/category/uncategorized/", destination: "/blog/", permanent: true, note: "Empty blog category" },
	{ source: "/majeurs-furniture-academy/student-registration/", destination: "/majeurs-furniture-academy/", permanent: false, note: "TODO: point to the Academy portal URL, then make permanent" },
	{ source: "/majeurs-furniture-academy/student-registration-waitlist/", destination: "/majeurs-furniture-academy/", permanent: false, note: "TODO: point to the Academy portal URL, then make permanent" },
	{ source: "/majeurs-furniture-academy/donate/", destination: "/majeurs-furniture-academy/", permanent: false, note: "TODO: point to the Academy portal URL, then make permanent" },
	{ source: "/majeurs-furniture-academy/donate-thank-you/", destination: "/majeurs-furniture-academy/", permanent: false, note: "TODO: point to the Academy portal URL, then make permanent" },
	{ source: "/majeurs-furniture-academy/hire-a-student/", destination: "/majeurs-furniture-academy/", permanent: false, note: "TODO: point to the Academy portal URL, then make permanent" },
	{ source: "/majeurs-furniture-academy/become-a-partner-or-sponsor/", destination: "/majeurs-furniture-academy/", permanent: false, note: "TODO: point to the Academy portal URL, then make permanent" },
];

/** URLs WordPress answers with 410 Gone (Rank Math). Served by proxy.ts. */
export const goneUrls: string[] = ["/category/beds/red-chesterfield/", "/category/budget/agbenu/", "/category/budget/anders/", "/category/budget/ba-damua/", "/category/budget/ebi/", "/category/budget/ewa/", "/category/budget/fida/", "/category/budget/hadithi/", "/category/budget/idi-mma/", "/category/budget/isura/", "/category/budget/jaiye/", "/category/budget/jin-dadi/", "/category/budget/jua/", "/category/budget/kunye/", "/category/budget/oba/", "/category/budget/ola/", "/category/budget/omi/", "/category/budget/osa/", "/category/budget/safi/", "/category/budget/tokatoka/", "/category/budget/ujasiri/", "/category/budget/ukuthula/", "/category/budget/ukuzala/", "/category/budget/uyoko/", "/category/children/salam/", "/category/office/erelu/", "/category/sofas/aisiki/", "/product-category/homewares/", "/product/adun-the-delight-trays/", "/product/agbara-the-strength-large-centerpiece-bowl/", "/product/ayo-the-renewal-bowl-set/", "/product/dundun-the-snack-platter-board/", "/product/erelu-the-glass-top-executive-desk/", "/product/koba-stool-small-yet-striking/", "/product/nuru-light-through-reuse/", "/product/omi-the-essential-cup/", "/product/ore-the-friendship-medium-bowl/", "/product/tula-the-tray-for-gathering/", "/testimonials/", "/career-sitemap.xml"];

/** Every URL that must return 200 on the new site (used by sitemaps and scripts/check-routes.mjs). */
export function allLiveUrls(): string[] {
	return [
		...staticPages.map((p) => p.path),
		...productSlugs.map((s) => `/product/${s}/`),
		...productCategoryPaths.map((p) => `/product-category/${p}/`),
		...productTagSlugs.map((s) => `/product-tag/${s}/`),
		...blogPostSlugs.map((s) => `/${s}/`),
		...blogCategorySlugs.map((s) => `/category/${s}/`),
		...projectSlugs.map((s) => `/project/${s}/`),
		...careerSlugs.map((s) => `/career/${s}/`),
	];
}

export function getStaticPage(path: string): StaticPage {
	const page = staticPages.find((p) => p.path === path);
	if (!page) throw new Error(`No staticPages entry for ${path}`);
	return page;
}
