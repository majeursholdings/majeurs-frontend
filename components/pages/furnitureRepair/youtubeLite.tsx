"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/** YouTube thumbnail that swaps to a youtube-nocookie player on click, so nothing from YouTube loads until then */
export function YoutubeLite({ id, title }: { id: string; title: string }) {
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
			{/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail CDN, not a majeurs.com upload */}
			<img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="size-full object-cover" />
			<span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/40" aria-hidden />
			<span className="absolute left-1/2 top-1/2 flex size-16 -translate-1/2 items-center justify-center rounded-full bg-white/90 text-black transition-transform group-hover:scale-105">
				<Play className="ml-1 size-6 fill-current" aria-hidden />
			</span>
		</button>
	);
}

export default YoutubeLite;
