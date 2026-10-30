import { Suspense } from "react";
import { PageHero } from "@/components/common/pageHero";
import { getPageContent } from "@/lib/content/get";
import { complaint } from "@/lib/content/pages/complaint";
import { ComplaintForm } from "./complaintForm";

/**
 * /customer-complaint-and-feedback-form/: hero, then the six-step complaint and feedback form.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/complaint.ts)
 */
export default async function ComplaintPage() {
	const c = await getPageContent(complaint);
	return (
		<>
			<PageHero title={c.heroTitle} image={c.heroImage} overlayClassName="bg-black/70" />
			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="mx-auto max-w-2xl">
					{/* MainForm's date field reads the current date while rendering, so the form renders per visit */}
					<Suspense fallback={<div className="h-[560px] animate-pulse bg-sand-50" aria-label="Loading the form" />}>
						<ComplaintForm />
					</Suspense>
				</div>
			</section>
		</>
	);
}
