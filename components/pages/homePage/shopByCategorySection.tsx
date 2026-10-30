import Image from "next/image";
import Link from "next/link";
import SectionWrapper from "@/components/common/sectionWrapper";
import { PrimaryLink } from "@/components/common/btn";
import { getPageContent } from "@/lib/content/get";
import { home } from "@/lib/content/pages/home";

export default async function ShopByCategorySection() {
    const c = await getPageContent(home);
    return (
        <SectionWrapper>
            <div className="space-y-10">
                <h2 className="text-center font-bold text-[28px] leading-[1.5em]">{c.categoriesTitle}</h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {c.categories.map(({ cta, image }) => (
                        <Link key={cta.href} href={cta.href} className="group/cat relative block aspect-square overflow-hidden bg-sand-50">
                            <Image
                                src={image}
                                alt=""
                                fill
                                sizes="(min-width: 1025px) 25vw, (min-width: 768px) 50vw, 100vw"
                                className="object-cover transition-[scale] duration-700 ease-in-out group-hover/cat:scale-[1.03]"
                            />
                            <span className="absolute inset-x-0 bottom-0 bg-black py-2.5 text-center text-sm uppercase tracking-button text-white transition-colors duration-500 ease-in-out group-hover/cat:bg-gold">
                                {cta.label}
                            </span>
                        </Link>
                    ))}

                    <div className="flex aspect-square flex-col items-center justify-center text-center">
                        <Link href={c.categoriesAllLink.href} className="text-sm text-ink transition-colors duration-500 ease-in-out hover:text-gold">
                            {c.categoriesAllLink.label}
                        </Link>
                        <PrimaryLink
                            slug={c.categoriesCta.href}
                            label={c.categoriesCta.label}
                            colorClassName="border-ink text-ink"
                            hoverClassName="hover:bg-ink hover:text-sand"
                        />
                    </div>
                </div>
            </div>
        </SectionWrapper>
    )
}
