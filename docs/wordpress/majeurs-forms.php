<?php
/**
 * Majeurs headless: enquiry form submissions
 *
 * Replaces the Elementor forms (visitation, custom request, quote, repair, trade program, catalogue, waitlist,
 * contact, complaint, job application). Each submission is kept as an "Enquiry" in wp-admin (left menu),
 * emailed, and added to Mailchimp.
 *
 *   POST /wp-json/majeurs/v1/forms/<form>
 *   { "title": "Get a quote", "fields": [ { "key": "first_name", "label": "First name", "value": "Ada" }, … ],
 *     "reply_to": "ada@example.com", "name": "Ada Obi", "subscribe": false,
 *     "attachments": [ 123, 124 ], "page": "https://majeurs.com/…" }
 *   -> { "ok": true, "id": 456,
 *        "success": { "mode": "message" | "redirect", "message": "Thank you! …", "redirect": "/thank-you/quote/" | null } }
 *
 * "success" is what the website does after a submit: show the message in a pop-up and reset the form, or go to
 * the thank-you page (a site-relative path, so analytics can count conversions by URL).
 *
 * Files are uploaded to the media library by the Next.js server first (lib/api/media.ts); only their ids come here.
 *
 * wp-admin screens (left menu "Enquiries"):
 *   All enquiries   every submission (the post list), with Form and Mailchimp columns.
 *   <one per form>  e.g. "Get a quote", with tabs:
 *     Submissions         that form's enquiries with search, date range and pages, exported as CSV, Excel or PDF
 *                         (the current search and dates, all pages). Anyone who can read private posts.
 *     Notification email  who gets the email, its subject and body (placeholders like {name} and {fields}),
 *                         a test email and reset to default. Admins only, like the tabs below.
 *     Mailchimp           the tags the person gets and which form field fills each Mailchimp audience field.
 *     After submit        pop-up message and form reset, or a thank-you page.
 *   Settings        the Mailchimp connection and audience, and the "Any other form" fallback recipients and tags.
 *
 * Stored per enquiry: _majeurs_form, _majeurs_values (JSON key => value), _majeurs_fields (JSON [label, value]),
 * _majeurs_name, _majeurs_reply_to, _majeurs_page, _majeurs_attachments (JSON ids), _majeurs_subscribe,
 * _majeurs_mailchimp. Enquiries from before _majeurs_values are read from their saved table by label.
 * Settings: the majeurs_forms option, per form { recipients, tags, map?, subject?, body?, success_mode?,
 * success_message?, success_path? }; a missing key means the default.
 *
 * Mailchimp connection: uses the API key of the Mailchimp for WooCommerce plugin, else Elementor's
 * (Elementor > Settings > Integrations). To use another key, add to wp-config.php:
 *   define( 'MAJEURS_MAILCHIMP_API_KEY', 'xxxxxxxx-us21' );
 * Every contact from a form with tags is added to the audience as a non-subscribed ("transactional") contact
 * with those tags. Only people who tick "Keep me updated" are subscribed. Someone who unsubscribed before
 * gets Mailchimp's confirmation email instead (Mailchimp won't re-subscribe them directly). A field value
 * Mailchimp rejects (e.g. a phone number in the wrong format) is left out and the contact is still added.
 * The result is shown in the Mailchimp column of the Enquiries list.
 */

/**
 * Form slug (the Next.js EnquiryId) => [ name, fields ]. Fields mirror `labels` in lib/forms/enquiries.ts;
 * fields added there later are picked up from the first submission that has them.
 */
function majeurs_forms_list() {
	$contact = array( 'first_name' => 'First name', 'last_name' => 'Last name', 'email' => 'Email', 'phone' => 'Phone' );
	return array(
		'plan-a-visitation' => array( 'Plan a visitation', $contact + array( 'business_name' => 'Business name', 'location' => 'Location', 'reason' => 'Reason', 'date' => 'Date', 'time' => 'Time', 'message' => 'Message' ) ),
		'custom-request'    => array( 'Custom furniture request', $contact + array( 'location' => 'Location', 'project_type' => 'Project type', 'budget' => 'Estimated budget', 'urgency' => 'How soon', 'furniture_type' => 'Furniture type(s)', 'message' => 'Message' ) ),
		'quote'             => array( 'Get a quote', $contact + array( 'business_name' => 'Business name', 'location' => 'Location', 'role' => 'Professional role', 'project_for' => 'Project is for', 'need' => 'What they need', 'scope' => 'How much', 'delivery' => 'Delivery', 'budget' => 'Investment range', 'timeline' => 'Needed by', 'stage' => 'Stage', 'decision_maker' => 'Decision-maker', 'message' => 'Message' ) ),
		'furniture-repair'  => array( 'Furniture repair', $contact + array( 'location' => 'Location', 'furniture_type' => 'Furniture type(s)', 'project_type' => 'Project type', 'urgency' => 'How soon', 'message' => 'Message' ) ),
		'trade-program'     => array( 'Trade Program application', array( 'first_name' => 'First name', 'last_name' => 'Last name', 'work_email' => 'Work email', 'phone' => 'Phone', 'company' => 'Company', 'location' => 'Location', 'industry' => 'Business industry', 'project_types' => 'Project types', 'heard_about' => 'Heard about Majeurs' ) ),
		'catalogue-request' => array( 'Catalogue download', $contact + array( 'role' => 'Professional role', 'catalogue' => 'Catalogue' ) ),
		'waitlist'          => array( 'Roots and Reverence waitlist', $contact + array( 'piece' => 'Preferred piece' ) ),
		'contact'           => array( 'Contact', $contact + array( 'department' => 'Department', 'subject' => 'Subject', 'message' => 'Message' ) ),
		'complaint'         => array( 'Complaint or feedback', $contact + array( 'company_name' => 'Company', 'address' => 'Address', 'product_name' => 'Product', 'invoice_number' => 'Order / invoice number', 'purchase_date' => 'Date of purchase / service', 'delivery_location' => 'Delivery location', 'feedback_type' => 'Type of feedback', 'description' => 'Description', 'expected_resolution' => 'Expected resolution' ) ),
		'job-application'   => array( 'Job application', $contact + array( 'role' => 'Role', 'portfolio' => 'Portfolio' ) ),
		'*'                 => array( 'Any other form', array() ),
	);
}

/** The form's fields (key => label): the list above plus any seen in submissions */
function majeurs_forms_fields( $form ) {
	$seen = (array) get_option( 'majeurs_forms_seen', array() );
	return ( majeurs_forms_list()[ $form ][1] ?? array() ) + ( $seen[ $form ] ?? array() );
}

/** Used until a form's settings are first saved. No "map" = guessed from the audience's field names. */
function majeurs_forms_defaults() {
	$team = "customerservice@majeursholdings.com\nleadgen@majeursholdings.com\ndemi@majeursholdings.com\necommerce@majeursholdings.com";
	return array(
		'plan-a-visitation' => array( 'recipients' => $team, 'tags' => 'Website form, Plan a visitation' ),
		'custom-request'    => array( 'recipients' => $team, 'tags' => 'Website form, Custom request' ),
		'quote'             => array( 'recipients' => $team, 'tags' => 'Website form, Quote' ),
		'furniture-repair'  => array( 'recipients' => $team, 'tags' => 'Website form, Furniture repair' ),
		'trade-program'     => array( 'recipients' => $team, 'tags' => 'Website form, Trade Program' ),
		'catalogue-request' => array( 'recipients' => $team, 'tags' => 'Website form, Catalogue download' ),
		'waitlist'          => array( 'recipients' => $team, 'tags' => 'Website form, Roots and Reverence waitlist' ),
		'contact'           => array( 'recipients' => $team, 'tags' => 'Website form, Contact' ),
		'complaint'         => array( 'recipients' => $team, 'tags' => '' ),
		'job-application'   => array( 'recipients' => 'hire@majeursholdings.com', 'tags' => '' ),
		'*'                 => array( 'recipients' => $team, 'tags' => '' ),
	);
}

/** Saved settings over the defaults, per form, so a form saved from one tab keeps the defaults of the others */
function majeurs_forms_settings() {
	$saved    = get_option( 'majeurs_forms' );
	$saved    = is_array( $saved ) ? $saved : array();
	$settings = array();
	foreach ( majeurs_forms_defaults() as $form => $row ) {
		$settings[ $form ] = (array) ( $saved[ $form ] ?? array() ) + $row;
	}
	return $settings + $saved;
}

/** Merges one form's keys into the majeurs_forms option; a null value removes the key (back to the default) */
function majeurs_forms_update( $form, array $keys ) {
	$saved = get_option( 'majeurs_forms' );
	$saved = is_array( $saved ) ? $saved : array();
	$row   = (array) ( $saved[ $form ] ?? array() );
	foreach ( $keys as $key => $value ) {
		if ( null === $value ) {
			unset( $row[ $key ] );
		} else {
			$row[ $key ] = $value;
		}
	}
	$saved[ $form ] = $row;
	update_option( 'majeurs_forms', $saved );
}

function majeurs_forms_emails( $text ) {
	$emails = array_filter( array_map( 'sanitize_email', preg_split( '/[\s,;]+/', (string) $text ) ), 'is_email' );
	return array_values( array_unique( $emails ) );
}

function majeurs_forms_tags( $text ) {
	return array_values( array_unique( array_filter( array_map( 'sanitize_text_field', explode( ',', (string) $text ) ) ) ) );
}

/** Recipients (falling back to "Any other form", then the site admin), Mailchimp tags and field map for a form */
function majeurs_form_config( $form ) {
	$settings = majeurs_forms_settings();
	$row      = $settings[ $form ] ?? $settings['*'];
	$to       = majeurs_forms_emails( $row['recipients'] ?? '' ) ?: majeurs_forms_emails( $settings['*']['recipients'] ?? '' );
	return array(
		'to'   => $to ?: array( get_option( 'admin_email' ) ),
		'tags' => majeurs_forms_tags( $row['tags'] ?? '' ),
		'map'  => isset( $row['map'] ) ? (array) $row['map'] : majeurs_mailchimp_guess( $form, majeurs_mailchimp_merge_fields() ),
	);
}

/** What the website does after a submit, until "After submit" is saved. Messages mirror successMessage in lib/forms/enquiries.ts. */
function majeurs_forms_success_defaults( $form ) {
	$messages = array(
		'plan-a-visitation' => "Thank you! We'll confirm your visit shortly.",
		'custom-request'    => 'Thank you! Our design team will be in touch within 24 hours.',
		'quote'             => 'Thank you! Your quote request has been received.',
		'furniture-repair'  => 'Thank you! Our sofa fixers will be in touch shortly.',
		'trade-program'     => 'Thank you! Your application has been received.',
		'catalogue-request' => 'Thank you! Your catalogue is ready to download.',
		'waitlist'          => "You're on the waitlist. We'll email you when it's your turn.",
		'contact'           => "Thank you! We'll get back to you shortly.",
		'complaint'         => 'Thank you for your feedback. Our customer service team will be in touch.',
		'job-application'   => "Thank you! Your application has been received. We'll be in touch if you're shortlisted.",
	);
	$pages    = array(
		'quote'         => '/get-a-quote-for-custom-made-furniture-in-lagos/quote-request-received/',
		'trade-program' => '/majeurs-trade-program/majeurs-trade-program-registration-completed/',
	);
	return array(
		'mode'    => isset( $pages[ $form ] ) ? 'redirect' : 'message',
		'message' => $messages[ $form ] ?? '', // empty: the website uses its own
		'path'    => $pages[ $form ] ?? '/thank-you/' . $form . '/',
	);
}

/** A site-relative path: starts with one "/" (not "//" or "/\"), no spaces, URL characters only */
function majeurs_forms_valid_path( $path ) {
	return is_string( $path ) && 1 === preg_match( '#^/(?![/\\\\])[A-Za-z0-9\-._~!$&\'()*+,;=:@/%?\#]*$#', $path );
}

