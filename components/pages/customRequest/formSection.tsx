import { SectionIntro } from "@/components/landing/splitFeature";
import { cn } from "@/lib/utils";

type FormSectionProps = {
	/** Anchor the page's buttons jump to, e.g. "request" */
	id: string;
	title: string;
	intro?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
};

/** Centred heading + intro above a full-width enquiry form (WP form block). Used by the custom request, quote, visitation and repair pages. */
export function FormSection({ id, title, intro, children, className }: FormSectionProps) {
	return (
		<section id={id} className={cn("scroll-mt-28 px-2.5 py-12.5 md:px-5 md:py-20", className)}>
			<div className="container-site max-w-[1100px] space-y-10">
				<SectionIntro title={title}>{intro}</SectionIntro>
				{children}
			</div>
		</section>
	);
}

export default FormSection;
