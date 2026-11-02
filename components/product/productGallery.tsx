"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, MotionConfig, animate, motion, type Variants } from "motion/react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useProduct } from "./productProvider";
import { cn } from "@/lib/utils";

/** the clicked thumbnail's box relative to the main image; null swaps instantly (arrows, swipe), undefined fades (variation change) */
type Origin = { x: number; y: number; scale: number } | null;

// macOS dock "open app": the window zooms out of its icon on a quick spring, fading in over the first part
const zoom = { type: "spring", stiffness: 380, damping: 32, mass: 0.9 } as const;

const slide: Variants = {
	enter: (from?: Origin) => (from === null ? { opacity: 1 } : from ? { x: from.x, y: from.y, scale: from.scale, opacity: 0.2, zIndex: 10 } : { opacity: 0, zIndex: 1 }),
	center: (from?: Origin) => ({
		opacity: 1,
		x: 0,
		y: 0,
		scale: 1,
		zIndex: 1,
		transition: from === null ? { duration: 0 } : from ? { ...zoom, opacity: { duration: 0.18 }, zIndex: { delay: 0.6, duration: 0 } } : { duration: 0.35 },
	}),
	exit: (from?: Origin) => ({ opacity: 0, zIndex: 0, transition: from === null ? { duration: 0 } : { duration: 0.3, delay: from ? 0.25 : 0 } }),
};

const arrow =
	"absolute top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center bg-white/85 text-black backdrop-blur-sm transition duration-300 hover:bg-black hover:text-white md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100";

const thumbArrow =
	"absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center bg-white/85 text-black shadow-sm backdrop-blur-sm transition-colors duration-300 hover:bg-black hover:text-white";

/**
 * WP product gallery (rtwpvg): square main image with a zoom button and arrows (swipe on touch), a row of thumbnails underneath that grow into the main image,
 * and a full-screen viewer. Choosing a variation switches to that variation's image.
 */
