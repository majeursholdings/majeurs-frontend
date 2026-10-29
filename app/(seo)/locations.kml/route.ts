/** Rank Math Local SEO KML (linked from local-sitemap.xml). Copied from the live site. */
const KML = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
	<Document>
		<name>Locations for Majeurs Holdings</name>
		<open>1</open>
		<Folder>
			<atom:link href="https://majeurs.com" />
			<Placemark>
				<name><![CDATA[Majeurs Holdings]]></name>
				<description><![CDATA[Majeurs Holdings - We Build For Scale]]></description>
				<address><![CDATA[32, QMB Builders Mart Road, Opposite Elf Bus Stop., NG:LA, 105102, Nigeria, Lekki Phase 1]]></address>
				<phoneNumber><![CDATA[+2342013306192]]></phoneNumber>
				<atom:link href="https://majeurs.com"/>
			</Placemark>
		</Folder>
	</Document>
</kml>
`;

export function GET() {
	return new Response(KML, { headers: { "Content-Type": "text/xml; charset=UTF-8" } });
}
