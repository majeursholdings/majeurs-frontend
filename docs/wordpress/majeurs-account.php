<?php
/**
 * Majeurs headless: customer account endpoints
 *
 * Install: WP admin > Snippets > Add New > paste this file (without the opening <?php tag),
 * "Run snippet everywhere", Activate. Then add to wp-config.php (same value as WP_ACCOUNT_SECRET in Next.js):
 *
 *   define( 'MAJEURS_HEADLESS_SECRET', 'a-long-random-string' );
 *
 * Every route needs that secret in the X-Majeurs-Secret header, so only the Next.js server can call them.
 * Signed-in routes also need X-Majeurs-Session: the token returned by /login or /register. Next.js keeps it
 * in an httpOnly cookie; WordPress stores only its SHA-256 hash in user meta (_majeurs_sessions).
 *
 *   POST /wp-json/majeurs/v1/account/login            { username, password, remember }  -> { token, expires, customer }
 *   POST /wp-json/majeurs/v1/account/register         { email }                         -> { token, expires, customer }
 *   POST /wp-json/majeurs/v1/account/lost-password    { login }                         -> { ok }
 *   POST /wp-json/majeurs/v1/account/reset-password   { key, id|login, password }       -> { ok }
 *   POST /wp-json/majeurs/v1/account/logout                                             -> { ok }
 *   GET  /wp-json/majeurs/v1/account/me                                                 -> customer
 *   POST /wp-json/majeurs/v1/account/me               { first_name, last_name, display_name, email, current_password?, new_password? }
 *   GET  /wp-json/majeurs/v1/account/addresses                                          -> { billing, shipping, countries, states }
 *   POST /wp-json/majeurs/v1/account/addresses/billing|shipping  { first_name, … }
 *   GET  /wp-json/majeurs/v1/account/orders?page=1                                      -> { orders, total, pages }
 *   GET  /wp-json/majeurs/v1/account/orders/<id>                                        -> order
 *   GET    /wp-json/majeurs/v1/account/wishlist                                         -> { ids }
 *   POST   /wp-json/majeurs/v1/account/wishlist        { ids: [] }                      -> { ids }  (adds; used to merge a guest list on login)
 *   DELETE /wp-json/majeurs/v1/account/wishlist/<id>                                    -> { ids }
 *        Product ids in user meta (_majeurs_wishlist), newest last, published products only, at most 200.
 *   POST /wp-json/majeurs/v1/comments                 { post, comment, author?, email?, parent? }  -> { id, approved }
 *        Blog comments. Signed in (X-Majeurs-Session), the comment is the customer's; otherwise name + email are
 *        required. WordPress's own checks apply (comments closed, flood, duplicates, moderation, Akismet), with
 *        the visitor's IP taken from X-Majeurs-Client-IP.
 *
 * Registration and lost-password emails are WooCommerce's own, so their links point at
 * /my-account/lost-password/?key=…&id=… which the Next.js site handles.
 */

defined( 'MAJEURS_SESSION_META' ) || define( 'MAJEURS_SESSION_META', '_majeurs_sessions' );

