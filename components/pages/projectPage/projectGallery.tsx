"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ProjectImage } from "@/lib/api/projects";

/** Two-column project gallery; a photo opens the full-screen viewer (arrows, Esc, click outside to close) */
export function ProjectGallery({ images, title }: { images: ProjectImage[]; title: string }) {
	const dialog = useRef<HTMLDialogElement>(null);
	const [index, setIndex] = useState(0);
	const show = (i: number) => setIndex((i + images.length) % images.length);
	const open = (i: number) => {
		setIndex(i);
		dialog.current?.showModal();
	};
	const current = images[index];

	return (
		<>
			<ul className="grid gap-3 sm:grid-cols-2 md:gap-4">
				{images.map((image, i) => (
					<li key={image.src}>
						<button
							type="button"
							aria-label={`View photo ${i + 1} of ${images.length}`}
							onClick={() => open(i)}
							className="group relative block aspect-[3/2] w-full overflow-hidden bg-sand-50"
						>
							<Image
								src={image.src}
								alt={image.alt}
								fill
								sizes="(min-width: 1025px) 480px, (min-width: 640px) 50vw, 100vw"
								className="object-cover transition-[scale] duration-700 ease-in-out group-hover:scale-[1.03]"
							/>
						</button>
					</li>
				))}
			</ul>

			<dialog
				ref={dialog}
				aria-label={`${title} photos`}
				onKeyDown={(e) => {
					if (e.key === "ArrowRight") show(index + 1);
					if (e.key === "ArrowLeft") show(index - 1);
				}}
				onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
				className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 backdrop:bg-black/80"
			>
				{current ? (
					<div className="relative flex h-full items-center justify-center p-4 md:p-16">
						<AnimatePresence mode="wait" initial={false}>
							<motion.div
								key={current.src}
								className="relative h-full w-full"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.25 }}
							>
								<Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
							</motion.div>
						</AnimatePresence>
						<button
							type="button"
							aria-label="Close"
							onClick={() => dialog.current?.close()}
							className="absolute right-4 top-4 flex size-10 items-center justify-center text-white hover:text-gold"
						>
							<X className="size-6" />
						</button>
						{images.length > 1 ? (
							<>
								<button
									type="button"
									aria-label="Previous photo"
									onClick={() => show(index - 1)}
									className="absolute left-2 flex size-10 items-center justify-center text-white hover:text-gold md:left-6"
								>
									<ChevronLeft className="size-8" />
								</button>
								<button
									type="button"
									aria-label="Next photo"
									onClick={() => show(index + 1)}
									className="absolute right-2 flex size-10 items-center justify-center text-white hover:text-gold md:right-6"
								>
									<ChevronRight className="size-8" />
								</button>
								<p className="absolute bottom-4 text-xs tracking-button text-sand">
									{index + 1} / {images.length}
								</p>
							</>
						) : null}
					</div>
				) : null}
			</dialog>
		</>
	);
}

export default ProjectGallery;
