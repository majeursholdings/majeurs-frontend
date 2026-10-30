import Image from "next/image";
import { PrimaryLink } from "@/components/common/btn";
import CollectionSlider from "./collectionSlider";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { home } from "@/lib/content/pages/home";

export default async function RnRCollectionSection() {
    const c = await getPageContent(home);
    return (
        // full-bleed halves, with the text and slider lined up to the page container (site-gutter-start / site-gutter-end)
        <section className="@container grid grid-cols-1 bg-sand lg:grid-cols-2">
            <div className="relative isolate flex min-h-105 items-end overflow-hidden py-5 site-gutter-start pe-5 lg:min-h-160 lg:py-10 lg:pe-10">
                <Image
                    src={c.rnrImage}
                    alt=""
                    fill
                    sizes="(min-width: 1025px) 50vw, 100vw"
                    className="-z-20 object-cover"
                />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#00000000_40%,#000000B3_100%)]" aria-hidden />

                <div className="max-w-md space-y-2 text-sand">
                    <h2 className="font-bold text-[28px] leading-[1.3em] text-sand">{c.rnrTitle}</h2>
                    {paragraphs(c.rnrText).map((p) => (
                        <p key={p} className="text-sm">
                            {p}
                        </p>
                    ))}
                    <PrimaryLink slug={c.rnrCta.href} label={c.rnrCta.label} />
                </div>
            </div>

            <CollectionSlider pieces={c.rnrPieces} cta={c.rnrPieceCta} />
        </section>
    )
}
