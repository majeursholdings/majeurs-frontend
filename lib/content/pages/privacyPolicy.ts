import { definePage, rich, text } from "../model.ts";

export const privacyPolicy = definePage({
	id: "privacyPolicy",
	wpId: 3,
	path: "/privacy-policy/",
	title: "Privacy Policy page content",
	fields: {
		title: text("Title", "Privacy Policy"),
		lastUpdated: text("Last updated", "", "Shown under the title, e.g. “Last updated 28 January 2026”. Leave empty to hide it."),
		body: rich(
			"Policy text",
			`<h2>Collecting Information About You</h2>
<p>We collect a variety of information from and about you, including:</p>
<ul>
<li>Personal information, such as your name, email address, postal address, phone number, and payment information, which you provide when you register an account, place an order, sign up for our newsletter, or otherwise interact with our site.</li>
<li>Non-personal information, such as browsing history, search history, and interactions with our website and advertisements.</li>
</ul>
<h2>Sources of Personal Information</h2>
<p>We obtain personal information directly from you, as well as automatically through your activities on our site. Sources include:</p>
<ul>
<li>Account registration and order forms.</li>
<li>Cookies and tracking technologies on our website.</li>
<li>Communication with our customer service.</li>
</ul>
<h2>When We Share Information with Third Parties</h2>
<p>We may share your information with third parties in the following circumstances:</p>
<ul>
<li>With service providers who assist us in order fulfilment, payment processing, and email distribution, among other operations.</li>
<li>When legally required, such as in response to court orders or legal process; to establish, protect, or exercise our legal rights; to defend against legal claims; or as otherwise required by law.</li>
</ul>
<h2>Cookies</h2>
<p>Our website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content and ads. You can manage your cookie settings through your browser but note that disabling cookies may affect the functionality of our site.</p>
<h2>Advertising and Online Tracking</h2>
<p>We participate in online advertising, which uses cookies, web beacons, and other technologies to deliver advertisements aligned with your interests. These technologies also help us manage and improve our offerings, tracking your interactions with our ads.</p>
<h2>Opting Out Of Marketing And Transfers; Updating Information About You</h2>
<p>You may opt out of receiving promotional communications from us by following the unsubscribe instructions in those messages. You can also contact us directly to update or correct your personal information.</p>
<h2>Do Not Sell My Personal Information</h2>
<p>We do not sell personal information to third parties for their direct marketing purposes without your explicit consent.</p>
<h2>Security</h2>
<p>We implement various security measures to maintain the safety of your personal information when you place an order or access your personal information. Despite our efforts, no security measures are perfect or impenetrable.</p>
<h2>Protecting Children</h2>
<p>Our website is not intended for children under the age of 16. We do not knowingly collect personal information online from visitors in this age group.</p>
<h2>Links to Third Party Web Sites</h2>
<p>Our website may contain links to third-party websites. These links are provided for your convenience only. We are not responsible for the privacy practices or the content of these other websites.</p>
<h2>Policy Changes</h2>
<p>We may update this privacy policy from time to time in response to changing legal, technical, or business developments. When we update our Privacy Policy, we will take appropriate measures to inform you, consistent with the significance of the changes we make.</p>
<h2>Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us at:</p>
<p><strong>Contact page</strong>: <a href="/contact-majeurs-holdings/">Link</a></p>
<p><strong>Email</strong>: <a href="mailto:customerservice@majeursholdings.com">customerservice@majeursholdings.com</a></p>
<p><strong>Mailing Address</strong>:</p>
<ul>
<li><strong>Nigeria</strong>: 32, QMB Builders Mart Road, Opposite Elf Bus Stop, Lekki Phase 1, Lagos State, Nigeria. 105102.</li>
<li><strong>United Kingdom</strong>: 71-75 Shelton Street Covent Garden London WC2H 9</li>
<li><strong>USA</strong>: 8 The Green, Dover, DE 19901, U</li>
</ul>
<p>Thank you for choosing Majeurs Holdings. We are committed to protecting your privacy and creating a valuable resource in our website for every visitor.</p>`,
		),
	},
});