add_action( 'rest_api_init', function () {
	$ns     = 'majeurs/v1';
	$public = 'majeurs_account_check_secret';
	$authed = 'majeurs_account_check_session';

	register_rest_route( $ns, '/account/login', array( 'methods' => 'POST', 'permission_callback' => $public, 'callback' => 'majeurs_account_login' ) );
	register_rest_route( $ns, '/account/register', array( 'methods' => 'POST', 'permission_callback' => $public, 'callback' => 'majeurs_account_register' ) );
	register_rest_route( $ns, '/account/lost-password', array( 'methods' => 'POST', 'permission_callback' => $public, 'callback' => 'majeurs_account_lost_password' ) );
	register_rest_route( $ns, '/account/reset-password', array( 'methods' => 'POST', 'permission_callback' => $public, 'callback' => 'majeurs_account_reset_password' ) );
	register_rest_route( $ns, '/account/logout', array( 'methods' => 'POST', 'permission_callback' => $authed, 'callback' => 'majeurs_account_logout' ) );
	register_rest_route( $ns, '/account/me', array(
		array( 'methods' => 'GET', 'permission_callback' => $authed, 'callback' => 'majeurs_account_me' ),
		array( 'methods' => 'POST', 'permission_callback' => $authed, 'callback' => 'majeurs_account_update_me' ),
	) );
	register_rest_route( $ns, '/account/addresses', array( 'methods' => 'GET', 'permission_callback' => $authed, 'callback' => 'majeurs_account_addresses' ) );
	register_rest_route( $ns, '/account/addresses/(?P<type>billing|shipping)', array( 'methods' => 'POST', 'permission_callback' => $authed, 'callback' => 'majeurs_account_update_address' ) );
	register_rest_route( $ns, '/account/orders', array( 'methods' => 'GET', 'permission_callback' => $authed, 'callback' => 'majeurs_account_orders' ) );
	register_rest_route( $ns, '/account/orders/(?P<id>\d+)', array( 'methods' => 'GET', 'permission_callback' => $authed, 'callback' => 'majeurs_account_order' ) );
	register_rest_route( $ns, '/account/wishlist', array(
		array( 'methods' => 'GET', 'permission_callback' => $authed, 'callback' => 'majeurs_account_wishlist' ),
		array( 'methods' => 'POST', 'permission_callback' => $authed, 'callback' => 'majeurs_account_wishlist_add' ),
	) );
	register_rest_route( $ns, '/account/wishlist/(?P<id>\d+)', array( 'methods' => 'DELETE', 'permission_callback' => $authed, 'callback' => 'majeurs_account_wishlist_remove' ) );
	register_rest_route( $ns, '/comments', array( 'methods' => 'POST', 'permission_callback' => $public, 'callback' => 'majeurs_post_comment' ) );
} );

/* ---------- auth ---------- */

function majeurs_account_check_secret( WP_REST_Request $request ) {
	if ( ! defined( 'MAJEURS_HEADLESS_SECRET' ) || ! MAJEURS_HEADLESS_SECRET ) {
		return new WP_Error( 'majeurs_not_configured', 'Account access is not configured.', array( 'status' => 503 ) );
	}
	if ( ! hash_equals( MAJEURS_HEADLESS_SECRET, (string) $request->get_header( 'x-majeurs-secret' ) ) ) {
		return new WP_Error( 'majeurs_forbidden', 'Forbidden.', array( 'status' => 403 ) );
	}
	return true;
}

function majeurs_account_check_session( WP_REST_Request $request ) {
	$secret = majeurs_account_check_secret( $request );
	if ( true !== $secret ) {
		return $secret;
	}
	$user = majeurs_account_user_from_token( (string) $request->get_header( 'x-majeurs-session' ) );
	if ( ! $user ) {
		return new WP_Error( 'majeurs_signed_out', 'Please log in again.', array( 'status' => 401 ) );
	}
	wp_set_current_user( $user->ID );
	return true;
}

/** Token format: "<user id>.<random>". Only sha256(token) is stored, with its expiry. */
function majeurs_account_user_from_token( $token ) {
	if ( ! preg_match( '/^(\d+)\.[A-Za-z0-9]{40,}$/', $token, $m ) ) {
		return null;
	}
	$user = get_user_by( 'id', (int) $m[1] );
	if ( ! $user ) {
		return null;
	}
	$sessions = majeurs_account_sessions( $user->ID );
	$hash     = hash( 'sha256', $token );
	foreach ( $sessions as $stored => $expires ) {
		if ( hash_equals( (string) $stored, $hash ) && $expires > time() ) {
			return $user;
		}
	}
	return null;
}

/** Live sessions for a user, with expired ones dropped. */
function majeurs_account_sessions( $user_id ) {
	$sessions = get_user_meta( $user_id, MAJEURS_SESSION_META, true );
	$sessions = is_array( $sessions ) ? $sessions : array();
	return array_filter( $sessions, function ( $expires ) {
		return $expires > time();
	} );
}