/** The "success" object of the REST response */
function majeurs_forms_success( $form ) {
	$row      = majeurs_forms_settings()[ $form ] ?? array();
	$defaults = majeurs_forms_success_defaults( $form );
	$mode     = in_array( $row['success_mode'] ?? '', array( 'message', 'redirect' ), true ) ? $row['success_mode'] : $defaults['mode'];
	$message  = trim( (string) ( $row['success_message'] ?? '' ) );
	$path     = (string) ( $row['success_path'] ?? '' );
	return array(
		'mode'     => $mode,
		'message'  => '' !== $message ? $message : $defaults['message'],
		'redirect' => 'redirect' === $mode ? ( majeurs_forms_valid_path( $path ) ? $path : $defaults['path'] ) : null,
	);
}

add_action( 'init', function () {
	register_post_type( 'majeurs_enquiry', array(
		'labels'          => array( 'name' => 'Enquiries', 'singular_name' => 'Enquiry', 'all_items' => 'All enquiries', 'menu_name' => 'Enquiries' ),
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
	$form      = $request->get_param( 'form' );
	$title     = sanitize_text_field( (string) $request->get_param( 'title' ) );
	$name      = sanitize_text_field( (string) $request->get_param( 'name' ) );
	$reply     = sanitize_email( (string) $request->get_param( 'reply_to' ) );
	$subscribe = true === $request->get_param( 'subscribe' );
	$page      = esc_url_raw( (string) $request->get_param( 'page' ) );
	$fields    = (array) $request->get_param( 'fields' );
	$files     = array_values( array_filter( array_map( 'absint', (array) $request->get_param( 'attachments' ) ) ) );

	$rows   = array();
	$values = array(); // field key => value, for the Mailchimp field map, the email and the Submissions table
	$labels = array();
	foreach ( $fields as $field ) {
		$key   = sanitize_key( $field['key'] ?? '' );
		$label = sanitize_text_field( $field['label'] ?? '' );
		$value = sanitize_textarea_field( $field['value'] ?? '' );
		if ( '' !== $label && '' !== $value ) {
			$rows[] = array( $label, $value );
			if ( '' !== $key ) {
				$values[ $key ] = $value;
				$labels[ $key ] = $label;
			}
		}
	}
	if ( ! $rows ) {
		return new WP_Error( 'majeurs_empty', 'The form is empty.', array( 'status' => 400 ) );
	}
	if ( $subscribe ) {
		$rows[] = array( 'Marketing emails', 'Yes, keep me updated' );
	}

	// remember fields the settings page doesn't list yet, so they can be mapped and exported
	$new = isset( majeurs_forms_list()[ $form ] ) ? array_diff_key( $labels, majeurs_forms_fields( $form ) ) : array();
	if ( $new ) {
		$seen          = (array) get_option( 'majeurs_forms_seen', array() );
		$seen[ $form ] = ( $seen[ $form ] ?? array() ) + $new;
		update_option( 'majeurs_forms_seen', $seen, false );
	}

	$links = array();
	foreach ( $files as $id ) {
		$url = wp_get_attachment_url( $id );
		if ( $url ) {
			$links[] = $url;
		}
	}

	// the enquiry's own page keeps the plain table (older enquiries are read back from it)
	$html = majeurs_forms_table( $rows, $links );
	if ( $page ) {
		$html .= '<p>Sent from <a href="' . esc_url( $page ) . '">' . esc_html( $page ) . '</a></p>';
	}

	// meta is unslashed on save, so JSON (and anything with a backslash) is slashed first
	$json    = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
	$post_id = wp_insert_post( array(
		'post_type'    => 'majeurs_enquiry',
		'post_status'  => 'private',
		'post_title'   => trim( $title . ' – ' . ( $name ?: $reply ) ),
		'post_content' => $html,
		'meta_input'   => array(
			'_majeurs_form'        => $form,
			'_majeurs_fields'      => wp_slash( wp_json_encode( $rows, $json ) ),
			'_majeurs_values'      => wp_slash( wp_json_encode( (object) $values, $json ) ),
			'_majeurs_name'        => wp_slash( $name ),
			'_majeurs_reply_to'    => $reply,
			'_majeurs_page'        => wp_slash( $page ),
			'_majeurs_attachments' => wp_json_encode( $files ),
			'_majeurs_subscribe'   => $subscribe ? 'yes' : 'no',
		),
	), true );
	if ( is_wp_error( $post_id ) ) {
		return new WP_Error( 'majeurs_save_failed', 'The enquiry could not be saved.', array( 'status' => 500 ) );
	}
	foreach ( $files as $id ) {
		wp_update_post( array( 'ID' => $id, 'post_parent' => $post_id ) );
	}
	delete_transient( 'majeurs_forms_counts' );

	$config  = majeurs_form_config( $form );
	$headers = array( 'Content-Type: text/html; charset=UTF-8' );
	if ( $reply ) {
		$headers[] = 'Reply-To: ' . ( $name ? $name . ' <' . $reply . '>' : $reply );
	}
	list( $subject, $body ) = majeurs_forms_email( $form, array(
		'form'   => $title ?: ( majeurs_forms_list()[ $form ][0] ?? $form ),
		'name'   => $name ?: $reply,
		'email'  => $reply,
		'date'   => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ) ),
		'page'   => $page,
		'rows'   => $rows,
		'values' => $values,
		'links'  => $links,
	) );
	wp_mail( $config['to'], $subject, $body, $headers );

	$merge = array();
	foreach ( $config['map'] as $tag => $key ) {
		if ( isset( $values[ $key ] ) ) {
			$merge[ $tag ] = $values[ $key ];
		}
	}

	// the enquiry is already saved and emailed, so a Mailchimp failure is logged, not returned
	$mailchimp = majeurs_mailchimp_sync( $reply, $merge, $config['tags'], $subscribe );
	update_post_meta( $post_id, '_majeurs_mailchimp', $mailchimp );
	if ( 0 === strpos( $mailchimp, 'Failed' ) ) {
		error_log( "Majeurs form {$form} (enquiry {$post_id}): Mailchimp {$mailchimp}" );
	}

	return array( 'ok' => true, 'id' => $post_id, 'success' => majeurs_forms_success( $form ) );
}

/* ---------- Notification email ---------- */

function majeurs_forms_default_subject() {
	return 'New enquiry: {form} – {name}';
}

function majeurs_forms_default_body() {
	return "<p>New enquiry from the <strong>{form}</strong> form, {date}.</p>\n<div>{fields}</div>\n<div>{attachments}</div>\n<p>Sent from {page}</p>";
}

/** The answers as an email-friendly table; every value is escaped (visitor data) */
function majeurs_forms_table( array $rows, array $links = array() ) {
	if ( ! $rows && ! $links ) {
		return '';
	}
	$html = '<table>';
	foreach ( $rows as $row ) {
		$html .= '<tr><th style="text-align:left;padding:4px 12px 4px 0;vertical-align:top">' . esc_html( $row[0] ) . '</th><td style="padding:4px 0">' . nl2br( esc_html( $row[1] ) ) . '</td></tr>';
	}
	foreach ( $links as $i => $url ) {
		$html .= '<tr><th style="text-align:left;padding:4px 12px 4px 0">Attachment ' . ( $i + 1 ) . '</th><td><a href="' . esc_url( $url ) . '">' . esc_html( basename( $url ) ) . '</a></td></tr>';
	}
	return $html . '</table>';
}

/** Fills the placeholders in one pass, so a visitor typing "{fields}" stays text. $html = false for the subject. */
function majeurs_forms_fill( $template, array $data, $html ) {
	if ( $html ) {
		// the visual editor puts placeholders in <p> (sometimes both in one); a table can't sit inside a <p>, so any
		// paragraph holding {fields} or {attachments} becomes a <div>
		$template = preg_replace( '#<p(\s[^>]*)?>((?:(?!</p>).)*?\{(?:fields|attachments)\}(?:(?!</p>).)*?)</p>#s', '<div$1>$2</div>', $template );
	}
	return preg_replace_callback( '/\{(form|name|email|date|page|fields|attachments|field:([a-z0-9_-]+))\}/', function ( $m ) use ( $data, $html ) {
		if ( ! empty( $m[2] ) ) {
			$value = (string) ( $data['values'][ $m[2] ] ?? '' );
			return $html ? nl2br( esc_html( $value ) ) : $value;
		}
		switch ( $m[1] ) {
			case 'fields':
				return $html ? majeurs_forms_table( $data['rows'] ) : '';
			case 'attachments':
				return $html ? majeurs_forms_table( array(), $data['links'] ) : '';
			case 'page':
				if ( ! $html ) {
					return (string) $data['page'];
				}
				return $data['page'] ? '<a href="' . esc_url( $data['page'] ) . '">' . esc_html( $data['page'] ) . '</a>' : 'the website';
			default:
				return $html ? esc_html( (string) $data[ $m[1] ] ) : (string) $data[ $m[1] ];
		}
	}, $template );
}

/**
 * [ subject, HTML body ] from the form's templates (or the defaults).
 * $data: form, name, email, date, page, rows ([label, value]), values (key => value), links (attachment URLs).
 */
function majeurs_forms_email( $form, array $data ) {
	$settings = majeurs_forms_settings();
	$row      = $settings[ $form ] ?? $settings['*'];
	$subject  = trim( (string) ( $row['subject'] ?? '' ) ) ?: majeurs_forms_default_subject();
	$body     = trim( (string) ( $row['body'] ?? '' ) ) ?: majeurs_forms_default_body();
	$subject  = trim( preg_replace( '/\s+/', ' ', majeurs_forms_fill( $subject, $data, false ) ) );
	return array( $subject, majeurs_forms_fill( $body, $data, true ) );
}

/** Made-up answers for the test email */
function majeurs_forms_sample( $form ) {
	$samples = array(
		'first_name' => 'Ada',
		'last_name'  => 'Obi',
		'email'      => 'ada@example.com',
		'work_email' => 'ada@example.com',
		'phone'      => '+234 800 000 0000',
		'message'    => "This is a sample message.\nIt has two lines.",
	);
	$rows    = array();
	$values  = array();
	foreach ( majeurs_forms_fields( $form ) as $key => $label ) {
		$values[ $key ] = $samples[ $key ] ?? 'Sample ' . strtolower( $label );
		$rows[]         = array( $label, $values[ $key ] );
	}
	return array(
		'form'   => majeurs_forms_list()[ $form ][0] ?? $form,
		'name'   => 'Ada Obi',
		'email'  => 'ada@example.com',
		'date'   => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ) ),
		'page'   => home_url( '/' ),
		'rows'   => $rows,
		'values' => $values,
		'links'  => array(),
	);
}

/* ---------- Mailchimp ---------- */

/** wp-config constant, else the Mailchimp for WooCommerce plugin's key, else Elementor's */
function majeurs_mailchimp_key() {
	if ( defined( 'MAJEURS_MAILCHIMP_API_KEY' ) && MAJEURS_MAILCHIMP_API_KEY ) {
		return array( MAJEURS_MAILCHIMP_API_KEY, 'wp-config.php' );
	}
	$woo = get_option( 'mailchimp-woocommerce' );
	if ( is_array( $woo ) && ! empty( $woo['mailchimp_api_key'] ) ) {
		return array( $woo['mailchimp_api_key'], 'Mailchimp for WooCommerce' );
	}
	$elementor = get_option( 'elementor_pro_mailchimp_api_key' );
	return $elementor ? array( $elementor, 'Elementor integrations' ) : array( '', '' );
}

/** Chosen on the settings page, else the Mailchimp for WooCommerce plugin's audience */
function majeurs_mailchimp_audience() {
	$saved = get_option( 'majeurs_mailchimp_audience' );
	if ( $saved ) {
		return $saved;
	}
	$woo = get_option( 'mailchimp-woocommerce' );
	return is_array( $woo ) ? (string) ( $woo['mailchimp_list'] ?? '' ) : '';
}

function majeurs_mailchimp_ready() {
	return majeurs_mailchimp_key()[0] && majeurs_mailchimp_audience();
}

