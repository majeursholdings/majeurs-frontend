import { PageHero } from "@/components/common/pageHero";
import { ShopNowBand } from "@/components/landing/shopNowBand";
import { CatalogueGrid } from "./catalogueGrid";
import { catalogues } from "./catalogues";

export default function CataloguePage() {
	return (
		<>
			<PageHero className="min-h-80 md:min-h-[420px]" title="Discover Our Latest Catalogues">
				<p className="text-sm text-sand">Click below to download</p>
			</PageHero>
			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site">
					<CatalogueGrid catalogues={catalogues} />
				</div>
			</section>
			<ShopNowBand />
		</>
	);
}
