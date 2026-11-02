"use client";

import { useRef } from "react";
import { MoveRight, X } from "lucide-react";
import { PortalContainer } from "@/components/ui/portalContainer";
import { cn } from "@/lib/utils";
import { QuoteForm } from "./quoteForm";

type QuoteButtonProps = {
	label: string;
	/** Pop-up heading and intro, from the page's fields */
	title: string;
	text?: string;
	className?: string;
};

/** Button that opens the "Get a quote" form in a modal, for pages that sell custom work without a form of their own */
export function QuoteButton({ label, title, text, className }: QuoteButtonProps) {
	const dialog = useRef<HTMLDialogElement>(null);

	return (
		<>
			<button type="button" onClick={() => dialog.current?.showModal()} className={cn("btn group", className)}>
				{label}
				<MoveRight className="size-5 transition-[translate] duration-150 ease-out group-hover:translate-x-1" aria-hidden />
			</button>

			<dialog
				ref={dialog}
				aria-label={title}
				onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
				className="m-auto max-h-[90dvh] w-[calc(100%-1.25rem)] max-w-3xl overflow-y-auto overscroll-contain bg-white p-0 text-left backdrop:bg-black/70"
			>
				<PortalContainer value={dialog}>
					<div className="relative space-y-8 p-6 md:p-10">
						<button
							type="button"
							aria-label="Close"
							onClick={() => dialog.current?.close()}
							className="absolute right-3 top-3 flex size-10 items-center justify-center text-black transition-colors duration-150 hover:text-gold"
						>
							<X className="size-5" />
						</button>
						<div className="space-y-2 pe-10">
							<h2 className="font-display text-h4 text-black">{title}</h2>
							{text ? <p className="text-sm text-charcoal">{text}</p> : null}
						</div>
						<QuoteForm />
					</div>
				</PortalContainer>
			</dialog>
		</>
	);
}

export default QuoteButton;
