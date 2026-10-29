<?php
/**
 * Majeurs headless: extra product data for the product page
 *
 * Install: WP admin > Snippets > Add New > paste this file (without the opening <?php tag),
 * "Run snippet everywhere", Activate.
 *
 * Adds `extensions.majeurs` to every Store API product (GET /wp-json/wc/store/v1/products?slug=…):
 *
 *   {
 *     "cross_sell_ids": [12, 34],   // "Complete the Room"   (Linked Products > Cross-sells)
 *     "upsell_ids": [56],           // "You Might Also Like" (Linked Products > Upsells)
 *     "swatches": {                 // ShopBuilder variation swatches, keyed like the Store API attributes
 *       "Color":    { "type": "color", "terms": { "Electric Blue": { "color": "#3e1c4f" } } },
 *       "Material": { "type": "image", "terms": { "uf-2039-42": { "image": "https://…/swatch.jpg" } } }
 *     }
 *   }
 *
 * The Store API leaves all three out. Without this snippet the product page still works: swatches show as
 * text buttons, and the two rails fall back to products from the same / other categories.
 *
 * ShopBuilder (rtwpvs) doesn't document where it keeps swatch colours. Taxonomy attributes are read from
 * term meta; custom product attributes from any rtwpvs product meta. If a product's swatches come back
 * empty, open /wp-json/majeurs/v1/swatches-debug/<product id> while logged in as an admin and send the
 * output to the developer.
 */

add_action( 'woocommerce_blocks_loaded', function () {
	if ( ! function_exists( 'woocommerce_store_api_register_endpoint_data' ) ) {
		return;
	}
	woocommerce_store_api_register_endpoint_data( array(
		'endpoint'        => 'product',
		'namespace'       => 'majeurs',
		'data_callback'   => 'majeurs_product_extras',
		'schema_callback' => function () {
			return array();
		},
		'schema_type'     => ARRAY_A,
	) );
} );

function majeurs_product_extras( $product ) {
	return array(
		'cross_sell_ids' => array_map( 'intval', $product->get_cross_sell_ids() ),
		'upsell_ids'     => array_map( 'intval', $product->get_upsell_ids() ),
		// list responses (shop grid) don't need swatches
		'swatches'       => $product->is_type( 'variable' ) ? majeurs_product_swatches( $product ) : (object) array(),
	);
}

function majeurs_product_swatches( WC_Product $product ) {
	$swatches = array();
	$meta     = majeurs_rtwpvs_product_meta( $product->get_id() );

	foreach ( $product->get_attributes() as $attribute ) {
		if ( ! $attribute->get_variation() ) {
			continue;
		}
		$label = wc_attribute_label( $attribute->get_name(), $product );
		$terms = array();
		$type  = 'button';

		if ( $attribute->is_taxonomy() ) {
			$tax = wc_get_attribute( $attribute->get_id() );
			if ( $tax && in_array( $tax->type, array( 'color', 'image', 'button' ), true ) ) {
				$type = $tax->type;
			}
			foreach ( $attribute->get_terms() as $term ) {
				$swatch = majeurs_term_swatch( $term->term_id );
				if ( $swatch ) {
					$terms[ $term->slug ] = $swatch;
				}
			}
		} else {
			foreach ( $attribute->get_options() as $option ) {
				$swatch = majeurs_find_swatch( $meta, $option );
				if ( $swatch ) {
					$terms[ $option ] = $swatch;
				}
			}
		}

		if ( $terms ) {
			$first = reset( $terms );
			if ( 'button' === $type ) {
				$type = isset( $first['color'] ) ? 'color' : 'image';
			}
			$swatches[ $label ] = array( 'type' => $type, 'terms' => $terms );
		}
	}

	return $swatches ? $swatches : (object) array();
}

/** Colour / image swatch stored on an attribute term */
function majeurs_term_swatch( $term_id ) {
	foreach ( array( 'rtwpvs_color', 'product_attribute_color', 'color' ) as $key ) {
		$color = get_term_meta( $term_id, $key, true );
		if ( is_string( $color ) && preg_match( '/^#[0-9a-f]{3,8}$/i', $color ) ) {
			return array( 'color' => $color );
		}
	}
	foreach ( array( 'rtwpvs_image', 'product_attribute_image', 'image' ) as $key ) {
		$image = majeurs_swatch_image( get_term_meta( $term_id, $key, true ) );
		if ( $image ) {
			return array( 'image' => $image );
		}
	}
	return null;
}

function majeurs_swatch_image( $value ) {
	if ( is_numeric( $value ) && $value > 0 ) {
		return wp_get_attachment_image_url( (int) $value, 'thumbnail' ) ?: null;
	}
	return is_string( $value ) && 0 === strpos( $value, 'http' ) ? $value : null;
}

/** Every rtwpvs* product meta value, unserialized */
function majeurs_rtwpvs_product_meta( $product_id ) {
	$found = array();
	foreach ( get_post_meta( $product_id ) as $key => $values ) {
		if ( false !== stripos( $key, 'rtwpvs' ) ) {
			$found[ $key ] = maybe_unserialize( $values[0] );
		}
	}
	return $found;
}

/** Walks the product meta for an entry keyed by the option name that holds a colour or an image */
function majeurs_find_swatch( $value, $option ) {
	if ( ! is_array( $value ) ) {
		return null;
	}
	foreach ( $value as $key => $child ) {
		if ( (string) $key === (string) $option || (string) $key === sanitize_title( $option ) ) {
			$swatch = majeurs_swatch_from( $child );
			if ( $swatch ) {
				return $swatch;
			}
		}
		$swatch = majeurs_find_swatch( $child, $option );
		if ( $swatch ) {
			return $swatch;
		}
	}
	return null;
}

function majeurs_swatch_from( $value ) {
	if ( is_string( $value ) && preg_match( '/^#[0-9a-f]{3,8}$/i', $value ) ) {
		return array( 'color' => $value );
	}
	if ( ! is_array( $value ) ) {
		return null;
	}
	foreach ( $value as $key => $child ) {
		if ( false !== stripos( (string) $key, 'color' ) && is_string( $child ) && preg_match( '/^#[0-9a-f]{3,8}$/i', $child ) ) {
			return array( 'color' => $child );
		}
		if ( false !== stripos( (string) $key, 'image' ) ) {
			$image = majeurs_swatch_image( $child );
			if ( $image ) {
				return array( 'image' => $image );
			}
		}
	}
	return null;
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'majeurs/v1', '/swatches-debug/(?P<id>\d+)', array(
		'methods'             => 'GET',
		'permission_callback' => function () {
			return current_user_can( 'manage_options' );
		},
		'callback'            => function ( WP_REST_Request $request ) {
			$product = wc_get_product( absint( $request->get_param( 'id' ) ) );
			if ( ! $product ) {
				return new WP_Error( 'not_found', 'No such product.', array( 'status' => 404 ) );
			}
			$terms = array();
			foreach ( $product->get_attributes() as $attribute ) {
				if ( $attribute->is_taxonomy() ) {
					foreach ( $attribute->get_terms() as $term ) {
						$terms[ $attribute->get_name() ][ $term->slug ] = get_term_meta( $term->term_id );
					}
				}
			}
			return array(
				'swatches'     => majeurs_product_swatches( $product ),
				'product_meta' => majeurs_rtwpvs_product_meta( $product->get_id() ),
				'term_meta'    => $terms,
			);
		},
	) );
} );
