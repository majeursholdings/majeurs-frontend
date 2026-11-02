"use client";

import { useCallback } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

/** when each key was last sent: Strict Mode mounts twice in development, a second visit later counts again */
const sent = new Map<string, number>();

/**
 * Sends `event` once when it first renders, e.g. view_item on a product page. `id` names the occurrence
 * (product id, order number) so a remount doesn't send it twice.
 */
export function TrackOnMount({ id, event }: { id: string; event: AnalyticsEvent }) {
	const key = `${event.event}:${id}`;
	// stable for this key, so React calls it on mount only, not on every render
	const ref = useCallback(
		(el: HTMLSpanElement | null) => {
			if (!el || Date.now() - (sent.get(key) ?? 0) < 1000) return;
			sent.set(key, Date.now());
			trackEvent(event);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- the event is fixed by its key
		[key],
	);
	return <span ref={ref} hidden />;
}
