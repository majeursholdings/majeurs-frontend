import { definePage, rich, text } from "../model.ts";

export const refundReturns = definePage({
	id: "refundReturns",
	wpId: 14,
	path: "/refund_returns/",
	title: "Refund and Returns Policy page content",
	fields: {
		title: text("Title", "Refund and Returns Policy"),
		lastUpdated: text("Last updated", "", "Shown under the title, e.g. “Last updated 28 January 2026”. Leave empty to hide it."),
		body: rich(
			"Policy text",
			`<p>This policy outlines the conditions under which items purchased from <a href="/">www.majeurs.com</a> can be returned or exchanged.</p>
<h2>Refund and Returns Policy Overview</h2>
<ul>
<li><strong>Eligibility for Returns and Exchanges</strong>: We accept returns and exchanges subject to the conditions outlined below.</li>
<li><strong>Time Frame</strong>: Items are eligible for return or exchange within 30 days of delivery.</li>
<li><strong>Condition of Items</strong>: Products must be returned in their original condition, unused, and with all original packaging and accessories.</li>
<li><strong>Custom and Made-to-Order Products</strong>: Customised or made-to-order items are only eligible for exchange or store credit unless there is a defect in the product.</li>
</ul>
<h2>Returns Process</h2>
<ul>
<li><strong>Initiating a Return</strong>: Contact our customer service team at <a href="mailto:customerservice@majeursholdings.com">customerservice@majeursholdings.com</a> to initiate a return. Please include your order number, details of the item, and the reason for return.</li>
<li><strong>Review and Approval</strong>: Our team will review your request and, if approved, will provide instructions for returning the item.</li>
<li><strong>Shipping</strong>: You are responsible for properly packaging and shipping the item back to us. Return shipping costs are non-refundable.</li>
<li><strong>Refund Processing</strong>: Once we receive the returned item and verify its condition, we will process your refund or exchange. Refunds will be credited to the original method of payment unless otherwise specified.</li>
</ul>
<h2>Exchanges</h2>
<ul>
<li><strong>Initiating an Exchange</strong>: Follow the same process as returns. Please specify in your communication that you wish to exchange the item and the new item you are requesting.</li>
<li><strong>Availability</strong>: Exchanges are subject to the availability of the new item. If the item is not available, we may offer a refund or store credit.</li>
</ul>
<h2>Non-Refundable Items</h2>
<ul>
<li><strong>Final Sale Items</strong>: Items marked as “final sale” are not eligible for return or exchange.</li>
<li><strong>Color and Size Discrepancies</strong>: We strive to display our products as accurately as possible. However, refunds based on colour or size discrepancies are not available. Please ensure you check all product specifications before ordering.</li>
</ul>
<h2>International Returns</h2>
<ul>
<li><strong>International Orders</strong>: Items shipped internationally are eligible for return for repair in cases of defects. Customers are responsible for all return shipping costs, which are non-refundable.</li>
<li><strong>Customs and Duties</strong>: Any customs, duties, or taxes incurred on returned items will be the responsibility of the customer.</li>
</ul>
<h2>Faulty or Damaged Items</h2>
<ul>
<li><strong>Reporting Issues</strong>: If an item arrives damaged or defective, please report it to our customer service within 48 hours of delivery.</li>
<li><strong>Documentation</strong>: Include photographs of the issue, and retain all original packing materials.</li>
<li><strong>Resolution</strong>: We will assess the situation and may offer a replacement, repair, or refund, depending on the specific case.</li>
</ul>
<h2>Contact Information</h2>
<p>For any queries or further information regarding our Returns &amp; Exchanges Policy, please contact us at:</p>
<ul>
<li><strong>Email</strong>: <a href="mailto:customerservice@majeursholdings.com">customerservice@majeursholdings.com</a></li>
<li><strong>Phone</strong>: <a href="tel:+2342013306192">+234 201 330 6192</a></li>
</ul>
<p>This Returns &amp; Exchanges Policy is part of our commitment to ensure that your experience with Majeurs Holdings meets your expectations. We value your business and strive to make every transaction smooth and satisfactory</p>`,
		),
	},
});
