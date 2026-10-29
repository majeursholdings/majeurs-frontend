
import { PageHero } from "@/components/common/pageHero";
import NewFurnitureSection from "./newFurnitureSection";
import RnRCollectionSection from "./RnRCollectionSection";
import TradeProgramSection from "./tradeProgramSection";
import ShopByCategorySection from "./shopByCategorySection";
import ProductioIncludeSection from "./productioIncludeSection";
import ArticleSection from "./articleSection";


export default function HomePageComponents() {

    const cta = {
        slug: `/shop/`,
        label: `Shop Now`
    }

    return (
        <>
            <PageHero
                size="tall"
                title="Handcrafted African Furniture"
                description="Majeurs is a top African furniture design and manufacturer building at large scale. Each piece is made to commission, crafted by hand, and built to outlast every trend."
                image="https://majeurs.com/wp-content/uploads/Arranging_furniture_in_living_room_2K_202609082139-scaled.jpeg"
                priCta={cta}
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