function majeurs_account_issue_session( WP_User $user, $remember ) {
	$token    = $user->ID . '.' . wp_generate_password( 48, false, false );
	$expires  = time() + ( $remember ? 30 * DAY_IN_SECONDS : 2 * DAY_IN_SECONDS );
	$sessions = majeurs_account_sessions( $user->ID );
	$sessions[ hash( 'sha256', $token ) ] = $expires;
	// keep the 10 newest sessions (one per browser)
	arsort( $sessions );
	update_user_meta( $user->ID, MAJEURS_SESSION_META, array_slice( $sessions, 0, 10, true ) );

	return array( 'token' => $token, 'expires' => $expires, 'customer' => majeurs_account_customer( $user ) );
}

function majeurs_account_customer( WP_User $user ) {
	return array(
		'id'           => $user->ID,
		'email'        => $user->user_email,
		'first_name'   => $user->first_name,
		'last_name'    => $user->last_name,
		'display_name' => $user->display_name,
	);
}

/** 5 failed logins per username per 15 minutes */
function majeurs_account_throttled( $login ) {
	return (int) get_transient( 'majeurs_login_' . md5( strtolower( $login ) ) ) >= 5;
}

function majeurs_account_note_failure( $login ) {
	$key = 'majeurs_login_' . md5( strtolower( $login ) );
	set_transient( $key, (int) get_transient( $key ) + 1, 15 * MINUTE_IN_SECONDS );
}

/* ---------- sign in / out ---------- */

function majeurs_account_login( WP_REST_Request $request ) {
	$login    = trim( (string) $request->get_param( 'username' ) );
	$password = (string) $request->get_param( 'password' );

	if ( '' === $login || '' === $password ) {
		return new WP_Error( 'majeurs_invalid', 'Enter your username or email address and password.', array( 'status' => 400 ) );
	}
	if ( majeurs_account_throttled( $login ) ) {
		return new WP_Error( 'majeurs_throttled', 'Too many failed attempts. Please try again in 15 minutes, or reset your password.', array( 'status' => 429 ) );
	}

	$user = wp_authenticate( $login, $password );
	if ( is_wp_error( $user ) ) {
		majeurs_account_note_failure( $login );
		return new WP_Error( 'majeurs_bad_login', 'The username, email address or password is incorrect.', array( 'status' => 401 ) );
	}

	delete_transient( 'majeurs_login_' . md5( strtolower( $login ) ) );
	do_action( 'wp_login', $user->user_login, $user );
	return majeurs_account_issue_session( $user, (bool) $request->get_param( 'remember' ) );
}

function majeurs_account_register( WP_REST_Request $request ) {
	if ( 'yes' !== get_option( 'woocommerce_enable_myaccount_registration' ) ) {
		return new WP_Error( 'majeurs_closed', 'Registration is closed.', array( 'status' => 403 ) );
	}
	if ( 'yes' !== get_option( 'woocommerce_registration_generate_password' ) ) {
		return new WP_Error( 'majeurs_not_configured', 'Turn on "Send password setup link" in WooCommerce > Settings > Accounts & Privacy.', array( 'status' => 503 ) );
	}

	$email   = sanitize_email( (string) $request->get_param( 'email' ) );
	$user_id = wc_create_new_customer( $email, '', '', array( 'source' => 'majeurs-headless' ) );
	if ( is_wp_error( $user_id ) ) {
		return new WP_Error( 'majeurs_register_failed', wp_strip_all_tags( $user_id->get_error_message() ), array( 'status' => 400 ) );
	}

	return majeurs_account_issue_session( get_user_by( 'id', $user_id ), false );
}

function majeurs_account_logout( WP_REST_Request $request ) {
	$user_id  = get_current_user_id();
	$hash     = hash( 'sha256', (string) $request->get_header( 'x-majeurs-session' ) );
	$sessions = majeurs_account_sessions( $user_id );
	unset( $sessions[ $hash ] );
	update_user_meta( $user_id, MAJEURS_SESSION_META, $sessions );
	return array( 'ok' => true );
}

/** Always answers ok, so the form can't be used to find out which emails have accounts. */
function majeurs_account_lost_password( WP_REST_Request $request ) {
	$login = trim( (string) $request->get_param( 'login' ) );
	$user  = is_email( $login ) ? get_user_by( 'email', $login ) : get_user_by( 'login', $login );

	if ( $user ) {
		$key = get_password_reset_key( $user );
		if ( ! is_wp_error( $key ) ) {
			WC()->mailer(); // loads the WooCommerce emails, which send the "Reset password" email
			do_action( 'woocommerce_reset_password_notification', $user->user_login, $key );
		}
	}
	return array( 'ok' => true );
}

