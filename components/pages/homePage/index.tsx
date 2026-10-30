import { PageHero } from "@/components/common/pageHero";
import NewFurnitureSection from "./newFurnitureSection";
import RnRCollectionSection from "./RnRCollectionSection";
import TradeProgramSection from "./tradeProgramSection";
import ShopByCategorySection from "./shopByCategorySection";
import ProductioIncludeSection from "./productioIncludeSection";
import ArticleSection from "./articleSection";
import { getPageContent } from "@/lib/content/get";
import { home } from "@/lib/content/pages/home";

/** Copy and images from the page's fields in wp-admin (lib/content/pages/home.ts); each section reads its own */
export default async function HomePageComponents() {
    const c = await getPageContent(home);

    return (
        <>
            <PageHero
                size="tall"
                title={c.heroTitle}
                description={c.heroText}
                image={c.heroImage}
                priCta={c.heroCta.href ? { slug: c.heroCta.href, label: c.heroCta.label } : undefined}
                position="bottom"
                overlayClassName="bg-transparent bg-[linear-gradient(180deg,#53390B00_0%,#271B08_100%)]"
            />
            <NewFurnitureSection />
            <RnRCollectionSection />
            <TradeProgramSection />
            <ShopByCategorySection />
            <ProductioIncludeSection />
            <ArticleSection />
        </>
    )
}
