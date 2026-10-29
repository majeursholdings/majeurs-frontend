import SectionWrapper from '@/components/common/sectionWrapper'
import { PrimaryLink } from '@/components/common/btn'

export default function TradeProgramSection() {
  return (
    <SectionWrapper className="bg-bronze text-sand">
      <div className="max-w-2xl space-y-4">
        <h2 className="font-bold text-[28px] leading-[1.5em] text-sand">Our Trade Program</h2>
        <p className="text-sm">
          Architects, interior designers, property developers, hoteliers, and procurement teams working on projects of real scale, this is built for you.
        </p>
        <p className="text-sm">
          The Majeurs Trade Programme gives qualified professionals a direct relationship with the manufacturer behind the furniture: custom dimensions, material and finish flexibility, coordinated production, and a dedicated point of contact, structured around your project rather than a catalogue page.
        </p>
        <PrimaryLink slug="/majeurs-trade-program/" label="Learn More" />
      </div>
    </SectionWrapper>
  )
}
