import { definePage, rich, text } from "../model.ts";

export const shippingPolicy = definePage({
	id: "shippingPolicy",
	wpId: 2468,
	path: "/shipping-policy/",
	title: "Shipping Policy page content",
	fields: {
		title: text("Title", "Shipping Policy"),
		lastUpdated: text("Last updated", "", "Shown under the title, e.g. “Last updated 28 January 2026”. Leave empty to hide it."),
		body: rich(
			"Policy text",
			`<h2>Scope of Service</h2>
<p>We offer delivery services to customers located in Nigeria, various other African countries, the USA, the UK, and Europe, ensuring that our high-quality furniture reaches you in excellent condition, no matter where you are.</p>
<h2>Packaging and Shipping</h2>
<ul>
<li><strong>Crate Shipping</strong>: All international items are securely packed in crates designed to protect the furniture during transit, ensuring your purchase arrives in pristine condition.</li>
<li><strong>Carriers</strong>: We utilise reputable delivery services such as DHL and UPS to handle our shipments, ensuring efficient and reliable delivery for all our customers worldwide.</li>
</ul>
<h2>Door-to-Door Delivery</h2>
<ul>
<li>We strive to provide door-to-door delivery for all orders. This means we aim to deliver directly to the address specified in your order, making the process as convenient as possible for you.</li>
<li><strong>Access Issues</strong>: In instances where door-to-door delivery is not feasible due to access issues at the delivery location—such as restrictions in residential areas, remote locations, or specific customer premises—it becomes the responsibility of the customer to make necessary provisions.</li>
<li><strong>Additional Costs</strong>: Should there be any additional costs or transportation needed to accommodate the delivery constraints, these will be the responsibility of the customer. We ask that customers plan accordingly and communicate with our delivery team to ensure that any challenges are addressed proactively.</li>
</ul>
<h2>Shipping Costs</h2>
<ul>
<li>Shipping costs are calculated based on the delivery location, the size and weight of the items, and the chosen delivery method. These costs are clearly stated at the time of purchase and included in the final invoice.</li>
<li><strong>Non-refundable</strong>: Please note that shipping costs are non-refundable, even in the case of returns, unless the return is due to an error on our part (such as delivering the wrong item or a defective product).</li>
</ul>
<h2>Important Considerations</h2>
<ul>
<li><strong>Delivery Timeframes</strong>: Estimated delivery times are provided at the time of your order and can vary based on several factors outside our control, such as weather conditions, political unrest, or delays from couriers. We commit to keeping you informed of any significant delays.</li>
<li><strong>Receiving Deliveries</strong>: We encourage customers to inspect their items upon delivery for any damage that may have occurred during shipping. If there are any concerns, please contact our customer service immediately to arrange for a resolution.</li>
<li><strong>International Deliveries</strong>: Customers are responsible for any additional charges that may arise, such as customs duties, import taxes, or other local fees. These charges are not included in our shipping costs and are the responsibility of the customer.</li>
</ul>`,
		),
	},
});
