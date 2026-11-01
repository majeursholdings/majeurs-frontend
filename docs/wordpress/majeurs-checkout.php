<?php
/**
 * Majeurs headless: checkout links point at the Next.js site
 *
 * Install: WP admin > Snippets > Add New > paste this file (without the opening <?php tag),
 * "Run snippet everywhere", Activate.
 *
 * The Next.js checkout places orders through the Store API, but WooCommerce and the gateways still build
 * the links customers follow afterwards from the WordPress home URL:
 *   - order received: Paystack's return after paying, free orders, order emails, my-account
 *   - pay for order:  "Pay for this order" in emails and my-account
 *   - cart:           Paystack's "cancel" button
 * This points them at the Next.js site the order was placed from, and lets wp_safe_redirect() go there
 * (Paystack redirects with it; an unknown host would send customers to wp-admin instead).
 *
 * Which site: Next.js sends its origin as the X-Majeurs-Site header with every checkout request, and it is
 * saved on the order (_majeurs_site_url). It is only trusted when it's one of:
 *   - Settings > General > "Majeurs site URL" (majeurs-content.php), or MAJEURS_REVALIDATE_URL in wp-config.php
 *   - Settings > General > "Majeurs checkout sites": more sites, one URL per line (e.g. http://majeurs.local for
 *     local testing, a Vercel preview), or MAJEURS_CHECKOUT_SITES (comma separated) in wp-config.php
 * Anything else falls back to "Majeurs site URL", so the header can't be used to send customers elsewhere.
 *
 * Only needed while WordPress and Next.js are on different hosts (staging: api.majeurs.com vs the Vercel
 * site; later cms.majeurs.com vs majeurs.com). While both share majeurs.com behind Cloudflare it changes nothing.
 *
 * Also: GET /wp-json/majeurs/v1/order-currency?id=123&key=wc_order_… -> { "currency": "GBP" }. The Store API
 * labels an order's amounts in the visitor's currency, not the order's, so the pay-for-order page opened from an
 * email asks here. The order key is the secret, as on WooCommerce's own order links.
 */

/** "Majeurs site URL": the main Next.js site */
function majeurs_checkout_site_url() {
	$url = defined( 'MAJEURS_REVALIDATE_URL' ) ? MAJEURS_REVALIDATE_URL : get_option( 'majeurs_revalidate_url' );
	return $url ? untrailingslashit( $url ) : '';
}

/** Every Next.js site checkout links may point at: the main site plus "Majeurs checkout sites" */
function majeurs_checkout_allowed_sites() {
	$extra = defined( 'MAJEURS_CHECKOUT_SITES' ) ? explode( ',', MAJEURS_CHECKOUT_SITES ) : preg_split( '/\s+/', (string) get_option( 'majeurs_checkout_sites', '' ) );
	$sites = array_merge( array( majeurs_checkout_site_url() ), $extra );
	$sites = array_map( function ( $url ) {
		return untrailingslashit( esc_url_raw( trim( $url ) ) );
	}, $sites );
	return array_values( array_unique( array_filter( $sites ) ) );
}

/** $url when it's an allowed site (scheme + host + port must match), else '' */
function majeurs_checkout_allowed( $url ) {
	$url = untrailingslashit( trim( (string) $url ) );
	return '' !== $url && in_array( $url, majeurs_checkout_allowed_sites(), true ) ? $url : '';
}

/** The site this request came from (X-Majeurs-Site), when allowed */
function majeurs_checkout_request_site() {
	return isset( $_SERVER['HTTP_X_MAJEURS_SITE'] ) ? majeurs_checkout_allowed( wp_unslash( $_SERVER['HTTP_X_MAJEURS_SITE'] ) ) : '';
}

/** Store API checkout and pay-for-order: remember which site the order came from */
add_action( 'woocommerce_store_api_checkout_update_order_from_request', function ( $order, $request ) {
	$site = majeurs_checkout_allowed( $request->get_header( 'x_majeurs_site' ) );
	if ( $site && $order instanceof WC_Order && $order->get_meta( '_majeurs_site_url' ) !== $site ) {
		$order->update_meta_data( '_majeurs_site_url', $site );
		if ( $order->get_id() ) {
			$order->save_meta_data();
		}
	}
}, 10, 2 );

/**
 * https://wp-host/checkout/order-received/123/?key=… -> https://next-host/checkout/order-received/123/?key=…
 * Next host: the order's own site, else this request's site, else "Majeurs site URL".
 */
function majeurs_checkout_rehost( $url, $order = null ) {
	if ( ! is_string( $url ) || '' === $url ) {
		return $url;
	}
	$site = $order instanceof WC_Order ? majeurs_checkout_allowed( $order->get_meta( '_majeurs_site_url' ) ) : '';
	$site = $site ? $site : majeurs_checkout_request_site();
	$site = $site ? $site : majeurs_checkout_site_url();
	if ( ! $site ) {
		return $url;
	}
	$home = untrailingslashit( home_url() );
	return 0 === strpos( $url, $home ) ? $site . substr( $url, strlen( $home ) ) : $url;
}

add_filter( 'woocommerce_get_checkout_order_received_url', 'majeurs_checkout_rehost', 99, 2 );
add_filter( 'woocommerce_get_return_url', 'majeurs_checkout_rehost', 99, 2 );
add_filter( 'woocommerce_get_checkout_payment_url', 'majeurs_checkout_rehost', 99, 2 );
add_filter( 'woocommerce_get_cart_url', function ( $url ) {
	// wp-admin keeps its own cart link
	return is_admin() && ! wp_doing_ajax() ? $url : majeurs_checkout_rehost( $url );
}, 99 );

add_filter( 'allowed_redirect_hosts', function ( $hosts ) {
	foreach ( majeurs_checkout_allowed_sites() as $site ) {
		$host = wp_parse_url( $site, PHP_URL_HOST );
		if ( $host && ! in_array( $host, $hosts, true ) ) {
			$hosts[] = $host;
		}
	}
	return $hosts;
} );

// on init (not admin_init) so it can also be set through /wp-json/wp/v2/settings by an admin
add_action( 'init', function () {
	register_setting( 'general', 'majeurs_checkout_sites', array(
		'type'              => 'string',
		'show_in_rest'      => true,
		'default'           => '',
		'sanitize_callback' => function ( $value ) {
			$lines = array_filter( array_map( 'trim', preg_split( '/\s+/', (string) $value ) ) );
			return implode( "\n", array_map( 'esc_url_raw', $lines ) );
		},
	) );
} );

add_action( 'admin_init', function () {
	add_settings_field( 'majeurs_checkout_sites', 'Majeurs checkout sites', function () {
		printf(
			'<textarea class="large-text" rows="3" name="majeurs_checkout_sites" placeholder="http://majeurs.local">%s</textarea><p class="description">Other Next.js sites customers may check out on (local testing, previews), one URL per line. After paying they are sent back to the site they ordered on. "Majeurs site URL" is always allowed.</p>',
			esc_textarea( get_option( 'majeurs_checkout_sites', '' ) )
		);
	}, 'general' );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'majeurs/v1', '/order-currency', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'args'                => array(
			'id'  => array( 'required' => true, 'sanitize_callback' => 'absint' ),
			'key' => array( 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ),
		),
		'callback'            => function ( WP_REST_Request $request ) {
			$order = wc_get_order( $request['id'] );
			if ( ! $order || ! hash_equals( $order->get_order_key(), (string) $request['key'] ) ) {
				return new WP_Error( 'majeurs_invalid_order', 'Invalid order.', array( 'status' => 404 ) );
			}
			return array( 'currency' => $order->get_currency() );
		},
	) );
} );
