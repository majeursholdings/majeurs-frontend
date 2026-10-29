"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Piece = { name: string; image: string };

/** One-at-a-time cross-fading slider for the Root and Reverence pieces. */
export default function CollectionSlider({ pieces, href }: { pieces: Piece[]; href: string }) {
	const [index, setIndex] = useState(0);
	const go = (step: number) => setIndex((i) => (i + step + pieces.length) % pieces.length);

	return (
		<div className="flex flex-col bg-white p-5 lg:p-10" aria-roledescription="carousel" aria-label="Root and Reverence pieces">
			<div className="relative aspect-square overflow-hidden bg-sand-50 lg:aspect-auto lg:flex-1">
				{pieces.map((piece, i) => (
					<Image
						key={piece.image}
						src={piece.image}
						alt={piece.name}
						fill
						sizes="(min-width: 1025px) 50vw, 100vw"
						aria-hidden={i !== index}
						className={cn("object-cover transition-opacity duration-700 ease-in-out", i === index ? "opacity-100" : "opacity-0")}
					/>
				))}

				<button
					type="button"
					onClick={() => go(-1)}
					aria-label="Previous piece"
					className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center bg-white/80 text-ink transition-colors duration-500 ease-in-out hover:bg-black hover:text-white"
				>
					<ChevronLeft className="size-5" />
				</button>
				<button
					type="button"
					onClick={() => go(1)}
					aria-label="Next piece"
					className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center bg-white/80 text-ink transition-colors duration-500 ease-in-out hover:bg-black hover:text-white"
				>
					<ChevronRight className="size-5" />
				</button>
			</div>

			<p className="mt-5 text-base text-ink" aria-live="polite">
				{pieces[index].name}
			</p>
			<Link
				href={href}
				className="group/wait mt-3 inline-flex w-fit items-center gap-2 text-xs uppercase text-bronze transition-colors duration-500 ease-in-out hover:text-gold"
			>
				Join Waitlist
				<MoveRight className="size-4 transition-transform duration-500 ease-in-out group-hover/wait:translate-x-1" />
			</Link>
		</div>
	);
}
