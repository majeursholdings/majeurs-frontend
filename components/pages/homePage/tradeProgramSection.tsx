import SectionWrapper from '@/components/common/sectionWrapper'
import { PrimaryLink } from '@/components/common/btn'
import { getPageContent } from '@/lib/content/get'
import { paragraphs } from '@/lib/content/model'
import { home } from '@/lib/content/pages/home'

export default async function TradeProgramSection() {
  const c = await getPageContent(home)
  return (
    <SectionWrapper className="bg-bronze text-sand">
      <div className="max-w-2xl space-y-4">
        <h2 className="font-bold text-[28px] leading-[1.5em] text-sand">{c.tradeTitle}</h2>
        {paragraphs(c.tradeText).map((p) => (
          <p key={p} className="text-sm">
            {p}
          </p>
        ))}
        <PrimaryLink slug={c.tradeCta.href} label={c.tradeCta.label} />
      </div>
    </SectionWrapper>
  )
}