/** Returns [ status code (0 = no response), decoded body ] */
function majeurs_mailchimp( $method, $path, $body = null ) {
	$key = majeurs_mailchimp_key()[0];
	$dc  = substr( (string) strrchr( $key, '-' ), 1 ); // API keys end in their data centre, e.g. "-us21"
	$auth = 'Basic ' . base64_encode( 'majeurs:' . $key );
	if ( ! $dc ) {
		// an OAuth token without the suffix: ask Mailchimp which data centre it belongs to
		$auth = 'OAuth ' . $key;
		$dc   = get_transient( 'majeurs_mc_dc_' . md5( $key ) );
		if ( ! $dc ) {
			$meta = json_decode( wp_remote_retrieve_body( wp_remote_get( 'https://login.mailchimp.com/oauth2/metadata', array( 'timeout' => 10, 'headers' => array( 'Authorization' => $auth ) ) ) ), true );
			$dc   = $meta['dc'] ?? '';
			if ( ! $dc ) {
				return array( 0, array( 'detail' => 'Could not find the Mailchimp data centre for this API key.' ) );
			}
			set_transient( 'majeurs_mc_dc_' . md5( $key ), $dc, WEEK_IN_SECONDS );
		}
	}
	$res = wp_remote_request( "https://{$dc}.api.mailchimp.com/3.0/{$path}", array(
		'method'  => $method,
		'timeout' => 10,
		'headers' => array( 'Authorization' => $auth, 'Content-Type' => 'application/json' ),
		'body'    => null === $body ? null : wp_json_encode( $body ),
	) );
	if ( is_wp_error( $res ) ) {
		return array( 0, array( 'detail' => $res->get_error_message() ) );
	}
	return array( (int) wp_remote_retrieve_response_code( $res ), json_decode( wp_remote_retrieve_body( $res ), true ) );
}

/** The audience's fields (tag => name), e.g. [ 'FNAME' => 'First Name', 'PHONE' => 'Phone Number' ]. Cached 12 hours. */
function majeurs_mailchimp_merge_fields( $fresh = false ) {
	if ( ! majeurs_mailchimp_ready() ) {
		return array();
	}
	$audience = majeurs_mailchimp_audience();
	$cached   = $fresh ? false : get_transient( 'majeurs_mc_fields_' . $audience );
	if ( is_array( $cached ) ) {
		return $cached;
	}
	list( $code, $data ) = majeurs_mailchimp( 'GET', "lists/{$audience}/merge-fields?count=100&fields=merge_fields.tag,merge_fields.name" );
	if ( 200 !== $code ) {
		return array();
	}
	$fields = array();
	foreach ( $data['merge_fields'] ?? array() as $field ) {
		$fields[ $field['tag'] ] = $field['name'];
	}
	set_transient( 'majeurs_mc_fields_' . $audience, $fields, 12 * HOUR_IN_SECONDS );
	return $fields;
}

/** Default field map: matches each audience field's name to a form field, e.g. "Phone Number" -> phone */
function majeurs_mailchimp_guess( $form, array $merge_fields ) {
	$rules  = array(
		'first'    => array( 'first_name' ),
		'last'     => array( 'last_name' ),
		'phone'    => array( 'phone' ),
		'company'  => array( 'business_name', 'company', 'company_name' ),
		'business' => array( 'business_name', 'company', 'company_name' ),
		'industry' => array( 'industry', 'role' ),
		'role'     => array( 'role', 'industry' ),
		'address'  => array( 'location', 'address' ),
		'location' => array( 'location', 'address' ),
	);
	$fields = majeurs_forms_fields( $form );
	$map    = array();
	foreach ( $merge_fields as $tag => $name ) {
		$haystack = strtolower( $tag . ' ' . $name );
		foreach ( $rules as $word => $candidates ) {
			if ( false === strpos( $haystack, $word ) ) {
				continue;
			}
			foreach ( $candidates as $key ) {
				if ( isset( $fields[ $key ] ) ) {
					$map[ $tag ] = $key;
					continue 3;
				}
			}
		}
	}
	return $map;
}

/** The audience fields Mailchimp rejected in a 400 response, so the contact can be saved without them */
function majeurs_mailchimp_rejected( $code, $data, array $merge ) {
	if ( 400 !== $code || ! $merge ) {
		return array();
	}
	$rejected = array();
	foreach ( (array) ( $data['errors'] ?? array() ) as $error ) {
		$tag = preg_replace( '/^merge_fields\./', '', (string) ( $error['field'] ?? '' ) );
		if ( isset( $merge[ $tag ] ) ) {
			$rejected[] = $tag;
		}
	}
	if ( $rejected || 'Invalid Resource' !== ( $data['title'] ?? '' ) ) {
		return $rejected;
	}
	// rejected without naming a field: keep only the name fields, then nothing
	$others = array_diff( array_keys( $merge ), array( 'FNAME', 'LNAME' ) );
	return $others ?: array_keys( $merge );
}

/** Adds or updates the contact, then tags it. Returns a short result for the Enquiries list. */
function majeurs_mailchimp_sync( $email, array $merge, array $tags, $subscribe ) {
	if ( ! majeurs_mailchimp_ready() ) {
		return 'Not connected';
	}
	if ( ! is_email( $email ) || ( ! $tags && ! $subscribe ) ) {
		return 'Skipped';
	}

	$member  = 'lists/' . majeurs_mailchimp_audience() . '/members/' . md5( strtolower( $email ) );
	$body    = array( 'email_address' => $email, 'status_if_new' => $subscribe ? 'subscribed' : 'transactional' );
	$skipped = array();
	if ( $subscribe ) {
		$body['status'] = 'subscribed';
	}

	for ( $try = 0; $try < 4; $try++ ) {
		$body['merge_fields'] = (object) $merge;
		list( $code, $data ) = majeurs_mailchimp( 'PUT', $member, $body );
		if ( 400 === $code && $subscribe && 'pending' !== $body['status'] && 'Member In Compliance State' === ( $data['title'] ?? '' ) ) {
			$body['status'] = $body['status_if_new'] = 'pending';
			continue;
		}
		$rejected = majeurs_mailchimp_rejected( $code, $data, $merge );
		if ( ! $rejected ) {
			break;
		}
		$skipped = array_merge( $skipped, $rejected );
		$merge   = array_diff_key( $merge, array_flip( $rejected ) );
	}
	if ( $code < 200 || $code >= 300 ) {
		return 'Failed: ' . ( $data['detail'] ?? "HTTP {$code}" );
	}
	$result = 'Added (' . ( $data['status'] ?? '' ) . ')' . ( $skipped ? '; not accepted: ' . implode( ', ', $skipped ) : '' );

	if ( $tags ) {
		$active = array_map( function ( $tag ) {
			return array( 'name' => $tag, 'status' => 'active' );
		}, $tags );
		list( $code, $data ) = majeurs_mailchimp( 'POST', $member . '/tags', array( 'tags' => $active ) );
		if ( $code < 200 || $code >= 300 ) {
			return 'Failed tagging: ' . ( $data['detail'] ?? "HTTP {$code}" );
		}
	}
	return $result;
}

/* ---------- Reading enquiries back ---------- */

/**
 * Who can see and export submissions. Changing settings needs manage_options.
 * Enquiries are private posts by nobody, so this must be a cap that already reads
 * others' private posts (Editors, Shop Managers, Admins), not edit_posts, which
 * Contributors and Authors have.
 */
function majeurs_forms_view_cap() {
	return (string) apply_filters( 'majeurs_forms_view_cap', 'read_private_posts' );
}

/** Enquiries per form (slug => count), cached until the next submission or an hour */
function majeurs_forms_counts() {
	$counts = get_transient( 'majeurs_forms_counts' );
	if ( is_array( $counts ) ) {
		return $counts;
	}
	global $wpdb;
	$counts = array();
	$rows   = $wpdb->get_results( "SELECT pm.meta_value AS form, COUNT(*) AS n FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE pm.meta_key = '_majeurs_form' AND p.post_type = 'majeurs_enquiry' AND p.post_status NOT IN ( 'trash', 'auto-draft' ) GROUP BY pm.meta_value" );
	foreach ( (array) $rows as $row ) {
		$counts[ $row->form ] = (int) $row->n;
	}
	set_transient( 'majeurs_forms_counts', $counts, HOUR_IN_SECONDS );
	return $counts;
}

foreach ( array( 'trashed_post', 'untrashed_post', 'delete_post' ) as $majeurs_forms_hook ) {
	add_action( $majeurs_forms_hook, function ( $post_id ) {
		if ( 'majeurs_enquiry' === get_post_type( $post_id ) ) {
			delete_transient( 'majeurs_forms_counts' );
		}
	} );
}
unset( $majeurs_forms_hook );

/** A string from $_GET / $_POST, unslashed ('' when missing or not a string) */
function majeurs_forms_input( array $source, $key ) {
	return isset( $source[ $key ] ) && is_string( $source[ $key ] ) ? wp_unslash( $source[ $key ] ) : '';
}

