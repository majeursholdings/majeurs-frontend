import Script from "next/script";
import { GOOGLE_TAG_ID, META_PIXEL_ID } from "@/lib/analytics";

/**
 * Google tag (Site Kit's GA4 property) and Meta pixel (Meta for WooCommerce), as the WP theme printed them.
 * Page views after the first are tracked by both from history changes (GA4 enhanced measurement, the pixel's
 * pushState tracking), so client-side navigation needs no extra code.
 */
export function AnalyticsTags() {
	return (
		<>
			{GOOGLE_TAG_ID ? (
				<>
					<Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`} strategy="afterInteractive" />
					<Script id="gtag-init" strategy="afterInteractive">
						{`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag("js",new Date());gtag("config",${JSON.stringify(GOOGLE_TAG_ID)});`}
					</Script>
				</>
			) : null}
			{META_PIXEL_ID ? (
				<Script id="meta-pixel" strategy="afterInteractive">
					{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init",${JSON.stringify(META_PIXEL_ID)});fbq("track","PageView");`}
				</Script>
			) : null}
		</>
	);
}