function majeurs_account_reset_password( WP_REST_Request $request ) {
	$id   = absint( $request->get_param( 'id' ) );
	$user = $id ? get_user_by( 'id', $id ) : get_user_by( 'login', (string) $request->get_param( 'login' ) );
	if ( ! $user ) {
		return new WP_Error( 'majeurs_bad_key', 'This password reset link is invalid or has expired. Please request a new one.', array( 'status' => 400 ) );
	}

	$checked = check_password_reset_key( (string) $request->get_param( 'key' ), $user->user_login );
	if ( is_wp_error( $checked ) ) {
		return new WP_Error( 'majeurs_bad_key', 'This password reset link is invalid or has expired. Please request a new one.', array( 'status' => 400 ) );
	}

	$password = (string) $request->get_param( 'password' );
	if ( strlen( $password ) < 8 ) {
		return new WP_Error( 'majeurs_weak_password', 'Use at least 8 characters.', array( 'status' => 400 ) );
	}

	reset_password( $user, $password );
	// a new password signs every browser out
	delete_user_meta( $user->ID, MAJEURS_SESSION_META );
	return array( 'ok' => true );
}

/* ---------- account details ---------- */

function majeurs_account_me() {
	return majeurs_account_customer( wp_get_current_user() );
}

function majeurs_account_update_me( WP_REST_Request $request ) {
	$user  = wp_get_current_user();
	$email = sanitize_email( (string) $request->get_param( 'email' ) );

	if ( ! is_email( $email ) ) {
		return new WP_Error( 'majeurs_invalid', 'Please enter a valid email address.', array( 'status' => 400 ) );
	}
	$owner = email_exists( $email );
	if ( $owner && $owner !== $user->ID ) {
		return new WP_Error( 'majeurs_invalid', 'This email address is already registered.', array( 'status' => 400 ) );
	}

	$update = array(
		'ID'           => $user->ID,
		'first_name'   => sanitize_text_field( (string) $request->get_param( 'first_name' ) ),
		'last_name'    => sanitize_text_field( (string) $request->get_param( 'last_name' ) ),
		'display_name' => sanitize_text_field( (string) $request->get_param( 'display_name' ) ),
		'user_email'   => $email,
	);

	$new_password = (string) $request->get_param( 'new_password' );
	if ( '' !== $new_password ) {
		if ( ! wp_check_password( (string) $request->get_param( 'current_password' ), $user->user_pass, $user->ID ) ) {
			return new WP_Error( 'majeurs_invalid', 'Your current password is incorrect.', array( 'status' => 400 ) );
		}
		if ( strlen( $new_password ) < 8 ) {
			return new WP_Error( 'majeurs_invalid', 'Use at least 8 characters for your new password.', array( 'status' => 400 ) );
		}
		$update['user_pass'] = $new_password;
	}

	$result = wp_update_user( $update );
	if ( is_wp_error( $result ) ) {
		return new WP_Error( 'majeurs_invalid', wp_strip_all_tags( $result->get_error_message() ), array( 'status' => 400 ) );
	}

	$customer = new WC_Customer( $user->ID );
	$customer->set_first_name( $update['first_name'] );
	$customer->set_last_name( $update['last_name'] );
	$customer->save();

	return majeurs_account_customer( get_user_by( 'id', $user->ID ) );
}

/* ---------- addresses ---------- */