/** Search text and a from/to date range (Y-m-d, site time) */
function majeurs_forms_filters( array $source ) {
	$filters = array( 'q' => sanitize_text_field( majeurs_forms_input( $source, 'q' ) ), 'from' => '', 'to' => '' );
	foreach ( array( 'from', 'to' ) as $key ) {
		$date = majeurs_forms_input( $source, $key );
		if ( preg_match( '/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m ) && checkdate( (int) $m[2], (int) $m[3], (int) $m[1] ) ) {
			$filters[ $key ] = $date;
		}
	}
	return $filters;
}

/** WP_Query args for a form's enquiries, newest first. The search covers the title (name or email) and the answers. */
function majeurs_forms_query_args( $form, array $filters ) {
	$filters += array( 'q' => '', 'from' => '', 'to' => '' );
	$args     = array(
		'post_type'           => 'majeurs_enquiry',
		'post_status'         => 'any',
		'meta_key'            => '_majeurs_form',
		'meta_value'          => $form,
		'orderby'             => array( 'date' => 'DESC', 'ID' => 'DESC' ),
		'ignore_sticky_posts' => true,
	);
	if ( '' !== $filters['q'] ) {
		$args['s'] = $filters['q'];
	}
	$range = array( 'inclusive' => true );
	foreach ( array( 'from' => 'after', 'to' => 'before' ) as $key => $clause ) {
		if ( '' !== $filters[ $key ] ) {
			list( $year, $month, $day ) = array_map( 'intval', explode( '-', $filters[ $key ] ) );
			$range[ $clause ]           = array( 'year' => $year, 'month' => $month, 'day' => $day );
		}
	}
	if ( count( $range ) > 1 ) {
		$args['date_query'] = array( $range );
	}
	return $args;
}

function majeurs_forms_count_matching( $form, array $filters ) {
	$query = new WP_Query( majeurs_forms_query_args( $form, $filters ) + array( 'fields' => 'ids', 'posts_per_page' => 1 ) );
	return (int) $query->found_posts;
}

/** Every matching enquiry, 200 at a time, as entries (see majeurs_forms_entry) */
function majeurs_forms_each_entry( $form, array $filters ) {
	$size = 200;
	$args = majeurs_forms_query_args( $form, $filters ) + array( 'fields' => 'ids', 'posts_per_page' => $size, 'no_found_rows' => true, 'update_post_term_cache' => false );
	for ( $paged = 1; ; $paged++ ) {
		$args['paged'] = $paged;
		$ids           = ( new WP_Query( $args ) )->posts;
		if ( ! $ids ) {
			return;
		}
		_prime_post_caches( $ids, false, true );
		foreach ( $ids as $id ) {
			$post = get_post( $id );
			if ( $post ) {
				yield majeurs_forms_entry( $post );
			}
			wp_cache_delete( $id, 'posts' );
			wp_cache_delete( $id, 'post_meta' );
		}
		if ( count( $ids ) < $size ) {
			return;
		}
	}
}

/**
 * An enquiry as [ id, form, date (Y-m-d H:i:s site time), name, email, values (key => value), subscribe,
 * links (attachment URLs), page, mailchimp ]. Handles enquiries saved before _majeurs_values.
 */
function majeurs_forms_entry( WP_Post $post ) {
	$id     = $post->ID;
	$form   = (string) get_post_meta( $id, '_majeurs_form', true );
	$values = json_decode( (string) get_post_meta( $id, '_majeurs_values', true ), true );
	if ( is_array( $values ) ) {
		$ids   = json_decode( (string) get_post_meta( $id, '_majeurs_attachments', true ), true );
		$links = array_values( array_filter( array_map( 'wp_get_attachment_url', array_map( 'absint', is_array( $ids ) ? $ids : array() ) ) ) );
		$page  = (string) get_post_meta( $id, '_majeurs_page', true );
	} else {
		list( $values, $links, $page ) = majeurs_forms_legacy( $post, $form );
	}
	$name = (string) get_post_meta( $id, '_majeurs_name', true );
	if ( '' === $name ) {
		$name = trim( ( $values['first_name'] ?? '' ) . ' ' . ( $values['last_name'] ?? '' ) );
	}
	$email = (string) get_post_meta( $id, '_majeurs_reply_to', true );
	if ( '' === $name ) {
		// older titles are "Form – name or email"
		$parts = explode( ' – ', $post->post_title, 2 );
		$name  = isset( $parts[1] ) && $parts[1] !== $email ? $parts[1] : '';
	}
	return array(
		'id'        => $id,
		'form'      => $form,
		'date'      => $post->post_date,
		'name'      => $name,
		'email'     => $email,
		'values'    => array_map( 'strval', $values ),
		'subscribe' => 'yes' === get_post_meta( $id, '_majeurs_subscribe', true ),
		'links'     => $links,
		'page'      => $page,
		'mailchimp' => (string) get_post_meta( $id, '_majeurs_mailchimp', true ),
	);
}

/**
 * [ values, links, page ] of an enquiry saved before _majeurs_values: read from its table (the JSON in
 * _majeurs_fields lost its backslashes on save), mapped to the form's fields by label.
 */
function majeurs_forms_legacy( WP_Post $post, $form ) {
	$rows  = array();
	$links = array();
	$page  = '';
	if ( preg_match_all( '#<tr>\s*<th[^>]*>(.*?)</th>\s*<td[^>]*>(.*?)</td>\s*</tr>#s', $post->post_content, $matches, PREG_SET_ORDER ) ) {
		foreach ( $matches as $m ) {
			$label = html_entity_decode( wp_strip_all_tags( $m[1] ), ENT_QUOTES, 'UTF-8' );
			if ( preg_match( '/^Attachment \d+$/', $label ) && preg_match( '#href="([^"]+)"#', $m[2], $href ) ) {
				$links[] = html_entity_decode( $href[1], ENT_QUOTES, 'UTF-8' );
				continue;
			}
			$value  = preg_replace( '#<br\s*/?>\s*#i', "\n", $m[2] );
			$rows[] = array( $label, html_entity_decode( strip_tags( $value ), ENT_QUOTES, 'UTF-8' ) );
		}
	} else {
		$json = json_decode( (string) get_post_meta( $post->ID, '_majeurs_fields', true ), true );
		foreach ( is_array( $json ) ? $json : array() as $row ) {
			if ( is_array( $row ) && isset( $row[0], $row[1] ) ) {
				$rows[] = array( (string) $row[0], (string) $row[1] );
			}
		}
	}
	if ( preg_match( '#Sent from <a href="([^"]+)"#', $post->post_content, $m ) ) {
		$page = html_entity_decode( $m[1], ENT_QUOTES, 'UTF-8' );
	}

	$keys = array();
	foreach ( majeurs_forms_fields( $form ) as $key => $label ) {
		$keys[ strtolower( $label ) ] = $key;
	}
	$values = array();
	foreach ( $rows as $row ) {
		$key = $keys[ strtolower( trim( $row[0] ) ) ] ?? '';
		if ( '' !== $key && ! isset( $values[ $key ] ) ) {
			$values[ $key ] = $row[1];
		}
	}
	return array( $values, $links, $page );
}

/** Export columns (key => heading): the form's fields between the enquiry's own details */
/** Export columns. The form's own email field is what fills "Email" (the Reply-To), so it isn't repeated. */
function majeurs_forms_columns( $form ) {
	return array( '_date' => 'Date', '_name' => 'Name', '_email' => 'Email' )
		+ array_diff_key( majeurs_forms_fields( $form ), array( 'email' => true, 'work_email' => true ) )
		+ array( '_subscribe' => 'Marketing emails', '_attachments' => 'Attachments', '_page' => 'Sent from', '_mailchimp' => 'Mailchimp', '_id' => 'Enquiry ID' );
}

function majeurs_forms_cell( array $entry, $key ) {
	switch ( $key ) {
		case '_date':
			return mysql2date( 'Y-m-d H:i', $entry['date'] );
		case '_name':
			return $entry['name'];
		case '_email':
			return $entry['email'];
		case '_subscribe':
			return $entry['subscribe'] ? 'Yes' : 'No';
		case '_attachments':
			return implode( "\n", $entry['links'] );
		case '_page':
			return $entry['page'];
		case '_mailchimp':
			return $entry['mailchimp'];
		case '_id':
			return (string) $entry['id'];
		default:
			return $entry['values'][ $key ] ?? '';
	}
}

/* ---------- Exports: CSV, Excel, PDF ---------- */

add_action( 'admin_post_majeurs_forms_export', 'majeurs_forms_export' );

function majeurs_forms_export() {
	$form   = sanitize_key( majeurs_forms_input( $_GET, 'form' ) );
	$format = sanitize_key( majeurs_forms_input( $_GET, 'format' ) );
	if ( ! current_user_can( majeurs_forms_view_cap() ) ) {
		wp_die( 'You are not allowed to export enquiries.', 'Export', array( 'response' => 403 ) );
	}
	check_admin_referer( 'majeurs_forms_export_' . $form );
	if ( '*' === $form || ! isset( majeurs_forms_list()[ $form ] ) || ! in_array( $format, array( 'csv', 'xlsx', 'pdf' ), true ) ) {
		wp_die( 'Unknown export.', 'Export', array( 'response' => 400 ) );
	}
	if ( 'xlsx' === $format && ! class_exists( 'ZipArchive' ) ) {
		$format = 'csv'; // the Excel button says so when the zip extension is missing
	}
	$filters  = majeurs_forms_filters( $_GET );
	$filename = sprintf( 'majeurs-%s-enquiries-%s.%s', $form, wp_date( 'Y-m-d' ), $format );
	if ( function_exists( 'set_time_limit' ) ) {
		@set_time_limit( 300 );
	}
	while ( ob_get_level() ) {
		ob_end_clean();
	}
	if ( 'pdf' === $format ) {
		majeurs_forms_export_pdf( $form, $filters, $filename );
	} elseif ( 'xlsx' === $format ) {
		majeurs_forms_export_xlsx( $form, $filters, $filename );
	} else {
		majeurs_forms_export_csv( $form, $filters, $filename );
	}
	exit;
}

function majeurs_forms_download_headers( $type, $filename, $length = 0 ) {
	nocache_headers();
	header( 'Content-Type: ' . $type );
	header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
	header( 'X-Content-Type-Options: nosniff' );
	if ( $length ) {
		header( 'Content-Length: ' . $length );
	}
}

/** Stops a spreadsheet treating a value as a formula */
function majeurs_forms_csv_safe( $value ) {
	return '' !== $value && false !== strpos( "=+-@\t\r", $value[0] ) ? "'" . $value : $value;
}

function majeurs_forms_export_csv( $form, array $filters, $filename ) {
	$columns = majeurs_forms_columns( $form );
	majeurs_forms_download_headers( 'text/csv; charset=utf-8', $filename );
	$out = fopen( 'php://output', 'w' );
	fwrite( $out, "\xEF\xBB\xBF" ); // BOM, so Excel reads UTF-8
	fputcsv( $out, array_map( 'majeurs_forms_csv_safe', array_values( $columns ) ), ',', '"', '' );
	foreach ( majeurs_forms_each_entry( $form, $filters ) as $entry ) {
		$row = array();
		foreach ( array_keys( $columns ) as $key ) {
			$row[] = majeurs_forms_csv_safe( majeurs_forms_cell( $entry, $key ) );
		}
		fputcsv( $out, $row, ',', '"', '' );
	}
	fclose( $out );
}

/** Text for XML: valid UTF-8, no characters XML forbids, escaped, within Excel's cell limit */
function majeurs_xlsx_text( $value ) {
	$value = (string) preg_replace( '/[^\x{9}\x{A}\x{D}\x{20}-\x{D7FF}\x{E000}-\x{FFFD}\x{10000}-\x{10FFFF}]/u', '', wp_check_invalid_utf8( (string) $value, true ) );
	if ( mb_strlen( $value ) > 32000 ) {
		$value = mb_substr( $value, 0, 32000 ) . '…';
	}
	return htmlspecialchars( $value, ENT_QUOTES | ENT_XML1, 'UTF-8' );
}

/** Column letters for a 0-based index: 0 = A, 26 = AA */
function majeurs_xlsx_column( $index ) {
	$letters = '';
	for ( $n = $index + 1; $n > 0; $n = intdiv( $n - 1, 26 ) ) {
		$letters = chr( 65 + ( $n - 1 ) % 26 ) . $letters;
	}
	return $letters;
}

/** One row of inline-string cells. Style 1 = bold header, 2 = wrapped (multi-line values). */
function majeurs_xlsx_row( $number, array $values, $header ) {
	$xml = '<row r="' . $number . '">';
	foreach ( array_values( $values ) as $i => $value ) {
		if ( '' === $value ) {
			continue;
		}
		$style = $header ? 1 : ( false !== strpos( $value, "\n" ) ? 2 : 0 );
		$xml  .= '<c r="' . majeurs_xlsx_column( $i ) . $number . '" t="inlineStr"' . ( $style ? ' s="' . $style . '"' : '' ) . '><is><t xml:space="preserve">' . majeurs_xlsx_text( $value ) . '</t></is></c>';
	}
	return $xml . "</row>\n";
}

function majeurs_forms_export_xlsx( $form, array $filters, $filename ) {
	$columns   = majeurs_forms_columns( $form );
	$headings  = array_values( $columns );
	$dir       = get_temp_dir();
	$rows_file = tempnam( $dir, 'mjr' );
	$sheet     = tempnam( $dir, 'mjs' );
	$package   = tempnam( $dir, 'mjx' );
	$rows      = $rows_file ? fopen( $rows_file, 'w' ) : false;
	if ( ! $rows || ! $sheet || ! $package ) {
		wp_die( 'Could not create the Excel file (temporary folder not writable).', 'Export', array( 'response' => 500 ) );
	}

	// rows go to a file first: the column widths, which come before them, are only known at the end
	$widths = array_map( 'mb_strlen', $headings );
	fwrite( $rows, majeurs_xlsx_row( 1, $headings, true ) );
	$number = 1;
	foreach ( majeurs_forms_each_entry( $form, $filters ) as $entry ) {
		$values = array();
		foreach ( array_keys( $columns ) as $i => $key ) {
			$values[ $i ] = majeurs_forms_cell( $entry, $key );
			foreach ( explode( "\n", $values[ $i ] ) as $line ) {
				$widths[ $i ] = max( $widths[ $i ], mb_strlen( $line ) );
			}
		}
		fwrite( $rows, majeurs_xlsx_row( ++$number, $values, false ) );
	}
	fclose( $rows );

	$cols = '';
	foreach ( $widths as $i => $width ) {
		$cols .= sprintf( '<col min="%1$d" max="%1$d" width="%2$d" customWidth="1"/>', $i + 1, min( 60, max( 10, $width + 2 ) ) );
	}
	$out = fopen( $sheet, 'w' );
	fwrite( $out, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n"
		. '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
		. '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>'
		. '<sheetFormatPr defaultRowHeight="15"/><cols>' . $cols . '</cols><sheetData>' . "\n" );
	$in = fopen( $rows_file, 'r' );
	stream_copy_to_stream( $in, $out );
	fclose( $in );
	fwrite( $out, '</sheetData></worksheet>' );
	fclose( $out );

	$sheet_name = mb_substr( preg_replace( '#[\[\]:*?/\\\\]#', '', majeurs_forms_list()[ $form ][0] ), 0, 31 );
	$xml        = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n";
	$zip        = new ZipArchive();
	if ( true !== $zip->open( $package, ZipArchive::CREATE | ZipArchive::OVERWRITE ) ) {
		@unlink( $rows_file );
		@unlink( $sheet );
		@unlink( $package );
		wp_die( 'Could not create the Excel file.', 'Export', array( 'response' => 500 ) );
	}
	$zip->addFromString( '[Content_Types].xml', $xml
		. '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
		. '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
		. '<Default Extension="xml" ContentType="application/xml"/>'
		. '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
		. '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
		. '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
		. '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
		. '</Types>' );
	$zip->addFromString( '_rels/.rels', $xml
		. '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
		. '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
		. '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
		. '</Relationships>' );
	$zip->addFromString( 'docProps/core.xml', $xml
		. '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
		. '<dc:title>' . majeurs_xlsx_text( majeurs_forms_list()[ $form ][0] . ' enquiries' ) . '</dc:title><dc:creator>Majeurs</dc:creator>'
		. '<dcterms:created xsi:type="dcterms:W3CDTF">' . gmdate( 'Y-m-d\TH:i:s\Z' ) . '</dcterms:created>'
		. '</cp:coreProperties>' );
	$zip->addFromString( 'xl/workbook.xml', $xml
		. '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
		. '<sheets><sheet name="' . majeurs_xlsx_text( $sheet_name ?: 'Enquiries' ) . '" sheetId="1" r:id="rId1"/></sheets></workbook>' );
	$zip->addFromString( 'xl/_rels/workbook.xml.rels', $xml
		. '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
		. '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
		. '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
		. '</Relationships>' );
	$zip->addFromString( 'xl/styles.xml', $xml
		. '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
		. '<fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts>'
		. '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
		. '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
		. '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
		. '<cellXfs count="3">'
		. '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
		. '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
		. '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>'
		. '</cellXfs>'
		. '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
		. '</styleSheet>' );
	$zip->addFile( $sheet, 'xl/worksheets/sheet1.xml' );
	$zip->close();

	majeurs_forms_download_headers( 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $filename, (int) filesize( $package ) );
	readfile( $package );
	@unlink( $rows_file );
	@unlink( $sheet );
	@unlink( $package );
}

/* PDF: a minimal writer (A4 portrait, the built-in Helvetica fonts, Windows-1252 text) */

/** UTF-8 to Windows-1252 for the PDF fonts: ₦ becomes "NGN ", anything else unmappable "?" */
function majeurs_pdf_encode( $text ) {
	$text = wp_check_invalid_utf8( (string) $text, true );
	$text = str_replace( array( "\r\n", "\r", "\t", '₦' ), array( "\n", "\n", ' ', 'NGN ' ), $text );
	$text = (string) preg_replace( '/[\x00-\x09\x0B-\x1F\x7F]/', '', $text );
	if ( ! preg_match( '/[^\x00-\x7F]/', $text ) ) {
		return $text;
	}
	$out = function_exists( 'iconv' ) ? @iconv( 'UTF-8', 'Windows-1252//TRANSLIT', $text ) : false;
	if ( false !== $out ) {
		return $out;
	}
	// some iconv builds give up on the first unmappable character: go one at a time
	$out = '';
	foreach ( preg_split( '//u', $text, -1, PREG_SPLIT_NO_EMPTY ) as $char ) {
		if ( strlen( $char ) === 1 ) {
			$out .= $char;
			continue;
		}
		$byte = function_exists( 'iconv' ) ? @iconv( 'UTF-8', 'Windows-1252//TRANSLIT', $char ) : false;
		if ( ( false === $byte || '' === $byte ) && function_exists( 'mb_convert_encoding' ) ) {
			$byte = @mb_convert_encoding( $char, 'Windows-1252', 'UTF-8' );
		}
		$out .= false === $byte || '' === $byte ? '?' : $byte;
	}
	return $out;
}

function majeurs_pdf_escape( $text ) {
	return str_replace( array( '\\', '(', ')', "\n" ), array( '\\\\', '\\(', '\\)', ' ' ), $text );
}

/** Glyph widths (1/1000 em) for Windows-1252 bytes; ASCII from the Helvetica AFMs, the rest approximate */
function majeurs_pdf_widths( $bold ) {
	static $tables = array();
	$key = $bold ? 1 : 0;
	if ( ! isset( $tables[ $key ] ) ) {
		$ascii = $bold
			? '278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584'
			: '278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584';
		$widths = array_fill( 0, 256, 556 );
		foreach ( explode( ',', $ascii ) as $i => $width ) {
			$widths[ 32 + $i ] = (int) $width;
		}
		for ( $byte = 0xC0; $byte <= 0xDE; $byte++ ) {
			$widths[ $byte ] = 722; // accented capitals
		}
		$widths[0x85] = 1000; // …
		$widths[0x91] = $widths[0x92] = $bold ? 278 : 222; // ‘ ’
		$widths[0x93] = $widths[0x94] = $bold ? 500 : 333; // “ ”
		$widths[0x95] = 350; // •
		$widths[0x97] = 1000; // —
		$widths[0xA0] = 278;
		$widths[0xB7] = 278; // ·
		$tables[ $key ] = $widths;
	}
	return $tables[ $key ];
}

function majeurs_pdf_width( $text, $bold, $size ) {
	$widths = majeurs_pdf_widths( $bold );
	$total  = 0;
	foreach ( count_chars( $text, 1 ) as $byte => $count ) {
		$total += $widths[ $byte ] * $count;
	}
	return $total * $size / 1000;
}

/** Word-wraps encoded text to lines no wider than $width ($first for the first line); long words are split */
function majeurs_pdf_wrap( $text, $bold, $size, $width, $first ) {
	$lines = array();
	$limit = $first;
	$space = majeurs_pdf_width( ' ', $bold, $size );
	foreach ( explode( "\n", $text ) as $paragraph ) {
		$line  = '';
		$used  = 0;
		foreach ( explode( ' ', $paragraph ) as $word ) {
			$w = majeurs_pdf_width( $word, $bold, $size );
			if ( '' !== $line && $used + $space + $w <= $limit ) {
				$line .= ' ' . $word;
				$used += $space + $w;
				continue;
			}
			if ( '' !== $line ) {
				$lines[] = $line;
				$limit   = $width;
			}
			while ( $w > $limit && strlen( $word ) > 1 ) {
				$fit = 1;
				while ( $fit < strlen( $word ) && majeurs_pdf_width( substr( $word, 0, $fit + 1 ), $bold, $size ) <= $limit ) {
					$fit++;
				}
				$lines[] = substr( $word, 0, $fit );
				$word    = substr( $word, $fit );
				$w       = majeurs_pdf_width( $word, $bold, $size );
				$limit   = $width;
			}
			$line = $word;
			$used = $w;
		}
		$lines[] = $line;
		$limit   = $width;
	}
	return $lines;
}

/** A4 in points; text runs between the margins */
function majeurs_pdf_new( $title ) {
	return array( 'title' => $title, 'pages' => array(), 'page' => null, 'y' => 0, 'w' => 595.28, 'h' => 841.89, 'm' => 42 );
}

/** Starts a new page when $height doesn't fit above the footer (or when there is no page yet) */
function majeurs_pdf_room( array &$pdf, $height ) {
	if ( null !== $pdf['page'] && $pdf['y'] - $height >= 56 ) {
		return;
	}
	if ( null !== $pdf['page'] ) {
		$pdf['pages'][] = $pdf['page'];
	}
	$pdf['page'] = '';
	$pdf['y']    = $pdf['h'] - 48;
}

/** Text at the current baseline */
function majeurs_pdf_put( array &$pdf, $x, $bold, $size, $text, $gray = 0 ) {
	if ( '' !== $text ) {
		$pdf['page'] .= sprintf( "BT %.2F g /F%d %.2F Tf %.2F %.2F Td (%s) Tj ET\n", $gray, $bold ? 2 : 1, $size, $x, $pdf['y'], majeurs_pdf_escape( $text ) );
	}
}

/** Moves down one line (breaking the page if needed) and writes wrapped text, one call per line */
function majeurs_pdf_lines( array &$pdf, $text, $bold, $size, $lead, $gray = 0 ) {
	$width = $pdf['w'] - 2 * $pdf['m'];
	foreach ( majeurs_pdf_wrap( majeurs_pdf_encode( $text ), $bold, $size, $width, $width ) as $line ) {
		majeurs_pdf_room( $pdf, $lead );
		$pdf['y'] -= $lead;
		majeurs_pdf_put( $pdf, $pdf['m'], $bold, $size, $line, $gray );
	}
}

/** "Label: value" with a bold label; the value wraps under it */
function majeurs_pdf_field( array &$pdf, $label, $value ) {
	$size  = 9;
	$lead  = 12;
	$width = $pdf['w'] - 2 * $pdf['m'];
	$label = majeurs_pdf_encode( $label . ': ' );
	$lw    = majeurs_pdf_width( $label, true, $size );
	if ( $lw > $width * 0.5 ) {
		majeurs_pdf_room( $pdf, $lead );
		$pdf['y'] -= $lead;
		majeurs_pdf_put( $pdf, $pdf['m'], true, $size, $label );
		$lw = 0;
		$label = '';
	}
	foreach ( majeurs_pdf_wrap( majeurs_pdf_encode( $value ), false, $size, $width, $width - $lw ) as $i => $line ) {
		majeurs_pdf_room( $pdf, $lead );
		$pdf['y'] -= $lead;
		if ( 0 === $i && '' !== $label ) {
			majeurs_pdf_put( $pdf, $pdf['m'], true, $size, $label );
			majeurs_pdf_put( $pdf, $pdf['m'] + $lw, false, $size, $line );
		} else {
			majeurs_pdf_put( $pdf, $pdf['m'], false, $size, $line );
		}
	}
}

/** The finished file: pages with "Page x of y" footers, fonts, xref table and trailer */
function majeurs_pdf_output( array $pdf ) {
	if ( null !== $pdf['page'] ) {
		$pdf['pages'][] = $pdf['page'];
	}
	if ( ! $pdf['pages'] ) {
		$pdf['pages'][] = '';
	}
	$total   = count( $pdf['pages'] );
	$title   = majeurs_pdf_encode( $pdf['title'] );
	$objects = array(
		1 => '<< /Type /Catalog /Pages 2 0 R >>',
		2 => '',
		3 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
		4 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
		5 => '<< /Title (' . majeurs_pdf_escape( $title ) . ') /Producer (Majeurs) /CreationDate (D:' . gmdate( 'YmdHis' ) . "Z) >>",
	);
	$kids    = array();
	foreach ( $pdf['pages'] as $i => $content ) {
		$number   = majeurs_pdf_encode( sprintf( 'Page %d of %d', $i + 1, $total ) );
		$content .= sprintf( "BT 0.45 g /F1 8 Tf %.2F 28 Td (%s) Tj ET\n", $pdf['m'], majeurs_pdf_escape( $title ) );
		$content .= sprintf( "BT 0.45 g /F1 8 Tf %.2F 28 Td (%s) Tj ET\n", $pdf['w'] - $pdf['m'] - majeurs_pdf_width( $number, false, 8 ), majeurs_pdf_escape( $number ) );
		$filter   = '';
		if ( function_exists( 'gzcompress' ) ) {
			$content = gzcompress( $content );
			$filter  = ' /Filter /FlateDecode';
		}
		$id             = count( $objects ) + 1;
		$objects[ $id ] = sprintf( '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %.2F %.2F] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents %d 0 R >>', $pdf['w'], $pdf['h'], $id + 1 );
		$objects[ $id + 1 ] = '<< /Length ' . strlen( $content ) . $filter . " >>\nstream\n" . $content . "\nendstream";
		$kids[]         = $id . ' 0 R';
	}
	$objects[2] = '<< /Type /Pages /Kids [' . implode( ' ', $kids ) . '] /Count ' . $total . ' >>';

	$out     = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
	$offsets = array();
	foreach ( $objects as $id => $body ) {
		$offsets[ $id ] = strlen( $out );
		$out           .= $id . " 0 obj\n" . $body . "\nendobj\n";
	}
	$xref = strlen( $out );
	$out .= 'xref' . "\n" . '0 ' . ( count( $objects ) + 1 ) . "\n" . "0000000000 65535 f \n";
	foreach ( $offsets as $offset ) {
		$out .= sprintf( "%010d 00000 n \n", $offset );
	}
	$out .= "trailer\n<< /Size " . ( count( $objects ) + 1 ) . " /Root 1 0 R /Info 5 0 R >>\nstartxref\n" . $xref . "\n%%EOF\n";
	return $out;
}

/** "12 enquiries · 1 Oct 2026 to 1 Nov 2026 · Search: sofa" */
function majeurs_forms_filter_text( array $filters, $count ) {
	$parts = array( sprintf( '%s %s', number_format_i18n( $count ), 1 === $count ? 'enquiry' : 'enquiries' ) );
	if ( $filters['from'] || $filters['to'] ) {
		$parts[] = $filters['from'] && $filters['to']
			? mysql2date( 'j M Y', $filters['from'] ) . ' to ' . mysql2date( 'j M Y', $filters['to'] )
			: ( $filters['from'] ? 'From ' . mysql2date( 'j M Y', $filters['from'] ) : 'Up to ' . mysql2date( 'j M Y', $filters['to'] ) );
	} else {
		$parts[] = 'All dates';
	}
	if ( '' !== $filters['q'] ) {
		$parts[] = 'Search: ' . $filters['q'];
	}
	return implode( ' · ', $parts );
}

function majeurs_forms_export_pdf( $form, array $filters, $filename ) {
	$name    = majeurs_forms_list()[ $form ][0];
	$columns = majeurs_forms_columns( $form );
	$count   = majeurs_forms_count_matching( $form, $filters );
	$pdf     = majeurs_pdf_new( 'Majeurs · ' . $name . ' enquiries' );

	majeurs_pdf_lines( $pdf, $name . ' enquiries', true, 16, 18 );
	majeurs_pdf_lines( $pdf, majeurs_forms_filter_text( $filters, $count ), false, 9, 14, 0.4 );
	majeurs_pdf_lines( $pdf, 'Generated ' . wp_date( 'j F Y, H:i' ), false, 9, 12, 0.4 );
	$pdf['y'] -= 6;

	$skip = array( '_date', '_name', '_email', '_id' );
	foreach ( majeurs_forms_each_entry( $form, $filters ) as $entry ) {
		majeurs_pdf_room( $pdf, 60 ); // keep the header with its first lines
		$pdf['y']    -= 10;
		$pdf['page'] .= sprintf( "q 0.85 G 0.5 w %.2F %.2F m %.2F %.2F l S Q\n", $pdf['m'], $pdf['y'], $pdf['w'] - $pdf['m'], $pdf['y'] );
		$pdf['y']    -= 2;
		$head         = array_filter( array( mysql2date( 'j M Y, H:i', $entry['date'] ), $entry['name'], $entry['email'] ) );
		majeurs_pdf_lines( $pdf, implode( ' · ', $head ), true, 10, 14 );
		foreach ( $columns as $key => $label ) {
			$value = in_array( $key, $skip, true ) ? '' : trim( majeurs_forms_cell( $entry, $key ) );
			if ( '' !== $value && ( '_subscribe' !== $key || $entry['subscribe'] ) ) {
				majeurs_pdf_field( $pdf, $label, $value );
			}
		}
		$pdf['y'] -= 4;
	}
	if ( ! $count ) {
		$pdf['y'] -= 10;
		majeurs_pdf_lines( $pdf, 'No enquiries match these filters.', false, 10, 14 );
	}

	$file = majeurs_pdf_output( $pdf );
	majeurs_forms_download_headers( 'application/pdf', $filename, strlen( $file ) );
	echo $file; // phpcs:ignore WordPress.Security.EscapeOutput -- a binary file
}

/* ---------- wp-admin: menu, notices, saving ---------- */

/** A form's admin page, e.g. Enquiries > Get a quote, on a tab */
function majeurs_forms_admin_url( $form, $tab = '', array $args = array() ) {
	$args = array( 'post_type' => 'majeurs_enquiry', 'page' => 'majeurs-form-' . $form ) + ( $tab ? array( 'tab' => $tab ) : array() ) + $args;
	return add_query_arg( array_map( 'rawurlencode', $args ), admin_url( 'edit.php' ) );
}

function majeurs_forms_settings_url() {
	return add_query_arg( array( 'post_type' => 'majeurs_enquiry', 'page' => 'majeurs-forms' ), admin_url( 'edit.php' ) );
}

/** Notices shown after the redirect that follows a save */
function majeurs_forms_notice( $type, $message ) {
	$key       = 'majeurs_forms_notice_' . get_current_user_id();
	$notices   = get_transient( $key );
	$notices   = is_array( $notices ) ? $notices : array();
	$notices[] = array( $type, $message );
	set_transient( $key, $notices, 5 * MINUTE_IN_SECONDS );
}

function majeurs_forms_notices() {
	$key     = 'majeurs_forms_notice_' . get_current_user_id();
	$notices = get_transient( $key );
	if ( ! is_array( $notices ) ) {
		return;
	}
	delete_transient( $key );
	foreach ( $notices as $notice ) {
		printf( '<div class="notice notice-%s is-dismissible"><p>%s</p></div>', esc_attr( $notice[0] ), esc_html( $notice[1] ) );
	}
}

add_action( 'admin_menu', function () {
	$parent = 'edit.php?post_type=majeurs_enquiry';
	$counts = majeurs_forms_counts();
	foreach ( majeurs_forms_list() as $form => $info ) {
		if ( '*' === $form ) {
			continue;
		}
		$count = $counts[ $form ] ?? 0;
		$menu  = esc_html( $info[0] ) . ( $count ? ' <span class="majeurs-forms-count">' . number_format_i18n( $count ) . '</span>' : '' );
		add_submenu_page( $parent, $info[0], $menu, majeurs_forms_view_cap(), 'majeurs-form-' . $form, function () use ( $form ) {
			majeurs_forms_form_page( $form );
		} );
	}
	add_submenu_page( $parent, 'Form settings', 'Settings', 'manage_options', 'majeurs-forms', 'majeurs_forms_settings_page' );
} );

add_action( 'admin_head', function () {
	echo '<style>#adminmenu .majeurs-forms-count{display:inline-block;min-width:8px;padding:0 6px;margin-left:2px;border-radius:9px;background:rgba(240,246,252,.15);font-size:11px;line-height:17px;text-align:center}</style>';
} );

/** Recipients text cleaned like before: one valid address per line, plus the entries that were dropped */
function majeurs_forms_clean_recipients( $text ) {
	$emails  = majeurs_forms_emails( $text );
	$invalid = array();
	foreach ( array_filter( preg_split( '/[\s,;]+/', (string) $text ) ) as $entry ) {
		if ( ! in_array( sanitize_email( $entry ), $emails, true ) ) {
			$invalid[] = $entry;
		}
	}
	return array( implode( "\n", $emails ), array_unique( $invalid ) );
}

/** Mailchimp field map from the form: audience tag => form field key, "– None –" left out */
function majeurs_forms_clean_map( array $input ) {
	$map = array();
	foreach ( $input as $tag => $key ) {
		$tag = preg_replace( '/[^A-Z0-9_]/', '', strtoupper( (string) $tag ) );
		$key = sanitize_key( is_string( $key ) ? $key : '' );
		if ( '' !== $tag && '' !== $key ) {
			$map[ $tag ] = $key;
		}
	}
	return $map;
}

add_action( 'admin_post_majeurs_forms_save', 'majeurs_forms_save' );

/** Saves one tab of one form: only that tab's keys change */
function majeurs_forms_save() {
	$form = sanitize_key( majeurs_forms_input( $_POST, 'form' ) );
	$tab  = sanitize_key( majeurs_forms_input( $_POST, 'tab' ) );
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'You are not allowed to change form settings.', 'Form settings', array( 'response' => 403 ) );
	}
	check_admin_referer( 'majeurs_forms_save_' . $form . '_' . $tab );
	if ( '*' === $form || ! isset( majeurs_forms_list()[ $form ] ) ) {
		wp_die( 'Unknown form.', 'Form settings', array( 'response' => 400 ) );
	}

	if ( 'email' === $tab ) {
		if ( '' !== majeurs_forms_input( $_POST, 'majeurs_reset' ) ) {
			majeurs_forms_update( $form, array( 'subject' => null, 'body' => null ) );
			majeurs_forms_notice( 'success', 'The subject and message are back to the default.' );
		} else {
			list( $recipients, $invalid ) = majeurs_forms_clean_recipients( majeurs_forms_input( $_POST, 'recipients' ) );
			$subject = sanitize_text_field( majeurs_forms_input( $_POST, 'subject' ) );
			$body    = trim( wp_kses_post( majeurs_forms_input( $_POST, 'body' ) ) );
			majeurs_forms_update( $form, array(
				'recipients' => $recipients,
				'subject'    => '' !== $subject && majeurs_forms_default_subject() !== $subject ? $subject : null,
				'body'       => '' !== $body ? $body : null,
			) );
			if ( $invalid ) {
				majeurs_forms_notice( 'warning', 'These weren\'t valid email addresses and were removed: ' . implode( ', ', $invalid ) );
			}
			majeurs_forms_notice( 'success', 'Notification email saved.' );
		}
	} elseif ( 'mailchimp' === $tab ) {
		$keys = array( 'tags' => implode( ', ', majeurs_forms_tags( majeurs_forms_input( $_POST, 'tags' ) ) ) );
		// only when the page showed the mapping (it needs the audience's fields from Mailchimp)
		if ( isset( $_POST['map'] ) && is_array( $_POST['map'] ) ) {
			$keys['map'] = majeurs_forms_clean_map( wp_unslash( $_POST['map'] ) );
		}
		majeurs_forms_update( $form, $keys );
		majeurs_forms_notice( 'success', 'Mailchimp settings saved.' );
	} elseif ( 'after' === $tab ) {
		$mode = majeurs_forms_input( $_POST, 'success_mode' );
		$path = trim( majeurs_forms_input( $_POST, 'success_path' ) );
		if ( '' !== $path && ! majeurs_forms_valid_path( $path ) ) {
			majeurs_forms_notice( 'error', 'Not saved: the thank-you page must be a path on this website starting with "/", like /thank-you/' . $form . '/ (not a full web address).' );
		} else {
			majeurs_forms_update( $form, array(
				'success_mode'    => in_array( $mode, array( 'message', 'redirect' ), true ) ? $mode : null,
				'success_message' => sanitize_textarea_field( majeurs_forms_input( $_POST, 'success_message' ) ),
				'success_path'    => $path,
			) );
			majeurs_forms_notice( 'success', 'After-submit settings saved.' );
		}
	}

	wp_safe_redirect( majeurs_forms_admin_url( $form, $tab ) );
	exit;
}

