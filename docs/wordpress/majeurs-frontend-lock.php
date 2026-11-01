<?php
/**
 * Majeurs headless: hide the WordPress front end
 *
 * Install: WP admin > Snippets > Add New > paste this file (without the opening <?php tag),
 * "Run snippet everywhere", Activate. Uses Settings > General > "Majeurs site URL" (from
 * majeurs-content.php), or MAJEURS_REVALIDATE_URL in wp-config.php.
 *
 * Visitors to a WordPress page (theme templates, product and category pages, feeds, WP's own cart and
 * checkout) are sent to the same path on the Next.js site. XML-RPC is switched off.
 *
 * Still served as usual, because they never reach WordPress's page templates:
 *   - wp-admin and wp-login.php
 *   - the REST API (/wp-json/), which the Next.js site runs on
 *   - media and assets (/wp-content/, /wp-includes/): static files the web server sends directly
 *   - payment callbacks: /wc-api/… and ?wc-api= (Paystack, Stripe webhooks), ?wc-ajax= (Stripe's 3-D Secure step)
 *   - admin-ajax.php and wp-cron.php
 * Also let through: logged-in editors (previews, Elementor), robots.txt (which disallows everything), and
 * requests carrying the headless secret (X-Majeurs-Secret = MAJEURS_HEADLESS_SECRET; npm run checkout:countries).
 *
 * Does nothing while WordPress and the Next.js site share a host (live, before the move to cms.majeurs.com),
 * so it can't loop. Redirects are temporary (302) so browsers don't remember them if this is switched off.
 */

/** The Next.js site to send visitors to, or '' when it isn't set or is this same host */
function majeurs_lock_site_url() {
	$url = defined( 'MAJEURS_REVALIDATE_URL' ) ? MAJEURS_REVALIDATE_URL : get_option( 'majeurs_revalidate_url' );
	$url = $url ? untrailingslashit( $url ) : '';
	if ( ! $url || wp_parse_url( $url, PHP_URL_HOST ) === wp_parse_url( home_url(), PHP_URL_HOST ) ) {
		return '';
	}
	return $url;
}

/** Requests that keep seeing WordPress pages */
function majeurs_lock_exempt() {
	if ( is_user_logged_in() && current_user_can( 'edit_posts' ) ) {
		return true;
	}
	if ( is_robots() || is_favicon() || is_customize_preview() ) {
		return true;
	}
	$secret = isset( $_SERVER['HTTP_X_MAJEURS_SECRET'] ) ? (string) wp_unslash( $_SERVER['HTTP_X_MAJEURS_SECRET'] ) : '';
	return defined( 'MAJEURS_HEADLESS_SECRET' ) && MAJEURS_HEADLESS_SECRET && '' !== $secret && hash_equals( MAJEURS_HEADLESS_SECRET, $secret );
}

// Priority 1: after WooCommerce answers ?wc-ajax= (priority 0); /wc-api/ is answered earlier still (parse_request)
add_action( 'template_redirect', function () {
	$site = majeurs_lock_site_url();
	if ( ! $site || majeurs_lock_exempt() ) {
		return;
	}
	$path = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '/';
	// a relative path only, so the target always stays on the Next.js site
	if ( '' === $path || '/' !== $path[0] || 0 === strpos( $path, '//' ) ) {
		$path = '/';
	}
	nocache_headers();
	header( 'X-Robots-Tag: noindex, nofollow', true );
	wp_redirect( $site . $path, 302, 'Majeurs' );
	exit;
}, 1 );

add_filter( 'robots_txt', function ( $output ) {
	return majeurs_lock_site_url() ? "User-agent: *\nDisallow: /\n" : $output;
}, 99 );

add_filter( 'xmlrpc_enabled', function ( $enabled ) {
	return majeurs_lock_site_url() ? false : $enabled;
} );
