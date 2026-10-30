import { definePage, image, link, text, textarea, upload } from "../model.ts";
import { bespokeIntro } from "./customRequest.ts";

export const getAQuote = definePage({
	id: "getAQuote",
	wpId: 5684,
	path: "/get-a-quote-for-custom-made-furniture-in-lagos/",
	title: "Get a quote page content",
	fields: {
		heroTitle: text("Hero: title", "Get A Quote In Less Than 24 Hrs"),
		heroImage: image("Hero: image", upload("close-up-shoot-showing-Majeurs-workman-making-a-marking-on-a-wood-piece-1.webp")),
		heroCta: link("Hero: button", { label: "Get started", href: "#quote" }, "#quote jumps to the form below"),

		formTitle: text("Form: title", "Dimensions · Finishes · Timeline"),
		formIntro: textarea("Form: intro", bespokeIntro),
	},
});