add_action( 'admin_post_majeurs_forms_test_email', 'majeurs_forms_test_email' );

/** Sends the saved template with made-up answers to the current user */
function majeurs_forms_test_email() {
	$form = sanitize_key( majeurs_forms_input( $_POST, 'form' ) );
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'You are not allowed to send test emails.', 'Form settings', array( 'response' => 403 ) );
	}
	check_admin_referer( 'majeurs_forms_test_' . $form );
	if ( '*' === $form || ! isset( majeurs_forms_list()[ $form ] ) ) {
		wp_die( 'Unknown form.', 'Form settings', array( 'response' => 400 ) );
	}
	$to                     = wp_get_current_user()->user_email;
	list( $subject, $body ) = majeurs_forms_email( $form, majeurs_forms_sample( $form ) );
	$sent                   = $to && wp_mail( $to, '[Test] ' . $subject, $body, array( 'Content-Type: text/html; charset=UTF-8', 'Reply-To: Ada Obi <ada@example.com>' ) );
	majeurs_forms_notice( $sent ? 'success' : 'error', $sent ? "Test email sent to {$to}." : 'The test email could not be sent. Check the site\'s email (SMTP) settings.' );
	wp_safe_redirect( majeurs_forms_admin_url( $form, 'email' ) );
	exit;
}

