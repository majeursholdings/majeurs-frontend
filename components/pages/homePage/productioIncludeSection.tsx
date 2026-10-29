import SectionWrapper from "@/components/common/sectionWrapper";
import { Hammer, Ruler, UserRound, Gem, type LucideIcon } from "lucide-react";

const promises: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Hammer,
    title: "Made by Hand",
    body: "Every furniture piece moves through the same artisan hands from raw material to final finish. No outsourced production. No shortcuts in the joinery.",
  },
  {
    icon: Ruler,
    title: "Made to Commission",
    body: "The collection is a starting point. Every dimension, material, and finish can be adjusted to match the space and the brief.",
  },
  {
    icon: UserRound,
    title: "A Dedicated Point of Contact",
    body: "Every residential and trade client receives a single point of contact throughout the furniture production, from first enquiry to delivery.",
  },
  {
    icon: Gem,
    title: "Designed to Be Kept",
    body: "Majeurs furniture pieces are not designed to be replaced in 5 years. They are built from materials that improve with age.",
  },
];

export default function ProductioIncludeSection() {
  return (
    <SectionWrapper>
      <div className="space-y-10 md:space-y-15">
        <h2 className="text-center font-bold text-[28px] leading-[1.5em]">What Every Furniture Production Includes</h2>

        <ul className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {promises.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex flex-col items-center text-center">
              <Icon className="size-8 text-gold" strokeWidth={1.25} aria-hidden />
              <h3 className="mt-5 text-sm font-bold uppercase tracking-button text-black">{title}</h3>
              <p className="mt-3 max-w-xs text-sm text-ink">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </SectionWrapper>
  )
}
