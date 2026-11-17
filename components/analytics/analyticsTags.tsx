import Script from "next/script";
import { ANALYTICS_HOSTS, GOOGLE_TAG_GATEWAY, GOOGLE_TAG_ID, META_PIXEL_ID } from "@/lib/analytics";

/**
 * Google tag (Site Kit's GA4 property) and Meta pixel (Meta for WooCommerce), as the WP theme printed them.
 * Page views after the first are tracked by both from history changes (GA4 enhanced measurement, the pixel's
 * pushState tracking), so client-side navigation needs no extra code.
 *
 * Speed: only the tiny queue stubs (window.gtag / window.fbq) run as the page becomes interactive, so events sent
 * early wait in the queue. The libraries themselves (~200 KB each, plus what the Google tag pulls in) load once the
 * page has finished loading and the browser is idle (as next/script's lazyOnload does), so they don't compete with
 * the hero image and the page's own code.
 *
 * Who is measured: each snippet first runs the same check as analyticsAllowed() (lib/analytics.ts). On any other
 * hostname (Vercel previews, *.vercel.app, localhost) or in an automated browser (navigator.webdriver), nothing is
 * set up and neither library is downloaded, so test orders and headless bots stay out of GA4 and Meta.
 *
 * With NEXT_PUBLIC_GOOGLE_TAG_GATEWAY set (the Google tag gateway path Cloudflare serves, e.g. "/fdep"), gtag.js
 * comes from this domain: one first-party request instead of googletagmanager.com plus the gateway re-fetching it.
 */
export function AnalyticsTags() {
	const gtagSrc = `${GOOGLE_TAG_GATEWAY ?? "https://www.googletagmanager.com"}/gtag/js?id=${GOOGLE_TAG_ID}`;
	// `allowed` is true when this page may be measured; `later(fn)` runs fn after load, when the browser is idle
	const guard = `var allowed=${JSON.stringify(ANALYTICS_HOSTS)}.indexOf(location.hostname.toLowerCase())>-1&&!navigator.webdriver;function later(f){function i(){"requestIdleCallback"in window?requestIdleCallback(f):setTimeout(f,1)}document.readyState==="complete"?i():addEventListener("load",i)}function load(src){var s=document.createElement("script");s.async=true;s.src=src;document.head.appendChild(s)}`;
	return (
		<>
			{GOOGLE_TAG_ID ? (
				<Script id="gtag-init" strategy="afterInteractive">
					{`(function(){${guard}if(!allowed)return;window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag("js",new Date());gtag("config",${JSON.stringify(GOOGLE_TAG_ID)});later(function(){load(${JSON.stringify(gtagSrc)})})})();`}
				</Script>
			) : null}
			{META_PIXEL_ID ? (
				/* Meta's standard snippet without its script insert: the queue now, fbevents.js after load */
				<Script id="meta-pixel" strategy="afterInteractive">
					{`(function(){${guard}if(!allowed)return;!function(f){if(f.fbq)return;var n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[]}(window);fbq("init",${JSON.stringify(META_PIXEL_ID)});fbq("track","PageView");later(function(){load("https://connect.facebook.net/en_US/fbevents.js")})})();`}
				</Script>
			) : null}
		</>
	);
}