add_action( 'admin_post_majeurs_forms_save_settings', 'majeurs_forms_save_settings' );

/** Enquiries > Settings: the Mailchimp audience and the "Any other form" fallback */
function majeurs_forms_save_settings() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'You are not allowed to change form settings.', 'Form settings', array( 'response' => 403 ) );
	}
	check_admin_referer( 'majeurs_forms_settings' );
	if ( isset( $_POST['majeurs_mailchimp_audience'] ) ) {
		update_option( 'majeurs_mailchimp_audience', sanitize_text_field( majeurs_forms_input( $_POST, 'majeurs_mailchimp_audience' ) ) );
	}
	list( $recipients, $invalid ) = majeurs_forms_clean_recipients( majeurs_forms_input( $_POST, 'recipients' ) );
	majeurs_forms_update( '*', array(
		'recipients' => $recipients,
		'tags'       => implode( ', ', majeurs_forms_tags( majeurs_forms_input( $_POST, 'tags' ) ) ),
	) );
	if ( $invalid ) {
		majeurs_forms_notice( 'warning', 'These weren\'t valid email addresses and were removed: ' . implode( ', ', $invalid ) );
	}
	majeurs_forms_notice( 'success', 'Settings saved.' );
	wp_safe_redirect( majeurs_forms_settings_url() );
	exit;
}

