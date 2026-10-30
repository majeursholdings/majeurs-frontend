<?php
/**
 * Majeurs headless: currency rates endpoint
 *
 * Install: WP admin > Snippets > Add New > paste this file (without the opening <?php tag),
 * "Run snippet everywhere", Activate.
 *
 * GET /wp-json/majeurs/v1/currencies
 *   { "base": "USD", "currencies": [ { "code": "NGN", "rate": 1343.25, "symbol": "₦", "decimals": 2 }, … ] }
 *
 * The WooCommerce Store API labels prices in the visitor's currency but never converts them, and
 * ShopBuilder Pro keeps its exchange rates in its own settings with no API. This reads those settings
 * so the Next.js front end converts prices with the same rates WP uses.
 *
 * ShopBuilder's settings layout isn't documented, so the rates are found by walking every rtsb* option
 * for entries that pair a WooCommerce currency code with a numeric rate. If "currencies" comes back
 * with only the base currency, open /wp-json/majeurs/v1/currencies?debug=1 while logged in as an
 * admin and send the output to the developer.
 */

add_action( 'rest_api_init', function () {
	register_rest_route( 'majeurs/v1', '/currencies', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => 'majeurs_rest_currencies',
	) );
} );

function majeurs_rest_currencies( WP_REST_Request $request ) {
	global $wpdb;

	$base     = get_option( 'woocommerce_currency' );
	$known    = array_keys( get_woocommerce_currencies() );
	$decimals = wc_get_price_decimals();
	$rates    = array();
	$debug    = array();

	$rows = $wpdb->get_results( "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE 'rtsb%'" );

	foreach ( $rows as $row ) {
		$value = majeurs_decode_json( maybe_unserialize( $row->option_value ) );
		if ( ! is_array( $value ) ) {
			continue;
		}
		$debug[ $row->option_name ] = majeurs_shape( $value );
		majeurs_find_rates( $value, $known, $rates );
	}

	if ( $request->get_param( 'debug' ) && current_user_can( 'manage_options' ) ) {
		return array( 'base' => $base, 'found' => $rates, 'options' => $debug );
	}

	$currencies = array(
		array( 'code' => $base, 'rate' => 1, 'symbol' => html_entity_decode( get_woocommerce_currency_symbol( $base ) ), 'decimals' => $decimals ),
	);
	foreach ( $rates as $code => $rate ) {
		if ( $code === $base ) {
			continue;
		}
		$currencies[] = array( 'code' => $code, 'rate' => $rate, 'symbol' => html_entity_decode( get_woocommerce_currency_symbol( $code ) ), 'decimals' => $decimals );
	}

	$response = rest_ensure_response( array( 'base' => $base, 'currencies' => $currencies ) );
	$response->header( 'Cache-Control', 'public, max-age=300' );
	return $response;
}

/** JSON strings, at any depth, decoded into arrays (ShopBuilder keeps exchange_rates as a JSON string inside rtsb_settings) */
function majeurs_decode_json( $node ) {
	if ( is_string( $node ) && ( '[' === substr( $node, 0, 1 ) || '{' === substr( $node, 0, 1 ) ) ) {
		$json = json_decode( $node, true );
		return is_array( $json ) ? majeurs_decode_json( $json ) : $node;
	}
	if ( is_array( $node ) ) {
		foreach ( $node as $key => $value ) {
			$node[ $key ] = majeurs_decode_json( $value );
		}
	}
	return $node;
}

/** Collects [ CODE => rate ] from any array entry holding a known currency code and a numeric *rate* field. */
function majeurs_find_rates( $node, $known, &$rates ) {
	if ( ! is_array( $node ) ) {
		return;
	}
	$code = null;
	$rate = null;
	foreach ( $node as $key => $value ) {
		// ShopBuilder: currency_options[] = { title: "NGN", currency_rate: "1346.00051", activate_currency: "on", … }
		if ( is_string( $value ) && in_array( strtoupper( $value ), $known, true ) && ( 'currency' === $key || 'code' === $key || 'title' === $key || false !== strpos( (string) $key, 'currency' ) ) ) {
			$code = strtoupper( $value );
		}
		if ( false !== stripos( (string) $key, 'rate' ) && is_numeric( $value ) && (float) $value > 0 ) {
			$rate = (float) $value;
		}
	}
	if ( $code && $rate ) {
		$rates[ $code ] = $rate;
	}
	foreach ( $node as $key => $value ) {
		// settings keyed by code: [ 'NGN' => [ 'rate' => 1343.25 ] ]
		if ( is_array( $value ) && is_string( $key ) && in_array( strtoupper( $key ), $known, true ) ) {
			foreach ( $value as $k => $v ) {
				if ( false !== stripos( (string) $k, 'rate' ) && is_numeric( $v ) && (float) $v > 0 ) {
					$rates[ strtoupper( $key ) ] = (float) $v;
				}
			}
		}
		majeurs_find_rates( $value, $known, $rates );
	}
}

/** Keys and value types for ?debug=1; values only when short, or under a rate/currency key (no licence keys) */
function majeurs_shape( $node, $depth = 0, $key = '' ) {
	if ( ! is_array( $node ) || $depth > 5 ) {
		if ( is_array( $node ) ) {
			return 'array';
		}
		$text = is_scalar( $node ) ? (string) $node : '';
		$show = strlen( $text ) <= 12 || preg_match( '/rate|currenc/i', (string) $key );
		return gettype( $node ) . ( $show && '' !== $text ? ':' . substr( $text, 0, 160 ) : '' );
	}
	$out = array();
	foreach ( array_slice( $node, 0, 25, true ) as $k => $value ) {
		$out[ $k ] = majeurs_shape( $value, $depth + 1, $k );
	}
	return $out;
}
