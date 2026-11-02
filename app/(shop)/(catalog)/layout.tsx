import { CustomizeCta } from "@/components/marketing/customizeCta";

/**
 * Archive pages (/shop/, /product-category/…, /product-tag/…, /search/), as on WP:
 *   page:   <PageHero title="Shop" /> + <CatalogShell> (filter sidebar + results panel)
 *   layout: full-width "Customize your furniture style" band below every archive
 */
export default function CatalogLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			{children}
			<CustomizeCta fullBleed />
		</>
	);
}
