import { Suspense } from "react";
import { PrimaryLink } from "@/components/common/btn";
import SectionWrapper from "@/components/common/sectionWrapper";
import ProductCard from "@/components/common/productCard";
import { getProducts, toCard } from "@/lib/api/store";
import { getFx } from "@/lib/api/currency";

const grid = "grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-10";

export default function NewFurnitureSection() {
    return (
        <SectionWrapper>
            <div className="space-y-10">
                <div className="flex items-center justify-between gap-2.5 md:gap-5 flex-wrap">
                    <h2 className="font-bold text-[28px] leading-[1.5em]">
                        All New From Our Furniture Showroom
                    </h2>
                    <PrimaryLink
                        slug="/shop/"
                        label="Shop All"
                        colorClassName="bg-ink text-sand"
                        hoverClassName="hover:bg-white hover:text-ink"
                    />
                </div>

                {/* prices depend on the currency cookie, so the grid streams in */}
                <Suspense fallback={<GridSkeleton />}>
                    <NewProducts />
                </Suspense>
            </div>
        </SectionWrapper>
    )
}

async function NewProducts() {
    const [{ products }, fx] = await Promise.all([getProducts({ sort: "date", perPage: 8 }), getFx()]);
    return (
        <div className={grid}>
            {products.map((product) => (
                <ProductCard key={product.id} {...toCard(product, fx)} />
            ))}
        </div>
    )
}

function GridSkeleton() {
    return (
        <div className={grid} aria-hidden>
            {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="space-y-4 border-b-2 border-sand pb-7">
                    <div className="aspect-square animate-pulse bg-sand-50" />
                    <div className="h-3 w-1/4 animate-pulse bg-sand-50" />
                    <div className="h-4 w-3/4 animate-pulse bg-sand-50" />
                </div>
            ))}
        </div>
    )
}
