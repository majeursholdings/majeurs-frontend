"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/** YouTube thumbnail that becomes the (privacy-enhanced) player on click, so the page doesn't load YouTube up front */
export function LiteYouTube({ id, title }: { id: string; title: string }) {
	const [playing, setPlaying] = useState(false);

	if (playing) {
		return (
			<iframe
				src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
				title={title}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className="absolute inset-0 size-full"
			/>
		);
	}

	return (
		<button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`} className="group absolute inset-0 size-full">
			{/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail, outside next/image's allowed hosts */}
			<img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="size-full object-cover" />
			<span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
			<span className="absolute left-1/2 top-1/2 flex h-12 w-17 -translate-1/2 items-center justify-center rounded-xl bg-[#ff0000] text-white transition-transform group-hover:scale-110">
				<Play className="size-6 fill-current" aria-hidden />
			</span>
		</button>
	);
}
