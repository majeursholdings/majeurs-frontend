import { SITE_URL, whatsappLink } from "@/lib/contact";
import { getContact } from "@/lib/content/get";
import { footerColumns, mainNav, topBarLinks, type NavLink } from "@/lib/navigation";

/**
 * /llms.txt (llmstxt.org): a Markdown summary of the site for AI agents and LLMs, with the pages worth reading.
 * Built from the site's own navigation and wp-admin > Site content > Contact details, so it follows them.
 */
export async function GET() {
	const contact = await getContact();
	const url = (href: string) => (href.startsWith("http") ? href : `${SITE_URL}${href}`);
	const list = (links: NavLink[]) => links.map((l) => `- [${l.label}](${url(l.href)})`).join("\n");
	const column = (title: string) => footerColumns.find((c) => c.title === title)?.links ?? [];

	const body = `# Majeurs

> Majeurs is a Lagos furniture design and manufacturing house. It designs and hand-builds sofas, armchairs, beds, tables, office and children's furniture in its Lagos workshop, made to order (6 to 10 weeks per piece), for homes, hotels, offices and developers. Prices are in Naira, and shoppers can switch to US dollars, pounds or euros; delivery across Nigeria and internationally, or pickup from the Lekki showroom.

Every product page lists its materials, colours, dimensions and price. Pieces can be customised (size, fabric, leather, finish) through a custom request or a quote.

## Shop

- [All furniture](${url("/shop/")})
${list(column("Shop"))}
- [New arrivals and collections](${url("/root-and-reverence-collection/")})

## Custom work and trade

${list([...mainNav, ...topBarLinks.filter((l) => l.href !== "/about-majeurs-holdings/")])}
- [Get a quote](${url("/get-a-quote-for-custom-made-furniture-in-lagos/")})
- [Plan a showroom visit](${url("/plan-a-visitation/")})

## Company

${list([...column("Company"), ...column("Discover").filter((l) => !l.external)])}

## Policies

${list(column("Policies"))}

## Contact

- Phone and WhatsApp: ${contact.phone.label} ([chat on WhatsApp](${whatsappLink(contact.whatsapp)}))
- Email: ${contact.email}
- Showroom and workshop: 32 QMB Builders Mart Road, Lekki Phase 1, Lagos, Nigeria

## Optional

- [Sitemap](${url("/sitemap_index.xml")})
- [Blog](${url("/blog/")})
`;

	return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
