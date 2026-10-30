import { definePage, image, link, list, text, upload } from "../model.ts";
import { CATALOGUE_PATH, trustItems } from "./collectionsLanding.ts";

const catalogue = { label: "Download Catalogue", href: CATALOGUE_PATH };

export const forInteriorDesigners = definePage({
	id: "forInteriorDesigners",
	wpId: 88,
	path: "/for-interior-designers/",
	title: "For Interior Designers page content",
	fields: {
		heroTitle: text("Hero: title", "For Interior Designers"),
		heroText: text("Hero: text", "Majeurs Holdings has unique collections for interior designers."),
		heroImage: image("Hero: image", upload("contact-majeurs-furniture-brand-lagos-nigeria.webp")),
		heroCta: link(
			"Hero: button",
			{ label: "Trade pricing and services", href: "/bespoke-furniture-collections-for-interior-designers/" },
			"Leave empty for no button.",
		),

		collections: list(
			"Collections",
			{ title: text("Title"), image: image("Image", "", "Square"), cta: link("Button") },
			[
				{ title: "Living room", image: upload("Eniola_sofa_Majeurs_Furnitures_06.webp"), cta: catalogue },
				{ title: "Dining", image: upload("dinner-table-5_Majeurs_Furnitures_01.webp"), cta: catalogue },
				{ title: "Beddings", image: upload("Sodiq_bedroom_Majeurs_Furnitures_01.webp"), cta: catalogue },
				{ title: "Office", image: upload("The-Executive-L-Shaped-Office-Table.webp"), cta: catalogue },
				{ title: "Accent chairs", image: upload("Morire_Arm-chair_Majeurs_Furnitures_06.webp"), cta: catalogue },
				{ title: "Hospitality", image: upload("Gaia-Africa-Lounge-Area-1024x1024.webp"), cta: catalogue },
			],
			{ itemLabel: "collection" },
		),

		trustTitle: text("Trust strip: title", "Trusted by thousands"),
		trust: trustItems(),
	},
});
