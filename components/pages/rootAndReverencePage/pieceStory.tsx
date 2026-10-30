"use client";

import { useRef } from "react";
import Image from "next/image";
import { MoveRight, X } from "lucide-react";
import { WaitlistButton, type WaitlistCopy } from "./waitlist";

/** A piece from the page's fields (lib/content/pages/rootAndReverence.ts), resolved on the server */
export type Piece = {
	name: string;
	/** "Read more" story, from the live popup */
	headline: string;
	story: string[];
	quote: string;
	gallery: string[];
	details: { label: string; value: string }[];
};

/** The modal's buttons and labels, shared by every piece */
export type PieceStoryCopy = { readMore: string; waitlistButton: string; stock: string; waitlist: WaitlistCopy };

/** "Read more" on a piece: the designer's story, gallery and details in a modal (the live site's popup) */
export function PieceStory({ piece, copy }: { piece: Piece; copy: PieceStoryCopy }) {
	const dialog = useRef<HTMLDialogElement>(null);

	return (
		<>
			<button
				type="button"
				onClick={() => dialog.current?.showModal()}
				className="group/read inline-flex items-center gap-2 text-xs uppercase tracking-button text-bronze hover:text-gold"
			>
				{copy.readMore}
				<MoveRight className="size-4 transition-transform group-hover/read:translate-x-1" aria-hidden />
			</button>

			<dialog
				ref={dialog}
				aria-label={`${piece.name}: the story`}
				onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
				className="m-auto max-h-[90dvh] w-[calc(100%-1.25rem)] max-w-4xl overflow-y-auto bg-white p-0 backdrop:bg-black/70"
			>
				<div className="relative grid gap-8 p-6 md:grid-cols-[2fr_3fr] md:p-10">
					<button
						type="button"
						aria-label="Close"
						onClick={() => dialog.current?.close()}
						className="absolute right-3 top-3 flex size-9 items-center justify-center text-black hover:text-gold"
					>
						<X className="size-5" />
					</button>

					<div className="grid grid-cols-3 gap-2 self-start md:grid-cols-1">
						{piece.gallery.map((src, i) => (
							<div key={src} className="relative aspect-square overflow-hidden bg-sand-50">
								<Image src={src} alt={i === 0 ? piece.name : ""} fill sizes="(min-width: 768px) 320px, 33vw" className="object-cover" />
							</div>
						))}
					</div>

					<div className="space-y-5">
						<p className="eyebrow">{piece.name}</p>
						<h2 className="font-display text-h4">{piece.headline}</h2>
						<div className="space-y-3 text-sm text-charcoal">
							{piece.story.map((p) => (
								<p key={p.slice(0, 24)}>{p}</p>
							))}
						</div>
						<blockquote className="border-l-2 border-gold pl-4 text-sm italic text-black">&ldquo;{piece.quote}&rdquo;</blockquote>

						<dl className="divide-y divide-sand border-y border-sand text-sm">
							{piece.details.map((d) => (
								<div key={d.label} className="grid grid-cols-[8rem_1fr] gap-4 py-2.5">
									<dt className="text-black">{d.label}</dt>
									<dd className="text-charcoal">{d.value}</dd>
								</div>
							))}
						</dl>

						<div className="flex flex-wrap items-center gap-4">
							<WaitlistButton
								piece={piece.name}
								label={copy.waitlistButton}
								copy={copy.waitlist}
								className="border-black bg-black text-white hover:border-gold hover:bg-gold"
							/>
							<p className="text-xs uppercase tracking-button text-gold-muted">{copy.stock}</p>
						</div>
					</div>
				</div>
			</dialog>
		</>
	);
}
