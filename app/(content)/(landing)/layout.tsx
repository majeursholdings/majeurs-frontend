/**
 * Marketing / landing pages (home, about, trade program, designers, Mande, Academy & Careers intros,
 * contact, FAQs, projects …). WP builds these from full-width Elementor sections, usually:
 *   <PageHero /> then stacked <SectionWrapper> blocks (white / sand / black / brown bands).
 * The layout stays full-bleed so each section controls its own background.
 */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col">{children}</div>;
}
