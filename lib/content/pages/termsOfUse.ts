import { definePage, rich, text } from "../model.ts";

export const termsOfUse = definePage({
	id: "termsOfUse",
	wpId: 2485,
	path: "/terms-of-use/",
	title: "Terms of Use page content",
	fields: {
		title: text("Title", "Terms of Use"),
		lastUpdated: text("Last updated", "", "Shown under the title, e.g. “Last updated 28 January 2026”. Leave empty to hide it."),
		body: rich(
			"Policy text",
			`<h2>1. Scope of Services &amp; Shipping</h2>
<ul>
<li><strong>Service Areas:</strong> We provide delivery services to customers in Nigeria, various other African countries, the USA, the UK, and Europe.</li>
<li><strong>Carriers:</strong> We utilize reputable carriers such as DHL and UPS to ensure reliable delivery worldwide.</li>
<li><strong>International Packaging:</strong> All international items are securely packed in crates to protect furniture during transit.</li>
<li><strong>Delivery Method:</strong><ul>
<li>We aim for door-to-door delivery for all orders.</li>
<li><strong>Access Issues:</strong> If door-to-door delivery is not feasible due to restrictions (e.g., residential access, remote locations), it is the customer’s responsibility to make necessary provisions.</li>
<li><strong>Additional Costs:</strong> Any additional transportation costs required to overcome delivery constraints are the responsibility of the customer.</li>
</ul></li>
</ul>
<h2>2. Orders, Cancellations, and Financial Terms</h2>
<ul>
<li><strong>Shipping Costs:</strong> Shipping fees are calculated based on location, size, and weight, and are clearly stated at the time of purchase.</li>
<li><strong>Non-Refundable Fees:</strong> Shipping costs are non-refundable, even for returns, unless the error is ours (e.g., wrong or defective item).</li>
<li><strong>Customs &amp; Duties:</strong> For international deliveries, customers are responsible for all customs duties, import taxes, or local fees. These are not included in the shipping costs.</li>
</ul>
<h2>3. Returns, Refunds, and Exchanges</h2>
<ul>
<li><strong>Eligibility Window:</strong> Items may be returned or exchanged within 30 days of delivery.</li>
<li><strong>Condition of Items:</strong> Products must be returned unused, in original condition, and with all original packaging and accessories.</li>
<li><strong>Exceptions &amp; Non-Returnable Items:</strong><ul>
<li><strong>Final Sale:</strong> Items marked “final sale” are not eligible for return or exchange.</li>
<li><strong>Custom Products:</strong> Custom or made-to-order items are eligible for exchange or store credit only, unless defective.</li>
<li><strong>Discrepancies:</strong> Refunds are not available based on color or size discrepancies; customers must check specifications before ordering.</li>
</ul></li>
<li><strong>Return Shipping:</strong> Customers are responsible for properly packaging items and paying for return shipping, which is non-refundable.</li>
<li><strong>Damaged/Defective Items:</strong> Issues must be reported to customer service within 48 hours of delivery with photographic evidence.</li>
</ul>
<h2>4. Privacy and Data Usage</h2>
<ul>
<li><strong>Data Collection:</strong> We collect personal information (e.g., name, payment info) and non-personal information (e.g., browsing history) directly from you and via cookies.</li>
<li><strong>Usage:</strong> Your data is used for order fulfillment, analyzing site traffic, and personalizing content.</li>
<li><strong>Third-Party Sharing:</strong> We share information with service providers for operations (e.g., payment processing, email distribution) and when legally required.</li>
<li><strong>Marketing:</strong> We do not sell personal information for direct marketing without consent. You may opt out of promotional communications at any time.</li>
<li><strong>Children:</strong> The website is not intended for children under 16.</li>
</ul>
<h2>5. Contact Information</h2>
<p>For questions regarding these terms, please contact Majeurs Holdings:</p>
<ul>
<li><strong>Email:</strong> <a href="mailto:customerservice@majeursholdings.com">customerservice@majeursholdings.com</a></li>
<li><strong>Nigeria Address:</strong> 32, QMB Builders Mart Road, Opposite Elf Bus Stop, Lekki Phase 1, Lagos State, Nigeria.</li>
<li><strong>UK Address:</strong> 71-75 Shelton Street, Covent Garden, London WC2H 9.</li>
<li><strong>USA Address:</strong> 8 The Green, Dover, DE 19901, U.</li>
</ul>`,
		),
	},
});
