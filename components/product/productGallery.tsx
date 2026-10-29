"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useProduct } from "./productProvider";
import { cn } from "@/lib/utils";

/**
 * WP product gallery (rtwpvg): square main image with a zoom button, a row of thumbnails underneath,
 * and a full-screen viewer. Choosing a variation switches to that variation's image.
 */
export function ProductGallery() {
	const { product, variation } = useProduct();
	const dialog = useRef<HTMLDialogElement>(null);

	// a variation image that isn't already in the gallery goes first
	const variationImage = variation?.image;
	const images =
		variationImage && !product.images.some((i) => i.src === variationImage.src) ? [variationImage, ...product.images] : product.images;

	// the picked thumbnail wins until a different variation is chosen (derived state, no effect)
	const [picked, setPicked] = useState<{ index: number; variationId?: number }>({ index: 0 });
	const followVariation = variationImage && picked.variationId !== variation?.id;
	const index = followVariation ? Math.max(0, images.findIndex((i) => i.src === variationImage.src)) : Math.min(picked.index, images.length - 1);
	const show = (i: number) => setPicked({ index: (i + images.length) % images.length, variationId: variation?.id });

	const current = images[index];
	if (!current) return <div className="aspect-square bg-sand-50" />;

	return (
		<div className="min-w-0 space-y-1.5">
			<div className="relative aspect-square overflow-hidden bg-sand-50">
				<AnimatePresence initial={false}>
					<motion.div key={current.src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
						<Image src={current.src} alt={current.alt} fill priority={index === 0} sizes="(min-width: 1025px) 600px, 100vw" className="object-cover" />
					</motion.div>
				</AnimatePresence>
				<button
					type="button"
					aria-label="Zoom image"
					onClick={() => dialog.current?.showModal()}
					className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center bg-white text-black transition-colors duration-300 hover:bg-black hover:text-white"
				>
					<Search className="size-4" />
				</button>
			</div>

			{images.length > 1 ? (
				<ul className="flex snap-x gap-1.5 overflow-x-auto pb-1" aria-label="Product images">
					{images.map((image, i) => (
						<li key={image.src} className="w-[calc(25%-4.5px)] min-w-20 shrink-0 snap-start">
							<button
								type="button"
								aria-label={`Show image ${i + 1}`}
								aria-current={i === index}
								onClick={() => show(i)}
								className={cn("relative block aspect-square w-full overflow-hidden bg-sand-50 transition-opacity duration-300", i === index ? "opacity-100" : "opacity-60 hover:opacity-100")}
							>
								<Image src={image.thumb} alt="" fill sizes="150px" className="object-cover" />
							</button>
						</li>
					))}
				</ul>
			) : null}

			<dialog
				ref={dialog}
				aria-label={`${product.name} images`}
				onKeyDown={(e) => {
					if (e.key === "ArrowRight") show(index + 1);
					if (e.key === "ArrowLeft") show(index - 1);
				}}
				onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
				className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 backdrop:bg-black/80"
			>
				<div className="relative flex h-full items-center justify-center p-4 md:p-16">
					<AnimatePresence mode="wait" initial={false}>
						<motion.div key={current.src} className="relative h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
							<Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
						</motion.div>
					</AnimatePresence>
					<button type="button" aria-label="Close" onClick={() => dialog.current?.close()} className="absolute right-4 top-4 flex size-10 items-center justify-center text-white hover:text-gold">
						<X className="size-6" />
					</button>
					{images.length > 1 ? (
						<>
							<button type="button" aria-label="Previous image" onClick={() => show(index - 1)} className="absolute left-2 flex size-10 items-center justify-center text-white hover:text-gold md:left-6">
								<ChevronLeft className="size-8" />
							</button>
							<button type="button" aria-label="Next image" onClick={() => show(index + 1)} className="absolute right-2 flex size-10 items-center justify-center text-white hover:text-gold md:right-6">
								<ChevronRight className="size-8" />
							</button>
							<p className="absolute bottom-4 text-xs tracking-button text-sand">
								{index + 1} / {images.length}
							</p>
						</>
					) : null}
				</div>
			</dialog>
		</div>
	);
}

export default ProductGallery;
