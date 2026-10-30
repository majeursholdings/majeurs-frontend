import { definePage, image, text, upload } from "../model.ts";

export const complaint = definePage({
	id: "complaint",
	wpId: 4828,
	path: "/customer-complaint-and-feedback-form/",
	title: "Customer complaint page content",
	fields: {
		heroTitle: text("Hero: title", "Majeurs Holdings Customer Complaint or Feedback Form"),
		heroImage: image("Hero: image", upload("Customer-Complaint-and-Feedback-Form-page.png")),
	},
});
