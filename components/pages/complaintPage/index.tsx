import { Suspense } from "react";
import { PageHero } from "@/components/common/pageHero";
import { ComplaintForm } from "./complaintForm";
import { WP_URL } from "@/lib/api/wp";

/** /customer-complaint-and-feedback-form/: hero, then the six-step complaint and feedback form */
export default function ComplaintPage() {
	return (
		<>
			<PageHero
				title="Majeurs Holdings Customer Complaint or Feedback Form"
				image={`${WP_URL}/wp-content/uploads/Customer-Complaint-and-Feedback-Form-page.png`}
				overlayClassName="bg-black/70"
			/>
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