export function ProductGallery() {
	const { product, variation } = useProduct();
	const dialog = useRef<HTMLDialogElement>(null);
	const stage = useRef<HTMLDivElement>(null);
	const strip = useRef<HTMLUListElement>(null);

	// a variation image that isn't already in the gallery goes first
	const variationImage = variation?.image;
	const images = variationImage && !product.images.some((i) => i.src === variationImage.src) ? [variationImage, ...product.images] : product.images;

	// the picked thumbnail wins until a different variation is chosen (derived state, no effect)
	const [picked, setPicked] = useState<{
		index: number;
		variationId?: number;
		from?: Origin;
	}>({ index: 0 });
	const followVariation = variationImage && picked.variationId !== variation?.id;
	const index = followVariation
		? Math.max(
				0,
				images.findIndex((i) => i.src === variationImage.src),
			)
		: Math.min(picked.index, images.length - 1);
	const from = followVariation ? undefined : picked.from;

	const show = (i: number, origin: Origin = null) => {
		const next = (i + images.length) % images.length;
		if (next === index) return;
		setPicked({
			index: next,
			variationId: variation?.id,
			from: origin,
		});
		strip.current?.children[next]?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "nearest",
		});
	};

	// the clicked thumbnail's box relative to the main image, so the new image grows out of it
	const growFrom = (i: number, thumb: HTMLElement) => {
		// and the icon bounces, as in the dock
		if (i !== index) animate(thumb, { y: [0, -8, 0, -3, 0] }, { duration: 0.6, ease: "easeOut" });
		const box = stage.current?.getBoundingClientRect();
		const t = thumb.getBoundingClientRect();
		show(
			i,
			box
				? {
						x: t.left - box.left,
						y: t.top - box.top,
						scale: t.width / box.width,
					}
				: undefined,
		);
	};

	const scrollStrip = (dir: 1 | -1) => strip.current?.scrollBy({ left: dir * strip.current.clientWidth, behavior: "smooth" });

	const current = images[index];
	if (!current) return <div className="aspect-square bg-sand-50" />;

	return (
		<MotionConfig reducedMotion="user">
			<div className="min-w-0 space-y-1.5">
				<div ref={stage} className="group relative isolate aspect-square bg-sand-50">
					<AnimatePresence initial={false} custom={from}>
						<motion.div
							key={current.src}
							custom={from}
							variants={slide}
							initial="enter"
							animate="center"
							exit="exit"
							className="absolute inset-0 origin-top-left overflow-hidden"
							onPanEnd={(_, info) => {
								if (Math.abs(info.offset.x) > 50 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) show(index + (info.offset.x < 0 ? 1 : -1));
							}}
							style={{ touchAction: "pan-y" }}
						>
							<Image src={current.src} alt={current.alt} fill priority={index === 0} sizes="(min-width: 1025px) 600px, 100vw" className="pointer-events-none object-cover" />
						</motion.div>
					</AnimatePresence>
					<button
						type="button"
						aria-label="Zoom image"
						onClick={() => dialog.current?.showModal()}
						className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center bg-white text-black transition-colors duration-300 hover:bg-black hover:text-white"
					>
						<Search className="size-4" />
					</button>
					{images.length > 1 ? (
						<>
							<button type="button" aria-label="Previous image" onClick={() => show(index - 1)} className={cn(arrow, "left-3 md:-translate-x-2 md:group-hover:translate-x-0")}>
								<ChevronLeft className="size-5" />
							</button>
							<button type="button" aria-label="Next image" onClick={() => show(index + 1)} className={cn(arrow, "right-3 md:translate-x-2 md:group-hover:translate-x-0")}>
								<ChevronRight className="size-5" />
							</button>
							<p className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 bg-white/80 px-2 py-0.5 text-xs tabular-nums tracking-button text-black backdrop-blur-sm">
								{index + 1} / {images.length}
							</p>
						</>
					) : null}
				</div>

				{images.length > 1 ? (
					<div className="relative">
						<ul ref={strip} className="flex snap-x gap-1.5 overflow-x-auto pt-2 -mt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Product images">
							{images.map((image, i) => (
								<li key={image.src} className="w-[calc(25%-4.5px)] min-w-20 shrink-0 snap-start">
									<button
										type="button"
										aria-label={`Show image ${i + 1}`}
										aria-current={i === index}
										onClick={(e) => growFrom(i, e.currentTarget)}
										className={cn(
											"group/thumb relative block aspect-square w-full overflow-hidden bg-sand-50 transition-opacity duration-300",
											i === index ? "opacity-100" : "opacity-60 hover:opacity-100",
										)}
									>
										<Image src={image.thumb} alt="" fill sizes="150px" className="object-cover transition-transform duration-500 ease-out group-hover/thumb:scale-105" />
										{i === index ? (
											<motion.span
												layoutId="gallery-active"
												className="absolute inset-x-0 bottom-0 h-0.5 bg-black"
												transition={{
													type: "spring",
													stiffness: 500,
													damping: 40,
												}}
											/>
										) : null}
									</button>
								</li>
							))}
						</ul>
						{images.length > 4 ? (
							<>
								<button type="button" aria-label="Scroll thumbnails left" onClick={() => scrollStrip(-1)} className={cn(thumbArrow, "left-1")}>
									<ChevronLeft className="size-4" />
								</button>
								<button type="button" aria-label="Scroll thumbnails right" onClick={() => scrollStrip(1)} className={cn(thumbArrow, "right-1")}>
									<ChevronRight className="size-4" />
								</button>
							</>
						) : null}
					</div>
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
									aria-label="Previous image"
									onClick={() => show(index - 1)}
									className="absolute left-2 flex size-10 items-center justify-center text-white hover:text-gold md:left-6"
								>
									<ChevronLeft className="size-8" />
								</button>
								<button
									type="button"
									aria-label="Next image"
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
				</dialog>
			</div>
		</MotionConfig>
	);
}

export default ProductGallery;
