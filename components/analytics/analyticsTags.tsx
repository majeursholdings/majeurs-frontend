import Script from "next/script";
import { GOOGLE_TAG_ID, META_PIXEL_ID } from "@/lib/analytics";

/**
 * Google tag (Site Kit's GA4 property) and Meta pixel (Meta for WooCommerce), as the WP theme printed them.
 * Page views after the first are tracked by both from history changes (GA4 enhanced measurement, the pixel's
 * pushState tracking), so client-side navigation needs no extra code.
 *
 * Speed: only the tiny queue stubs (window.gtag / window.fbq) run as the page becomes interactive, so events sent
 * early wait in the queue. The libraries themselves (~200 KB each, plus what the Google tag pulls in) load after
 * the page has finished loading (lazyOnload), so they don't compete with the hero image and the page's own code.
 */
export function AnalyticsTags() {
	return (
		<>
			{GOOGLE_TAG_ID ? (
				<>
					<Script id="gtag-init" strategy="afterInteractive">
						{`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag("js",new Date());gtag("config",${JSON.stringify(GOOGLE_TAG_ID)});`}
					</Script>
					<Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`} strategy="lazyOnload" />
				</>
			) : null}
			{META_PIXEL_ID ? (
				<>
					{/* Meta's standard snippet without its script insert: the queue now, fbevents.js after load */}
					<Script id="meta-pixel" strategy="afterInteractive">
						{`!function(f){if(f.fbq)return;var n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[]}(window);fbq("init",${JSON.stringify(META_PIXEL_ID)});fbq("track","PageView");`}
					</Script>
					<Script src="https://connect.facebook.net/en_US/fbevents.js" strategy="lazyOnload" />
				</>
			) : null}
		</>
	);
}
