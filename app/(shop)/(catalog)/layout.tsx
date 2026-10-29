import { CustomizeCta } from "@/components/marketing/customizeCta";
import { InnerCircleSignup } from "@/components/marketing/innerCircleSignup";

/**
 * Archive pages (/shop/, /product-category/…, /product-tag/…, /search/), as on WP:
 *   page:   <PageHero title="Shop" /> + <CatalogShell> (filter sidebar + results panel)
 *   layout: "Customize your furniture style" band + "Join the Inner Circle" signup below every archive
 */
export default function CatalogLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			{children}
			<CustomizeCta />
			<InnerCircleSignup />
		</>
	);
}
