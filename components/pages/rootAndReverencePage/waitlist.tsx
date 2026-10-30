"use client";

import { useRef } from "react";
import { MoveRight, X } from "lucide-react";
import { EnquiryForm } from "@/components/forms/enquiryForm";
import { waitlistPieces } from "@/lib/forms/enquiries";
import { cn } from "@/lib/utils";
import { PortalContainer } from "@/components/ui/portalContainer";

/** The form's heading, from the page's fields (lib/content/pages/rootAndReverence.ts) */
export type WaitlistCopy = { eyebrow: string; title: string; paragraphs: string[] };

type WaitlistButtonProps = {
	/** Pre-selects the piece when opened from its story */
	piece?: string;
	/** "button": solid btn; "link": text link with an arrow */
	variant?: "button" | "link";
	label: string;
	copy: WaitlistCopy;
	className?: string;
};

/** "Join Waitlist": opens the waitlist form (the live site's Elementor popup) in a modal */
export function WaitlistButton({ piece, variant = "button", label, copy, className }: WaitlistButtonProps) {
	const dialog = useRef<HTMLDialogElement>(null);

	return (
		<>
			<button
				type="button"
				onClick={() => dialog.current?.showModal()}
				className={cn(variant === "button" ? "btn" : "group inline-flex items-center gap-2 text-sm", className)}
			>
				{label}
				{variant === "link" ? <MoveRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /> : null}
			</button>

			<dialog
				ref={dialog}
				aria-label="Join the Roots and Reverence waitlist"
				onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
				className="m-auto max-h-[90dvh] w-[calc(100%-1.25rem)] max-w-xl overflow-y-auto bg-white p-0 text-left backdrop:bg-black/70"
			>
				<PortalContainer value={dialog}>
					<div className="relative space-y-6 p-6 md:p-10">
						<button
							type="button"
							aria-label="Close"
							onClick={() => dialog.current?.close()}
							className="absolute right-3 top-3 flex size-9 items-center justify-center text-black hover:text-gold"
						>
							<X className="size-5" />
						</button>
						<div className="space-y-2">
							<p className="eyebrow">{copy.eyebrow}</p>
							<h2 className="font-display text-h4 text-black">{copy.title}</h2>
							{copy.paragraphs.map((p) => (
								<p key={p} className="text-sm text-charcoal">
									{p}
								</p>
							))}
						</div>
						<EnquiryForm
							form="waitlist"
							legalPurpose="your waitlist place"
							submitLabel="Join waitlist"
							defaultValues={piece && (waitlistPieces as readonly string[]).includes(piece) ? { piece } : undefined}
							rowPairs={[
								["first_name", "last_name"],
								["email", "phone"],
							]}
							fields={[
								{ name: "first_name", type: "text", label: "First name", placeholder: "John", autoComplete: "given-name", validation: { required: true } },
								{ name: "last_name", type: "text", label: "Last name", placeholder: "Doe", autoComplete: "family-name", validation: { required: true } },
								{ name: "email", type: "email", label: "Email", placeholder: "name@email.com", autoComplete: "email", validation: { required: true } },
								{ name: "phone", type: "tel", label: "Phone number", placeholder: "2349012345678", autoComplete: "tel", validation: { required: true } },
								{
									name: "piece",
									type: "select",
									label: "Preferred piece",
									placeholder: "Choose a piece",
									options: waitlistPieces.map((p) => ({ label: p, value: p })),
									validation: { required: true },
								},
							]}
						/>
					</div>
				</PortalContainer>
			</dialog>
		</>
	);
}
