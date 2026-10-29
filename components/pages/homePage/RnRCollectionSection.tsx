import Image from "next/image";
import { PrimaryLink } from "@/components/common/btn";
import CollectionSlider from "./collectionSlider";

const UPLOADS = "https://majeurs.com/wp-content/uploads";

// Root and Reverence pieces are waitlist-only (not in the Store API), so they link to the collection page
const pieces = [
    { name: "Dandan – The Accent Chair of Certainty", image: `${UPLOADS}/1-3-1.webp` },
    { name: "Erelu – The Tempered Glass-Top Dining Table", image: `${UPLOADS}/1-2-1.webp` },
    { name: "Abobaku – High-back lounge Armchair", image: `${UPLOADS}/2-2-1.webp` },
];

export default function RnRCollectionSection() {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative isolate flex min-h-105 items-end overflow-hidden p-5 lg:min-h-160 lg:p-10">
                <Image
                    src={`${UPLOADS}/Placing_chair_and_table_2K_202609042308-scaled.webp`}
                    alt=""
                    fill
                    sizes="(min-width: 1025px) 50vw, 100vw"
                    className="-z-20 object-cover"
                />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#00000000_40%,#000000B3_100%)]" aria-hidden />

                <div className="max-w-md space-y-2 text-sand">
                    <h2 className="font-bold text-[28px] leading-[1.3em] text-sand">The Root and Reverence Collection</h2>
                    <p className="text-sm">
                        A three-piece limited-edition furniture collection. Each collection tells a unique story deeply rooted in African heritage.
                    </p>
                    <PrimaryLink slug="/root-and-reverence-collection/" label="Shop All" />
                </div>
            </div>

            <CollectionSlider pieces={pieces} href="/root-and-reverence-collection/" />
        </section>
    )
}
