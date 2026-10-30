import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

const category = (label: string, href: string, file: string) => ({ cta: { label, href }, image: upload(file) });

export const home = definePage({
	id: "home",
	wpId: 6276,
	path: "/",
	title: "Home page content",
	fields: {
		heroTitle: text("Hero: title", "Handcrafted African Furniture"),
		heroText: text(
			"Hero: text",
			"Majeurs is a top African furniture design and manufacturer building at large scale. Each piece is made to commission, crafted by hand, and built to outlast every trend.",
		),
		heroImage: image("Hero: image", upload("Arranging_furniture_in_living_room_2K_202609082139-scaled.jpeg")),
		heroCta: link("Hero: button", { label: "Shop Now", href: "/shop/" }),

		newTitle: text("New furniture: title", "All New From Our Furniture Showroom", "The products are the newest in the shop."),
		newCta: link("New furniture: button", { label: "Shop All", href: "/shop/" }),

		rnrTitle: text("Root and Reverence: title", "The Root and Reverence Collection"),
		rnrText: textarea(
			"Root and Reverence: text",
			"A three-piece limited-edition furniture collection. Each collection tells a unique story deeply rooted in African heritage.",
		),
		rnrImage: image("Root and Reverence: image", upload("Placing_chair_and_table_2K_202609042308-scaled.webp")),
		rnrCta: link("Root and Reverence: button", { label: "Shop All", href: "/root-and-reverence-collection/" }),
		rnrPieces: list(
			"Root and Reverence: slider",
			{ name: text("Name"), image: image("Image") },
			[
				{ name: "Dandan – The Accent Chair of Certainty", image: upload("1-3-1.webp") },
				{ name: "Erelu – The Tempered Glass-Top Dining Table", image: upload("1-2-1.webp") },
				{ name: "Abobaku – High-back lounge Armchair", image: upload("2-2-1.webp") },
			],
			{ itemLabel: "piece" },
		),
		// Root and Reverence pieces are waitlist-only (not in the Store API), so they link to the collection page
		rnrPieceCta: link("Root and Reverence: slider link", { label: "Join Waitlist", href: "/root-and-reverence-collection/" }),

		tradeTitle: text("Trade program: title", "Our Trade Program"),
		tradeText: textarea(
			"Trade program: text",
			"Architects, interior designers, property developers, hoteliers, and procurement teams working on projects of real scale, this is built for you.\n\nThe Majeurs Trade Programme gives qualified professionals a direct relationship with the manufacturer behind the furniture: custom dimensions, material and finish flexibility, coordinated production, and a dedicated point of contact, structured around your project rather than a catalogue page.",
		),
		tradeCta: link("Trade program: button", { label: "Learn More", href: "/majeurs-trade-program/" }),

		categoriesTitle: text("Shop by category: title", "Shop by Category"),
		categories: list(
			"Shop by category: categories",
			{ cta: link("Category link"), image: image("Image") },
			[
				category("Armchairs", "/product-category/armchairs/", "elementor/thumbs/Irorun_Armchair_5-rm1pt5jb91c93oqiiirdfpi7u9nwc2x4emoo080i6m.webp"),
				category("Beds", "/product-category/beds/", "elementor/thumbs/Gida-–-The-Modern-Panel-Bed-6-rlr08tnfbq7qckouw66yxv0gou1llhyz1dhbdqin7y.webp"),
				category("Nursery", "/product-category/children/", "elementor/thumbs/Uwa-The-Children-Collection-rl4d5tekgfuma11mfzuozyt9zrznbf9nqz3n8ropvy.webp"),
				category("Accent Pieces", "/product-category/stool/", "elementor/thumbs/4-rtufvndsa5flvm2m12fhfdmcz6luip4ngzrmoqpc7i.jpg"),
				category("Office", "/product-category/office/", "elementor/thumbs/2-9-rl4cv1781v3732pieu1rw6rwnn520fgillo41hob9q.webp"),
				category("Sofas", "/product-category/sofas/", "elementor/thumbs/Eniola_4-seaters_sofa_Majeurs_Furnitures_05-rjcbj2z59pd4wx5b43v89x1kb3wgmt60xl1j46o1la.webp"),
				category("Tables", "/product-category/tables/", "dinner-table-5_Majeurs_Furnitures_02-1.webp"),
			],
			{ itemLabel: "category" },
		),
		categoriesAllLink: link("Shop by category: text link", { label: "View all products", href: "/shop/" }),
		categoriesCta: link("Shop by category: button", { label: "Get our Catalog", href: "/catalogue/" }),

		promisesTitle: text("Every production includes: title", "What Every Furniture Production Includes"),
		promises: list(
			"Every production includes: points",
			{ title: text("Title"), text: textarea("Text") },
			[
				{
					title: "Made by Hand",
					text: "Every furniture piece moves through the same artisan hands from raw material to final finish. No outsourced production. No shortcuts in the joinery.",
				},
				{
					title: "Made to Commission",
					text: "The collection is a starting point. Every dimension, material, and finish can be adjusted to match the space and the brief.",
				},
				{
					title: "A Dedicated Point of Contact",
					text: "Every residential and trade client receives a single point of contact throughout the furniture production, from first enquiry to delivery.",
				},
				{
					title: "Designed to Be Kept",
					text: "Majeurs furniture pieces are not designed to be replaced in 5 years. They are built from materials that improve with age.",
				},
			],
			{ itemLabel: "point", instructions: "Each point's icon is set by its position (hammer, ruler, person, gem)." },
		),

		journalTitle: text("Journal: title", "Journals, Blogs, and Publications", "The posts are the latest four on the blog."),
		journalText: textarea("Journal: text", "Craft notes, design stories, and studio updates from Lagos."),
		journalCta: link("Journal: button", { label: "Read All", href: "/blog/" }),
	},
});