/* ---------- wp-admin: a form's page ---------- */

function majeurs_forms_form_page( $form ) {
	$info  = majeurs_forms_list()[ $form ];
	$admin = current_user_can( 'manage_options' );
	$tabs  = array( 'submissions' => 'Submissions' );
	if ( $admin ) {
		$tabs += array( 'email' => 'Notification email', 'mailchimp' => 'Mailchimp', 'after' => 'After submit' );
	}
	$tab = sanitize_key( majeurs_forms_input( $_GET, 'tab' ) );
	$tab = isset( $tabs[ $tab ] ) ? $tab : 'submissions';
	?>
	<div class="wrap">
		<h1><?php echo esc_html( $info[0] ); ?></h1>
		<?php majeurs_forms_notices(); ?>
		<nav class="nav-tab-wrapper" aria-label="Form sections">
			<?php foreach ( $tabs as $key => $label ) : ?>
				<a href="<?php echo esc_url( majeurs_forms_admin_url( $form, $key ) ); ?>" class="nav-tab<?php echo $key === $tab ? ' nav-tab-active' : ''; ?>"<?php echo $key === $tab ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $label ); ?></a>
			<?php endforeach; ?>
		</nav>
		<?php
		if ( 'email' === $tab ) {
			majeurs_forms_email_tab( $form );
		} elseif ( 'mailchimp' === $tab ) {
			majeurs_forms_mailchimp_tab( $form );
		} elseif ( 'after' === $tab ) {
			majeurs_forms_after_tab( $form );
		} else {
			majeurs_forms_submissions_tab( $form );
		}
		?>
	</div>
	<?php
}

function majeurs_forms_shorten( $value, $length = 60 ) {
	$value = trim( preg_replace( '/\s+/', ' ', (string) $value ) );
	return mb_strlen( $value ) > $length ? mb_substr( $value, 0, $length - 1 ) . '…' : $value;
}

function majeurs_forms_submissions_tab( $form ) {
	$filters  = majeurs_forms_filters( $_GET );
	$paged    = max( 1, absint( majeurs_forms_input( $_GET, 'paged' ) ) );
	$query    = new WP_Query( majeurs_forms_query_args( $form, $filters ) + array( 'posts_per_page' => 25, 'paged' => $paged ) );
	$filtered = '' !== $filters['q'] || $filters['from'] || $filters['to'];
	// name and email have their own columns
	$fields   = array_diff_key( majeurs_forms_fields( $form ), array_flip( array( 'first_name', 'last_name', 'email', 'work_email' ) ) );
	$export   = function ( $format ) use ( $form, $filters ) {
		$args = array( 'action' => 'majeurs_forms_export', 'form' => $form, 'format' => $format ) + array_filter( $filters, 'strlen' ) + array( '_wpnonce' => wp_create_nonce( 'majeurs_forms_export_' . $form ) );
		return add_query_arg( array_map( 'rawurlencode', $args ), admin_url( 'admin-post.php' ) );
	};
	$zip      = class_exists( 'ZipArchive' );
	?>
	<form method="get" action="<?php echo esc_url( admin_url( 'edit.php' ) ); ?>" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin:16px 0 8px">
		<input type="hidden" name="post_type" value="majeurs_enquiry">
		<input type="hidden" name="page" value="<?php echo esc_attr( 'majeurs-form-' . $form ); ?>">
		<input type="hidden" name="tab" value="submissions">
		<label>Search<br><input type="search" name="q" value="<?php echo esc_attr( $filters['q'] ); ?>" placeholder="Name, email or any answer"></label>
		<label>From<br><input type="date" name="from" value="<?php echo esc_attr( $filters['from'] ); ?>"></label>
		<label>To<br><input type="date" name="to" value="<?php echo esc_attr( $filters['to'] ); ?>"></label>
		<button type="submit" class="button">Filter</button>
		<?php if ( $filtered ) : ?>
			<a class="button-link" style="align-self:center" href="<?php echo esc_url( majeurs_forms_admin_url( $form, 'submissions' ) ); ?>">Clear</a>
		<?php endif; ?>
	</form>

	<p style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
		<strong><?php echo esc_html( sprintf( '%s %s%s', number_format_i18n( $query->found_posts ), 1 === (int) $query->found_posts ? 'enquiry' : 'enquiries', $filtered ? ' match' : '' ) ); ?></strong>
		<span aria-hidden="true">·</span>
		<span>Export <?php echo $filtered ? 'these' : 'all'; ?>:</span>
		<a class="button" href="<?php echo esc_url( $export( 'csv' ) ); ?>">CSV</a>
		<a class="button" href="<?php echo esc_url( $export( 'xlsx' ) ); ?>"<?php echo $zip ? '' : ' title="This server can\'t make Excel files (PHP zip extension missing), so this downloads a CSV, which Excel opens too."'; ?>><?php echo $zip ? 'Excel' : 'Excel (as CSV)'; ?></a>
		<a class="button" href="<?php echo esc_url( $export( 'pdf' ) ); ?>">PDF</a>
	</p>

	<div style="overflow-x:auto">
		<table class="widefat striped">
			<thead>
				<tr>
					<th scope="col" style="white-space:nowrap">Date</th>
					<th scope="col">Name</th>
					<th scope="col">Email</th>
					<?php foreach ( $fields as $label ) : ?>
						<th scope="col"><?php echo esc_html( $label ); ?></th>
					<?php endforeach; ?>
					<th scope="col">Mailchimp</th>
					<th scope="col"><span class="screen-reader-text">Open</span></th>
				</tr>
			</thead>
			<tbody>
				<?php if ( ! $query->posts ) : ?>
					<tr><td colspan="<?php echo count( $fields ) + 5; ?>"><?php echo $filtered ? 'No enquiries match these filters.' : 'No enquiries yet.'; ?></td></tr>
				<?php endif; ?>
				<?php foreach ( $query->posts as $post ) :
					$entry = majeurs_forms_entry( $post );
					$link  = get_edit_post_link( $post->ID );
					?>
					<tr>
						<td style="white-space:nowrap"><?php echo esc_html( mysql2date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $entry['date'] ) ); ?></td>
						<td><?php echo esc_html( $entry['name'] ?: '–' ); ?></td>
						<td><?php echo $entry['email'] ? '<a href="' . esc_url( 'mailto:' . $entry['email'] ) . '">' . esc_html( $entry['email'] ) . '</a>' : '–'; ?></td>
						<?php foreach ( array_keys( $fields ) as $key ) :
							$value = $entry['values'][ $key ] ?? '';
							?>
							<td title="<?php echo esc_attr( $value ); ?>"><?php echo esc_html( majeurs_forms_shorten( $value ) ); ?></td>
						<?php endforeach; ?>
						<td title="<?php echo esc_attr( $entry['mailchimp'] ); ?>"><?php echo esc_html( majeurs_forms_shorten( $entry['mailchimp'], 30 ) ?: '–' ); ?></td>
						<td><?php if ( $link ) : ?><a href="<?php echo esc_url( $link ); ?>">View</a><?php endif; ?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>

	<?php if ( $query->max_num_pages > 1 ) : ?>
		<div class="tablenav bottom">
			<div class="tablenav-pages" style="margin:8px 0">
				<?php
				echo wp_kses_post( paginate_links( array(
					'base'    => add_query_arg( 'paged', '%#%', majeurs_forms_admin_url( $form, 'submissions', array_filter( $filters, 'strlen' ) ) ),
					'format'  => '',
					'current' => $paged,
					'total'   => (int) $query->max_num_pages,
				) ) );
				?>
			</div>
		</div>
	<?php endif;
}

function majeurs_forms_email_tab( $form ) {
	$row     = majeurs_forms_settings()[ $form ];
	$subject = trim( (string) ( $row['subject'] ?? '' ) ) ?: majeurs_forms_default_subject();
	$body    = trim( (string) ( $row['body'] ?? '' ) ) ?: majeurs_forms_default_body();
	$fields  = majeurs_forms_fields( $form );
	?>
	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="majeurs_forms_save">
		<input type="hidden" name="form" value="<?php echo esc_attr( $form ); ?>">
		<input type="hidden" name="tab" value="email">
		<?php wp_nonce_field( 'majeurs_forms_save_' . $form . '_email' ); ?>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row"><label for="majeurs-recipients">Send the email to</label></th>
				<td>
					<textarea id="majeurs-recipients" name="recipients" rows="5" class="large-text code"><?php echo esc_textarea( $row['recipients'] ?? '' ); ?></textarea>
					<p class="description">One email address per line. If empty, it goes to the <a href="<?php echo esc_url( majeurs_forms_settings_url() ); ?>">Any other form</a> addresses, then the site admin. Replies go to the visitor.</p>
				</td>
			</tr>
			<tr>
				<th scope="row"><label for="majeurs-subject">Subject</label></th>
				<td><input id="majeurs-subject" type="text" name="subject" value="<?php echo esc_attr( $subject ); ?>" class="large-text"></td>
			</tr>
			<tr>
				<th scope="row"><label for="majeurs_email_body">Message</label></th>
				<td>
					<?php wp_editor( $body, 'majeurs_email_body', array( 'textarea_name' => 'body', 'media_buttons' => false, 'textarea_rows' => 14, 'wpautop' => false ) ); ?>
				</td>
			</tr>
			<tr>
				<th scope="row">Placeholders</th>
				<td>
					<p class="description">Replaced with the visitor's answers when the email is sent (their answers are always shown as plain text).</p>
					<table class="widefat striped" style="max-width:720px;margin-top:8px">
						<tbody>
							<tr><td><code>{form}</code></td><td>The form's name</td></tr>
							<tr><td><code>{name}</code></td><td>The visitor's name (their email if they gave no name)</td></tr>
							<tr><td><code>{email}</code></td><td>The visitor's email</td></tr>
							<tr><td><code>{date}</code></td><td>When it was sent</td></tr>
							<tr><td><code>{page}</code></td><td>A link to the page the form was on (in the subject: the address)</td></tr>
							<tr><td><code>{fields}</code></td><td>A table of every answer (message only)</td></tr>
							<tr><td><code>{attachments}</code></td><td>Links to uploaded files, if any (message only)</td></tr>
							<tr>
								<td><code>{field:key}</code></td>
								<td>
									One answer. This form's keys:
									<?php echo wp_kses_post( implode( ', ', array_map( function ( $key, $label ) {
										return '<code>{field:' . esc_html( $key ) . '}</code> ' . esc_html( $label );
									}, array_keys( $fields ), $fields ) ) ?: 'none yet' ); ?>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</table>
		<p class="submit">
			<?php submit_button( 'Save changes', 'primary', 'submit', false ); ?>
			<?php submit_button( 'Reset to default', 'secondary', 'majeurs_reset', false, array( 'onclick' => "return confirm('Reset the subject and message to the default?')" ) ); ?>
		</p>
	</form>

	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="majeurs_forms_test_email">
		<input type="hidden" name="form" value="<?php echo esc_attr( $form ); ?>">
		<?php wp_nonce_field( 'majeurs_forms_test_' . $form ); ?>
		<p>
			<?php submit_button( 'Send test email', 'secondary', 'submit', false ); ?>
			<span class="description">&nbsp;Sends the saved subject and message, with made-up answers, to <?php echo esc_html( wp_get_current_user()->user_email ); ?>. Save changes first.</span>
		</p>
	</form>
	<?php
}

