<?php
/**
 * Majeurs headless: enquiry form submissions
 *
 * Install: WP admin > Snippets > Add New > paste this file (without the opening <?php tag),
 * "Run snippet everywhere", Activate. Needs MAJEURS_HEADLESS_SECRET in wp-config.php (see majeurs-account.php).
 *
 * Replaces the Elementor forms on Plan a Visitation, Custom Request, Get a Quote, Furniture Repair and the
 * Trade Program. Each submission is kept as an "Enquiry" in wp-admin (left menu) and emailed.
 *
 *   POST /wp-json/majeurs/v1/forms/<form>
 *   { "title": "Get a quote", "fields": [ { "label": "First name", "value": "Ada" }, … ],
 *     "reply_to": "ada@example.com", "name": "Ada Obi", "attachments": [ 123, 124 ], "page": "https://majeurs.com/…" }
 *   -> { "ok": true, "id": 456 }
 *
 * Files are uploaded to the media library by the Next.js server first (lib/api/media.ts); only their ids come here.
 *
 * Recipients: the site admin email by default. To send a form elsewhere, add to wp-config.php, e.g.
 *   define( 'MAJEURS_FORM_RECIPIENTS', array( 'trade-program' => 'trade@majeurs.com', '*' => 'hello@majeurs.com' ) );
 */

add_action( 'init', function () {
	register_post_type( 'majeurs_enquiry', array(
		'labels'          => array( 'name' => 'Enquiries', 'singular_name' => 'Enquiry' ),
		'public'          => false,
		'show_ui'         => true,
		'show_in_menu'    => true,
		'menu_icon'       => 'dashicons-email-alt',
		'supports'        => array( 'title', 'editor' ),
		'capability_type' => 'post',
		'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
		'map_meta_cap'    => true,
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'majeurs/v1', '/forms/(?P<form>[a-z0-9-]+)', array(
		'methods'             => 'POST',
		'permission_callback' => function ( WP_REST_Request $request ) {
			if ( ! defined( 'MAJEURS_HEADLESS_SECRET' ) || ! MAJEURS_HEADLESS_SECRET ) {
				return new WP_Error( 'majeurs_not_configured', 'Forms are not configured.', array( 'status' => 503 ) );
			}
			return hash_equals( MAJEURS_HEADLESS_SECRET, (string) $request->get_header( 'x-majeurs-secret' ) )
				? true
				: new WP_Error( 'majeurs_forbidden', 'Forbidden.', array( 'status' => 403 ) );
		},
		'callback'            => 'majeurs_form_submit',
	) );
} );

function majeurs_form_submit( WP_REST_Request $request ) {
	$form   = $request->get_param( 'form' );
	$title  = sanitize_text_field( (string) $request->get_param( 'title' ) );
	$name   = sanitize_text_field( (string) $request->get_param( 'name' ) );
	$reply  = sanitize_email( (string) $request->get_param( 'reply_to' ) );
	$page   = esc_url_raw( (string) $request->get_param( 'page' ) );
	$fields = (array) $request->get_param( 'fields' );
	$files  = array_filter( array_map( 'absint', (array) $request->get_param( 'attachments' ) ) );

	$rows = array();
	foreach ( $fields as $field ) {
		$label = sanitize_text_field( $field['label'] ?? '' );
		$value = sanitize_textarea_field( $field['value'] ?? '' );
		if ( '' !== $label && '' !== $value ) {
			$rows[] = array( $label, $value );
		}
	}
	if ( ! $rows ) {
		return new WP_Error( 'majeurs_empty', 'The form is empty.', array( 'status' => 400 ) );
	}

	$links = array();
	foreach ( $files as $id ) {
		$url = wp_get_attachment_url( $id );
		if ( $url ) {
			$links[] = $url;
		}
	}

	$html = '<table>';
	foreach ( $rows as $row ) {
		$html .= '<tr><th style="text-align:left;padding:4px 12px 4px 0;vertical-align:top">' . esc_html( $row[0] ) . '</th><td style="padding:4px 0">' . nl2br( esc_html( $row[1] ) ) . '</td></tr>';
	}
	foreach ( $links as $i => $url ) {
		$html .= '<tr><th style="text-align:left;padding:4px 12px 4px 0">Attachment ' . ( $i + 1 ) . '</th><td><a href="' . esc_url( $url ) . '">' . esc_html( basename( $url ) ) . '</a></td></tr>';
	}
	$html .= '</table>';
	if ( $page ) {
		$html .= '<p>Sent from <a href="' . esc_url( $page ) . '">' . esc_html( $page ) . '</a></p>';
	}

	$post_id = wp_insert_post( array(
		'post_type'    => 'majeurs_enquiry',
		'post_status'  => 'private',
		'post_title'   => trim( $title . ' – ' . ( $name ?: $reply ) ),
		'post_content' => $html,
		'meta_input'   => array( '_majeurs_form' => $form, '_majeurs_fields' => wp_json_encode( $rows ), '_majeurs_reply_to' => $reply ),
	), true );
	if ( is_wp_error( $post_id ) ) {
		return new WP_Error( 'majeurs_save_failed', 'The enquiry could not be saved.', array( 'status' => 500 ) );
	}
	foreach ( $files as $id ) {
		wp_update_post( array( 'ID' => $id, 'post_parent' => $post_id ) );
	}

	$recipients = defined( 'MAJEURS_FORM_RECIPIENTS' ) ? (array) MAJEURS_FORM_RECIPIENTS : array();
	$to         = $recipients[ $form ] ?? $recipients['*'] ?? get_option( 'admin_email' );
	$headers    = array( 'Content-Type: text/html; charset=UTF-8' );
	if ( $reply ) {
		$headers[] = 'Reply-To: ' . ( $name ? $name . ' <' . $reply . '>' : $reply );
	}
	wp_mail( $to, 'New enquiry: ' . get_the_title( $post_id ), $html, $headers );

	return array( 'ok' => true, 'id' => $post_id );
}
