import Image from "next/image";
import Link from "next/link";
import SectionWrapper from "@/components/common/sectionWrapper";
import { PrimaryLink } from "@/components/common/btn";
import { WP_URL } from "@/lib/api/wp";

const UPLOADS = `${WP_URL}/wp-content/uploads`;

const categories = [
    { label: "Armchairs", href: "/product-category/armchairs/", image: `${UPLOADS}/elementor/thumbs/Irorun_Armchair_5-rm1pt5jb91c93oqiiirdfpi7u9nwc2x4emoo080i6m.webp` },
    { label: "Beds", href: "/product-category/beds/", image: `${UPLOADS}/elementor/thumbs/Gida-–-The-Modern-Panel-Bed-6-rlr08tnfbq7qckouw66yxv0gou1llhyz1dhbdqin7y.webp` },
    { label: "Nursery", href: "/product-category/children/", image: `${UPLOADS}/elementor/thumbs/Uwa-The-Children-Collection-rl4d5tekgfuma11mfzuozyt9zrznbf9nqz3n8ropvy.webp` },
    { label: "Accent Pieces", href: "/product-category/stool/", image: `${UPLOADS}/elementor/thumbs/4-rtufvndsa5flvm2m12fhfdmcz6luip4ngzrmoqpc7i.jpg` },
    { label: "Office", href: "/product-category/office/", image: `${UPLOADS}/elementor/thumbs/2-9-rl4cv1781v3732pieu1rw6rwnn520fgillo41hob9q.webp` },
    { label: "Sofas", href: "/product-category/sofas/", image: `${UPLOADS}/elementor/thumbs/Eniola_4-seaters_sofa_Majeurs_Furnitures_05-rjcbj2z59pd4wx5b43v89x1kb3wgmt60xl1j46o1la.webp` },
    { label: "Tables", href: "/product-category/tables/", image: `${UPLOADS}/dinner-table-5_Majeurs_Furnitures_02-1.webp` },
];

export default function ShopByCategorySection() {
    return (
        <SectionWrapper>
            <div className="space-y-10">
                <h2 className="text-center font-bold text-[28px] leading-[1.5em]">Shop by Category</h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {categories.map((category) => (
                        <Link key={category.href} href={category.href} className="group/cat relative block aspect-square overflow-hidden bg-sand-50">
                            <Image
                                src={category.image}
                                alt=""
                                fill
                                sizes="(min-width: 1025px) 25vw, (min-width: 768px) 50vw, 100vw"
                                className="object-cover transition-[scale] duration-700 ease-in-out group-hover/cat:scale-[1.03]"
                            />
                            <span className="absolute inset-x-0 bottom-0 bg-black py-2.5 text-center text-sm uppercase tracking-button text-white transition-colors duration-500 ease-in-out group-hover/cat:bg-gold">
                                {category.label}
                            </span>
                        </Link>
                    ))}

                    <div className="flex aspect-square flex-col items-center justify-center text-center">
                        <Link href="/shop/" className="text-sm text-ink transition-colors duration-500 ease-in-out hover:text-gold">
                            View all products
                        </Link>
                        <PrimaryLink
                            slug="/catalogue/"
                            label="Get our Catalog"
                            colorClassName="border-ink text-ink"
                            hoverClassName="hover:bg-ink hover:text-sand"
                        />
                    </div>
                </div>
            </div>
        </SectionWrapper>
    )
}
