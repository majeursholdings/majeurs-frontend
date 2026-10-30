import SectionWrapper from "@/components/common/sectionWrapper";
import { Hammer, Ruler, UserRound, Gem, type LucideIcon } from "lucide-react";
import { getPageContent } from "@/lib/content/get";
import { home } from "@/lib/content/pages/home";

/** Icons for the points, by position */
const icons: LucideIcon[] = [Hammer, Ruler, UserRound, Gem];

export default async function ProductioIncludeSection() {
  const c = await getPageContent(home);
  return (
    <SectionWrapper>
      <div className="space-y-10 md:space-y-15">
        <h2 className="text-center font-bold text-[28px] leading-[1.5em]">{c.promisesTitle}</h2>

        <ul className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {c.promises.map(({ title, text }, i) => {
            const Icon = icons[i] ?? Gem;
            return (
              <li key={title} className="flex flex-col items-center text-center">
                <Icon className="size-8 text-gold" strokeWidth={1.25} aria-hidden />
                <h3 className="mt-5 text-sm font-bold uppercase tracking-button text-black">{title}</h3>
                <p className="mt-3 max-w-xs text-sm text-ink">{text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </SectionWrapper>
  )
}
