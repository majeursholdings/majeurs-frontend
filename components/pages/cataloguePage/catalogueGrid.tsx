"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, X } from "lucide-react";
import { toast } from "sonner";
import MainForm from "@/components/customForm";
import { toFormData } from "@/components/customForm/formData";
import { LegalNote } from "@/components/landing/legalNote";
import { trackEvent } from "@/lib/analytics";
import { enquiries, professionalRoles, type EnquiryValues } from "@/lib/forms/enquiries";
import { submitEnquiryAction } from "@/lib/forms/submit";
import type { Catalogue } from "./catalogues";
import { PortalContainer } from "@/components/ui/portalContainer";

type Values = EnquiryValues<"catalogue-request">;

/** Set once the visitor has filled the form, so later downloads skip it (this browser only) */
const ACCESS_KEY = "mj_catalogue_access";

const hasAccess = () => {
	try {
		return localStorage.getItem(ACCESS_KEY) === "1";
	} catch {
		return false;
	}
};

/**
 * WP catalogue grid: each "Download" opens the "Download Our Catalogue" form (ex-Elementor popup);
 * once sent, the PDF link appears. The request is kept in wp-admin > Enquiries like the other forms.
 */
export function CatalogueGrid({ catalogues }: { catalogues: Catalogue[] }) {
	const dialog = useRef<HTMLDialogElement>(null);
	const [picked, setPicked] = useState<Catalogue | null>(null);
	const [unlocked, setUnlocked] = useState(false);
	const methods = useForm<Values>({
		mode: "onTouched",
		resolver: zodResolver(enquiries["catalogue-request"].schema) as unknown as Resolver<Values>,
		defaultValues: { first_name: "", last_name: "", email: "", phone: "", catalogue: "" },
	});

	const open = (catalogue: Catalogue) => {
		if (hasAccess()) {
			window.open(catalogue.pdf, "_blank", "noopener");
			return;
		}
		setPicked(catalogue);
		setUnlocked(false);
		methods.setValue("catalogue", `${catalogue.label}: ${catalogue.title}`);
		dialog.current?.showModal();
	};

	const onSubmit = async (values: Values) => {
		const result = await submitEnquiryAction("catalogue-request", toFormData(values));
		if (!result.ok) {
			toast.error(result.message);
			return;
		}
		trackEvent({ event: "form_submit", form_name: "catalogue_request" });
		try {
			localStorage.setItem(ACCESS_KEY, "1");
		} catch {}
		setUnlocked(true);
	};

	return (
		<>
			<ul className="grid gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
				{catalogues.map((c) => (
					<li key={c.pdf} className="flex flex-col gap-2">
						<div className="relative aspect-[4/3] overflow-hidden bg-sand-50">
							<Image src={c.image} alt={`${c.label} catalogue cover`} fill sizes="(min-width: 1025px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
						</div>
						<p className="pt-2 text-xs uppercase tracking-button text-black">{c.label}</p>
						<h2 className="flex-1 text-base capitalize text-ink">{c.title}</h2>
						<button type="button" onClick={() => open(c)} className="btn mt-2 w-full border-black text-black hover:bg-black hover:text-white">
							Download
						</button>
					</li>
				))}
			</ul>

			<dialog
				ref={dialog}
				aria-labelledby="catalogue-dialog-title"
				onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
				className="m-auto w-[calc(100%-1.25rem)] max-w-lg bg-white p-0 backdrop:bg-black/60"
			>
				<PortalContainer value={dialog}>
					<div className="relative space-y-6 p-6 md:p-10">
						<button type="button" aria-label="Close" onClick={() => dialog.current?.close()} className="absolute right-3 top-3 flex size-9 items-center justify-center hover:text-gold">
							<X className="size-5" />
						</button>
						<div className="space-y-2 pr-8">
							<p className="eyebrow">{picked?.label}</p>
							<h2 id="catalogue-dialog-title" className="text-h4">
								Download our catalogue
							</h2>
							<p className="text-sm text-charcoal">{unlocked ? "Thank you. Your catalogue is ready." : "Fill the form below to get access to our catalogue."}</p>
						</div>

						{unlocked && picked ? (
							<a href={picked.pdf} target="_blank" rel="noopener noreferrer" className="btn w-full border-black bg-black text-white hover:border-gold hover:bg-gold">
								<Download className="size-4" />
								Download PDF
							</a>
						) : (
							<>
								<MainForm<Values>
									methods={methods}
									trackingName="catalogue_request"
									requireValidToSubmit={false}
									isLoading={methods.formState.isSubmitting}
									submitLabel="Download now"
									onSubmit={onSubmit}
									rowPairs={[["first_name", "last_name"]]}
									fields={[
										{ name: "first_name", type: "text", label: "First name", placeholder: "John", autoComplete: "given-name" },
										{ name: "last_name", type: "text", label: "Last name", placeholder: "Doe", autoComplete: "family-name" },
										{
											name: "role",
											type: "select",
											label: "Professional role",
											placeholder: "Choose your role",
											options: professionalRoles.map((r) => ({ label: r, value: r })),
										},
										{ name: "email", type: "email", label: "Email", placeholder: "name@email.com", autoComplete: "email" },
										{ name: "phone", type: "tel", label: "Phone number", placeholder: "2348012345678", autoComplete: "tel" },
									]}
									footerSlot={
										// honeypot: off-screen, skipped by keyboard and autofill
										<input {...methods.register("website")} type="text" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" />
									}
								/>
								<LegalNote purpose="your catalogue request" />
							</>
						)}
					</div>
				</PortalContainer>
			</dialog>
		</>
	);
}