function majeurs_forms_mailchimp_tab( $form ) {
	$row          = majeurs_forms_settings()[ $form ];
	$ready        = majeurs_mailchimp_ready();
	$merge_fields = majeurs_mailchimp_merge_fields( true );
	$fields       = majeurs_forms_fields( $form );
	$map          = isset( $row['map'] ) ? (array) $row['map'] : majeurs_mailchimp_guess( $form, $merge_fields );
	?>
	<p>The Mailchimp tags the person gets, and which form field fills each Mailchimp field. The connection and audience are in <a href="<?php echo esc_url( majeurs_forms_settings_url() ); ?>">Enquiries &gt; Settings</a>.</p>
	<ul style="list-style:disc;padding-left:20px">
		<li>Separate tags with commas. If the form has no tags, its contacts aren't added to Mailchimp, unless they tick "Keep me updated".</li>
		<li>The visitor's email always goes to Mailchimp's email field.</li>
	</ul>
	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="majeurs_forms_save">
		<input type="hidden" name="form" value="<?php echo esc_attr( $form ); ?>">
		<input type="hidden" name="tab" value="mailchimp">
		<?php wp_nonce_field( 'majeurs_forms_save_' . $form . '_mailchimp' ); ?>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row"><label for="majeurs-tags">Mailchimp tags</label></th>
				<td><input id="majeurs-tags" type="text" name="tags" value="<?php echo esc_attr( $row['tags'] ?? '' ); ?>" class="large-text" placeholder="Website form, Quote"></td>
			</tr>
			<?php if ( $fields ) : ?>
			<tr>
				<th scope="row">Field mapping</th>
				<td>
					<?php if ( ! $merge_fields ) : ?>
						<p class="description"><?php echo $ready ? 'Couldn\'t load the audience\'s fields from Mailchimp.' : 'Connect Mailchimp to map fields.'; ?></p>
					<?php else : ?>
						<table role="presentation">
							<?php foreach ( $merge_fields as $tag => $name ) : ?>
								<tr>
									<td style="padding:4px 16px 4px 0"><label for="<?php echo esc_attr( "mf-{$tag}" ); ?>"><?php echo esc_html( $name ); ?></label></td>
									<td style="padding:4px 0">
										<select id="<?php echo esc_attr( "mf-{$tag}" ); ?>" name="<?php echo esc_attr( "map[{$tag}]" ); ?>">
											<option value="">– None –</option>
											<?php foreach ( $fields as $key => $label ) : ?>
												<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $map[ $tag ] ?? '', $key ); ?>><?php echo esc_html( $label ); ?></option>
											<?php endforeach; ?>
										</select>
									</td>
								</tr>
							<?php endforeach; ?>
						</table>
					<?php endif; ?>
				</td>
			</tr>
			<?php endif; ?>
		</table>
		<?php submit_button(); ?>
	</form>
	<?php
}

function majeurs_forms_after_tab( $form ) {
	$row      = majeurs_forms_settings()[ $form ];
	$defaults = majeurs_forms_success_defaults( $form );
	$mode     = in_array( $row['success_mode'] ?? '', array( 'message', 'redirect' ), true ) ? $row['success_mode'] : $defaults['mode'];
	?>
	<p>What the website does after someone sends this form. A thank-you page has its own address, so analytics (Google Analytics, Meta, Google Ads) can count it as a conversion by URL.</p>
	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="majeurs_forms_save">
		<input type="hidden" name="form" value="<?php echo esc_attr( $form ); ?>">
		<input type="hidden" name="tab" value="after">
		<?php wp_nonce_field( 'majeurs_forms_save_' . $form . '_after' ); ?>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row">After submit</th>
				<td>
					<fieldset>
						<legend class="screen-reader-text">After submit</legend>
						<label><input type="radio" name="success_mode" value="message" <?php checked( $mode, 'message' ); ?>> Show a message (pop-up) and reset the form</label><br>
						<label><input type="radio" name="success_mode" value="redirect" <?php checked( $mode, 'redirect' ); ?>> Go to a thank-you page</label>
						<p class="description">Default: <?php echo 'redirect' === $defaults['mode'] ? 'go to a thank-you page' : 'show a message'; ?>.</p>
					</fieldset>
				</td>
			</tr>
			<tr>
				<th scope="row"><label for="majeurs-success-message">Message</label></th>
				<td>
					<textarea id="majeurs-success-message" name="success_message" rows="3" class="large-text" placeholder="<?php echo esc_attr( $defaults['message'] ); ?>"><?php echo esc_textarea( $row['success_message'] ?? '' ); ?></textarea>
					<p class="description">Plain text, shown in the pop-up. Empty uses the default<?php echo $defaults['message'] ? ': “' . esc_html( $defaults['message'] ) . '”' : ''; ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row"><label for="majeurs-success-path">Thank-you page</label></th>
				<td>
					<input id="majeurs-success-path" type="text" name="success_path" value="<?php echo esc_attr( $row['success_path'] ?? '' ); ?>" class="large-text code" placeholder="<?php echo esc_attr( $defaults['path'] ); ?>">
					<p class="description">A path on this website starting with "/", not a full address. Empty uses <code><?php echo esc_html( $defaults['path'] ); ?></code>.</p>
				</td>
			</tr>
		</table>
		<?php submit_button(); ?>
	</form>
	<?php
}

/* ---------- wp-admin: Enquiries > Settings, and list columns ---------- */

function majeurs_forms_settings_page() {
	$settings = majeurs_forms_settings();
	$counts   = majeurs_forms_counts();
	?>
	<div class="wrap">
		<h1>Form settings</h1>
		<?php majeurs_forms_notices(); ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="majeurs_forms_save_settings">
			<?php wp_nonce_field( 'majeurs_forms_settings' ); ?>

			<h2>Mailchimp</h2>
			<?php majeurs_mailchimp_audience_field(); ?>

			<h2>Any other form</h2>
			<p>Used for a form that has no page of its own, and when a form's "Send the email to" box is empty.</p>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="majeurs-any-to">Send the email to</label></th>
					<td>
						<textarea id="majeurs-any-to" name="recipients" rows="4" class="large-text code"><?php echo esc_textarea( $settings['*']['recipients'] ?? '' ); ?></textarea>
						<p class="description">One email address per line. If empty, the site admin gets it.</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="majeurs-any-tags">Mailchimp tags</label></th>
					<td><input id="majeurs-any-tags" type="text" name="tags" value="<?php echo esc_attr( $settings['*']['tags'] ?? '' ); ?>" class="large-text"></td>
				</tr>
			</table>

			<?php submit_button(); ?>
		</form>

		<h2>Forms</h2>
		<p>Each form's submissions, notification email, Mailchimp tags and after-submit behaviour are on its own page.</p>
		<table class="widefat striped" style="max-width:900px">
			<thead><tr><th scope="col">Form</th><th scope="col">Enquiries</th><th scope="col">Mailchimp tags</th><th scope="col"><span class="screen-reader-text">Links</span></th></tr></thead>
			<tbody>
				<?php foreach ( majeurs_forms_list() as $form => $info ) :
					if ( '*' === $form ) {
						continue;
					}
					?>
					<tr>
						<td><a href="<?php echo esc_url( majeurs_forms_admin_url( $form ) ); ?>"><strong><?php echo esc_html( $info[0] ); ?></strong></a></td>
						<td><?php echo esc_html( number_format_i18n( $counts[ $form ] ?? 0 ) ); ?></td>
						<td><?php echo esc_html( $settings[ $form ]['tags'] ?? '' ?: 'Not added to Mailchimp' ); ?></td>
						<td>
							<a href="<?php echo esc_url( majeurs_forms_admin_url( $form, 'email' ) ); ?>">Email</a> ·
							<a href="<?php echo esc_url( majeurs_forms_admin_url( $form, 'mailchimp' ) ); ?>">Mailchimp</a> ·
							<a href="<?php echo esc_url( majeurs_forms_admin_url( $form, 'after' ) ); ?>">After submit</a>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
	<?php
}

/** Connection status and the audience dropdown */
function majeurs_mailchimp_audience_field() {
	list( $key, $source ) = majeurs_mailchimp_key();
	if ( ! $key ) {
		echo '<div class="notice notice-warning inline"><p>Mailchimp isn\'t connected. Connect the Mailchimp for WooCommerce plugin, or add <code>MAJEURS_MAILCHIMP_API_KEY</code> to wp-config.php.</p></div>';
		return;
	}
	list( $code, $data ) = majeurs_mailchimp( 'GET', 'lists?count=100&fields=lists.id,lists.name,lists.stats.member_count' );
	if ( 200 !== $code ) {
		printf( '<div class="notice notice-error inline"><p>Mailchimp error: %s</p></div>', esc_html( $data['detail'] ?? "HTTP {$code}" ) );
		return;
	}
	$current = majeurs_mailchimp_audience();
	?>
	<table class="form-table" role="presentation">
		<tr>
			<th scope="row"><label for="majeurs-mc-audience">Audience</label></th>
			<td>
				<select id="majeurs-mc-audience" name="majeurs_mailchimp_audience">
					<?php if ( ! $current ) : ?><option value="">Choose an audience</option><?php endif; ?>
					<?php foreach ( $data['lists'] ?? array() as $list ) : ?>
						<option value="<?php echo esc_attr( $list['id'] ); ?>" <?php selected( $current, $list['id'] ); ?>><?php echo esc_html( sprintf( '%s (%s subscribed)', $list['name'], number_format_i18n( $list['stats']['member_count'] ?? 0 ) ) ); ?></option>
					<?php endforeach; ?>
				</select>
				<p class="description">Connected with the API key from <?php echo esc_html( $source ); ?>. After changing the audience, save, then check each form's field mapping (its Mailchimp tab).</p>
			</td>
		</tr>
	</table>
	<?php
}

add_filter( 'manage_majeurs_enquiry_posts_columns', function ( $columns ) {
	return array_slice( $columns, 0, 2, true ) + array( 'majeurs_form' => 'Form', 'majeurs_mailchimp' => 'Mailchimp' ) + $columns;
} );

add_action( 'manage_majeurs_enquiry_posts_custom_column', function ( $column, $post_id ) {
	if ( 'majeurs_form' === $column ) {
		$form = get_post_meta( $post_id, '_majeurs_form', true );
		echo esc_html( majeurs_forms_list()[ $form ][0] ?? $form );
	} elseif ( 'majeurs_mailchimp' === $column ) {
		echo esc_html( get_post_meta( $post_id, '_majeurs_mailchimp', true ) ?: '–' );
	}
}, 10, 2 );
