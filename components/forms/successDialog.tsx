"use client";

import { Dialog } from "@base-ui/react/dialog";
import { CircleCheck } from "lucide-react";
import { usePortalContainer } from "@/components/ui/portalContainer";

type SuccessDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	message: string;
	title?: string;
	/** Where focus goes on close; default: back to what had it before (the submit button) */
	finalFocus?: React.RefObject<HTMLElement | null>;
};

/**
 * "Thank you" pop-up after an enquiry form is sent (useEnquirySuccess). Centred, fades and scales in;
 * Escape, the backdrop and Close all dismiss it. Portals into the nearest PortalContainer (e.g. the waitlist's
 * modal <dialog>) so it isn't rendered inert behind the top layer.
 */
export function SuccessDialog({ open, onOpenChange, message, title = "Thank you", finalFocus }: SuccessDialogProps) {
	const container = usePortalContainer();

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal container={container}>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
				<Dialog.Popup
					finalFocus={finalFocus ?? true}
					className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-sand bg-white p-8 text-center shadow-lg transition duration-200 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none md:p-10"
				>
					<CircleCheck className="mx-auto size-12 text-gold" strokeWidth={1.25} aria-hidden />
					<Dialog.Title className="mt-5 text-h4 text-black">{title}</Dialog.Title>
					<Dialog.Description className="mt-3 whitespace-pre-line text-sm text-charcoal md:text-base">{message}</Dialog.Description>
					<Dialog.Close className="btn mt-8 w-full border-black bg-black text-white hover:border-gold hover:bg-gold">Close</Dialog.Close>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
