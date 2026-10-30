import { PageHero } from "@/components/common/pageHero";
import { ShopNowBand } from "@/components/landing/shopNowBand";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { catalogue } from "@/lib/content/pages/catalogue";
import { CatalogueGrid } from "./catalogueGrid";

/** Copy, covers and PDF links from the page's fields in wp-admin (lib/content/pages/catalogue.ts) */
export default async function CataloguePage() {
	const c = await getPageContent(catalogue);
	return (
		<>
			<PageHero className="min-h-80 md:min-h-[420px]" title={c.heroTitle}>
				{paragraphs(c.heroText).map((p) => (
					<p key={p} className="text-sm text-sand">
						{p}
					</p>
				))}
			</PageHero>
			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site">
					<CatalogueGrid
						catalogues={c.catalogues}
						copy={{ download: c.downloadLabel, title: c.dialogTitle, text: c.dialogText, thanks: c.dialogThanks, pdf: c.dialogPdfLabel }}
					/>
				</div>
			</section>
			<ShopNowBand />
		</>
	);
}