defined( 'MAJEURS_ADDRESS_FIELDS' ) || define( 'MAJEURS_ADDRESS_FIELDS', array( 'first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'phone', 'email' ) );

function majeurs_account_address( WC_Customer $customer, $type ) {
	$address = array();
	foreach ( MAJEURS_ADDRESS_FIELDS as $field ) {
		$getter            = "get_{$type}_{$field}";
		$address[ $field ] = is_callable( array( $customer, $getter ) ) ? (string) $customer->$getter() : '';
	}
	return $address;
}

function majeurs_account_addresses() {
	$customer  = new WC_Customer( get_current_user_id() );
	$countries = WC()->countries;
	$allowed   = array_merge( $countries->get_allowed_countries(), $countries->get_shipping_countries() );
	$states    = array();
	foreach ( array_keys( $allowed ) as $code ) {
		$list = $countries->get_states( $code );
		if ( is_array( $list ) && $list ) {
			$states[ $code ] = array_map( 'html_entity_decode', $list );
		}
	}

	return array(
		'billing'   => majeurs_account_address( $customer, 'billing' ),
		'shipping'  => majeurs_account_address( $customer, 'shipping' ),
		'countries' => array_map( 'html_entity_decode', $allowed ),
		'states'    => $states,
	);
}

function majeurs_account_update_address( WP_REST_Request $request ) {
	$type     = $request->get_param( 'type' );
	$customer = new WC_Customer( get_current_user_id() );

	foreach ( MAJEURS_ADDRESS_FIELDS as $field ) {
		$setter = "set_{$type}_{$field}";
		if ( null === $request->get_param( $field ) || ! is_callable( array( $customer, $setter ) ) ) {
			continue;
		}
		$value = 'email' === $field ? sanitize_email( $request->get_param( $field ) ) : sanitize_text_field( $request->get_param( $field ) );
		$customer->$setter( $value );
	}
	$customer->save();

	return majeurs_account_address( $customer, $type );
}

/* ---------- orders ---------- */

/** "₦1,366,085.66" in the order's own currency, as plain text */
function majeurs_account_money( $amount, $currency ) {
	return html_entity_decode( wp_strip_all_tags( wc_price( $amount, array( 'currency' => $currency ) ) ) );
}

function majeurs_account_order_summary( WC_Order $order ) {
	return array(
		'id'           => $order->get_id(),
		'number'       => $order->get_order_number(),
		'date'         => $order->get_date_created() ? $order->get_date_created()->format( DATE_ATOM ) : null,
		'status'       => $order->get_status(),
		'status_label' => wc_get_order_status_name( $order->get_status() ),
		'total'        => majeurs_account_money( $order->get_total(), $order->get_currency() ),
		'item_count'   => $order->get_item_count(),
		'needs_payment' => $order->needs_payment(),
		'order_key'    => $order->get_order_key(),
	);
}

function majeurs_account_orders( WP_REST_Request $request ) {
	$result = wc_get_orders( array(
		'customer_id' => get_current_user_id(),
		'type'        => 'shop_order',
		'paginate'    => true,
		'limit'       => 10,
		'page'        => max( 1, absint( $request->get_param( 'page' ) ) ),
		'orderby'     => 'date',
		'order'       => 'DESC',
	) );

	return array(
		'orders' => array_map( 'majeurs_account_order_summary', $result->orders ),
		'total'  => (int) $result->total,
		'pages'  => (int) $result->max_num_pages,
	);
}

function majeurs_account_order( WP_REST_Request $request ) {
	$order = wc_get_order( absint( $request->get_param( 'id' ) ) );
	if ( ! $order || $order->get_customer_id() !== get_current_user_id() ) {
		return new WP_Error( 'majeurs_not_found', 'Order not found.', array( 'status' => 404 ) );
	}

	$currency = $order->get_currency();
	$items    = array();
	foreach ( $order->get_items() as $item ) {
		$product = $item->get_product();
		$meta    = array();
		foreach ( $item->get_formatted_meta_data() as $m ) {
			$meta[] = array( 'label' => wp_strip_all_tags( $m->display_key ), 'value' => trim( wp_strip_all_tags( $m->display_value ) ) );
		}
		$image_id = $product ? $product->get_image_id() : 0;
		$parent   = $product && $product->get_parent_id() ? wc_get_product( $product->get_parent_id() ) : $product;
		$items[]  = array(
			'name'     => $item->get_name(),
			'quantity' => $item->get_quantity(),
			'total'    => majeurs_account_money( $order->get_line_subtotal( $item ), $currency ),
			'meta'     => $meta,
			'slug'     => $parent ? $parent->get_slug() : null,
			'image'    => $image_id ? wp_get_attachment_image_url( $image_id, 'woocommerce_thumbnail' ) : null,
		);
	}

	$totals = array();
	foreach ( $order->get_order_item_totals() as $row ) {
		$totals[] = array( 'label' => rtrim( wp_strip_all_tags( $row['label'] ), ':' ), 'value' => trim( html_entity_decode( wp_strip_all_tags( $row['value'] ) ) ) );
	}

	$lines = function ( $html ) {
		return $html ? array_values( array_filter( array_map( 'trim', preg_split( '/<br\s*\/?>/i', $html ) ) ) ) : array();
	};

	return array_merge( majeurs_account_order_summary( $order ), array(
		'items'          => $items,
		'totals'         => $totals,
		'payment_method' => $order->get_payment_method_title(),
		'customer_note'  => $order->get_customer_note(),
		'billing'        => array_map( 'html_entity_decode', $lines( $order->get_formatted_billing_address() ) ),
		'shipping'       => array_map( 'html_entity_decode', $lines( $order->get_formatted_shipping_address() ) ),
		'email'          => $order->get_billing_email(),
		'phone'          => $order->get_billing_phone(),
	) );
}

/* ---------- wishlist ---------- */

defined( 'MAJEURS_WISHLIST_META' ) || define( 'MAJEURS_WISHLIST_META', '_majeurs_wishlist' );

/** Saved ids that are still published products (deleted or drafted ones drop out on read). */
function majeurs_account_wishlist_ids( $user_id ) {
	$ids = get_user_meta( $user_id, MAJEURS_WISHLIST_META, true );
	$ids = is_array( $ids ) ? array_map( 'absint', $ids ) : array();
	return array_values( array_filter( array_unique( $ids ), function ( $id ) {
		return 'product' === get_post_type( $id ) && 'publish' === get_post_status( $id );
	} ) );
}

function majeurs_account_wishlist_save( $user_id, array $ids ) {
	$ids = array_slice( array_values( array_unique( $ids ) ), -200 );
	update_user_meta( $user_id, MAJEURS_WISHLIST_META, $ids );
	return array( 'ids' => $ids );
}

function majeurs_account_wishlist() {
	return array( 'ids' => majeurs_account_wishlist_ids( get_current_user_id() ) );
}

function majeurs_account_wishlist_add( WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	$add     = array_map( 'absint', (array) $request->get_param( 'ids' ) );
	$add     = array_filter( array_slice( $add, 0, 200 ), function ( $id ) {
		return $id && 'product' === get_post_type( $id ) && 'publish' === get_post_status( $id );
	} );
	return majeurs_account_wishlist_save( $user_id, array_merge( majeurs_account_wishlist_ids( $user_id ), $add ) );
}

function majeurs_account_wishlist_remove( WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	$remove  = absint( $request['id'] );
	return majeurs_account_wishlist_save( $user_id, array_filter( majeurs_account_wishlist_ids( $user_id ), function ( $id ) use ( $remove ) {
		return $id !== $remove;
	} ) );
}

/* ---------- blog comments ---------- */

function majeurs_post_comment( WP_REST_Request $request ) {
	$user = majeurs_account_user_from_token( (string) $request->get_header( 'x-majeurs-session' ) );
	if ( $user ) {
		wp_set_current_user( $user->ID );
	}

	// the request comes from the Next.js server; flood checks and Akismet need the visitor's address
	$ip = (string) $request->get_header( 'x-majeurs-client-ip' );
	if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
		$_SERVER['REMOTE_ADDR'] = $ip;
	}

	$comment = wp_handle_comment_submission( wp_unslash( array(
		'comment_post_ID' => absint( $request->get_param( 'post' ) ),
		'comment_parent'  => absint( $request->get_param( 'parent' ) ),
		'comment'         => (string) $request->get_param( 'comment' ),
		'author'          => (string) $request->get_param( 'author' ),
		'email'           => (string) $request->get_param( 'email' ),
		'url'             => '',
	) ) );

	if ( is_wp_error( $comment ) ) {
		$data   = $comment->get_error_data();
		$status = is_numeric( $data ) ? (int) $data : 400;
		return new WP_Error( 'majeurs_comment_failed', wp_strip_all_tags( $comment->get_error_message() ), array( 'status' => $status ) );
	}

	return array( 'id' => (int) $comment->comment_ID, 'approved' => '1' === (string) $comment->comment_approved );
}
