<?php
/**
 * Majeurs headless: enquiry form submissions
 *
 * 
 *
 * Replaces the Elementor forms (visitation, custom request, quote, repair, trade program, catalogue, waitlist,
 * contact, complaint, job application). Each submission is kept as an "Enquiry" in wp-admin (left menu),
 * emailed, and added to Mailchimp.
 *
 *   POST /wp-json/majeurs/v1/forms/<form>
 *   { "title": "Get a quote", "fields": [ { "key": "first_name", "label": "First name", "value": "Ada" }, … ],
 *     "reply_to": "ada@example.com", "name": "Ada Obi", "subscribe": false,
 *     "attachments": [ 123, 124 ], "page": "https://majeurs.com/…" }
 *   -> { "ok": true, "id": 456 }
 *
 * Files are uploaded to the media library by the Next.js server first (lib/api/media.ts); only their ids come here.
 *
 * Settings: Enquiries > Settings. Per form: who gets the email, the Mailchimp tags, and which form field fills
 * each Mailchimp audience field (like Elementor's Field Mapping). Plus the Mailchimp audience.
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

/** Used until the settings page is first saved. No "map" = guessed from the audience's field names. */
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

function majeurs_forms_settings() {
	$saved = get_option( 'majeurs_forms' );
	return is_array( $saved ) ? $saved + majeurs_forms_defaults() : majeurs_forms_defaults();
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
	$form      = $request->get_param( 'form' );
	$title     = sanitize_text_field( (string) $request->get_param( 'title' ) );
	$name      = sanitize_text_field( (string) $request->get_param( 'name' ) );
	$reply     = sanitize_email( (string) $request->get_param( 'reply_to' ) );
	$subscribe = true === $request->get_param( 'subscribe' );
	$page      = esc_url_raw( (string) $request->get_param( 'page' ) );
	$fields    = (array) $request->get_param( 'fields' );
	$files     = array_filter( array_map( 'absint', (array) $request->get_param( 'attachments' ) ) );

	$rows   = array();
	$values = array(); // field key => value, for the Mailchimp field map
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

	// remember fields the settings page doesn't list yet, so they can be mapped
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
		'meta_input'   => array( '_majeurs_form' => $form, '_majeurs_fields' => wp_json_encode( $rows ), '_majeurs_reply_to' => $reply, '_majeurs_subscribe' => $subscribe ? 'yes' : 'no' ),
	), true );
	if ( is_wp_error( $post_id ) ) {
		return new WP_Error( 'majeurs_save_failed', 'The enquiry could not be saved.', array( 'status' => 500 ) );
	}
	foreach ( $files as $id ) {
		wp_update_post( array( 'ID' => $id, 'post_parent' => $post_id ) );
	}

	$config  = majeurs_form_config( $form );
	$headers = array( 'Content-Type: text/html; charset=UTF-8' );
	if ( $reply ) {
		$headers[] = 'Reply-To: ' . ( $name ? $name . ' <' . $reply . '>' : $reply );
	}
	wp_mail( $config['to'], 'New enquiry: ' . get_the_title( $post_id ), $html, $headers );

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

	return array( 'ok' => true, 'id' => $post_id );
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

/* ---------- wp-admin: Enquiries > Settings, and list columns ---------- */

add_action( 'admin_init', function () {
	register_setting( 'majeurs_forms', 'majeurs_forms', array( 'type' => 'array', 'sanitize_callback' => 'majeurs_forms_sanitize' ) );
	register_setting( 'majeurs_forms', 'majeurs_mailchimp_audience', array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ) );
} );

add_action( 'admin_menu', function () {
	add_submenu_page( 'edit.php?post_type=majeurs_enquiry', 'Form settings', 'Settings', 'manage_options', 'majeurs-forms', 'majeurs_forms_settings_page' );
} );

function majeurs_forms_sanitize( $input ) {
	$clean   = array();
	$invalid = array();
	foreach ( array_keys( majeurs_forms_list() ) as $form ) {
		$row    = (array) ( $input[ $form ] ?? array() );
		$text   = (string) ( $row['recipients'] ?? '' );
		$emails = majeurs_forms_emails( $text );
		foreach ( array_filter( preg_split( '/[\s,;]+/', $text ) ) as $entry ) {
			if ( ! in_array( sanitize_email( $entry ), $emails, true ) ) {
				$invalid[] = $entry;
			}
		}
		$clean[ $form ] = array(
			'recipients' => implode( "\n", $emails ),
			'tags'       => implode( ', ', majeurs_forms_tags( $row['tags'] ?? '' ) ),
		);
		// only when the page showed the mapping (it needs the audience's fields from Mailchimp)
		if ( isset( $row['map'] ) && is_array( $row['map'] ) ) {
			$map = array();
			foreach ( $row['map'] as $tag => $key ) {
				$tag = preg_replace( '/[^A-Z0-9_]/', '', strtoupper( (string) $tag ) );
				$key = sanitize_key( $key );
				if ( '' !== $tag && '' !== $key ) {
					$map[ $tag ] = $key;
				}
			}
			$clean[ $form ]['map'] = $map;
		}
	}
	if ( $invalid ) {
		add_settings_error( 'majeurs_forms', 'invalid_email', 'These weren\'t valid email addresses and were removed: ' . esc_html( implode( ', ', array_unique( $invalid ) ) ) );
	}
	return $clean;
}

function majeurs_forms_settings_page() {
	$settings     = majeurs_forms_settings();
	$ready        = majeurs_mailchimp_ready();
	$merge_fields = majeurs_mailchimp_merge_fields( true );
	?>
	<div class="wrap">
		<h1>Form settings</h1>
		<?php settings_errors( 'majeurs_forms' ); ?>
		<form method="post" action="options.php">
			<?php settings_fields( 'majeurs_forms' ); ?>

			<h2>Mailchimp</h2>
			<?php majeurs_mailchimp_audience_field(); ?>

			<h2>Forms</h2>
			<p>For each website form: who gets the notification email, the Mailchimp tags the person gets, and which form field fills each Mailchimp field.</p>
			<ul style="list-style:disc;padding-left:20px">
				<li>One email address per line. If a form's box is empty, it uses <strong>Any other form</strong>.</li>
				<li>Separate tags with commas. If a form has no tags, its contacts aren't added to Mailchimp, unless they tick "Keep me updated".</li>
				<li>The visitor's email always goes to Mailchimp's email field.</li>
			</ul>

			<?php foreach ( majeurs_forms_list() as $form => $info ) :
				$row    = $settings[ $form ] ?? array();
				$fields = majeurs_forms_fields( $form );
				$map    = isset( $row['map'] ) ? (array) $row['map'] : majeurs_mailchimp_guess( $form, $merge_fields );
				$base   = 'majeurs_forms[' . $form . ']';
				?>
				<details class="postbox" style="max-width:900px;padding:0 16px">
					<summary style="padding:14px 0;cursor:pointer">
						<strong><?php echo esc_html( $info[0] ); ?></strong>
						<span class="description">&nbsp;<?php echo esc_html( $row['tags'] ?? '' ? 'Tags: ' . $row['tags'] : 'Not added to Mailchimp' ); ?></span>
					</summary>
					<table class="form-table" role="presentation">
						<tr>
							<th scope="row"><label for="<?php echo esc_attr( "mf-{$form}-to" ); ?>">Send the email to</label></th>
							<td><textarea id="<?php echo esc_attr( "mf-{$form}-to" ); ?>" name="<?php echo esc_attr( $base ); ?>[recipients]" rows="4" class="large-text code"><?php echo esc_textarea( $row['recipients'] ?? '' ); ?></textarea></td>
						</tr>
						<tr>
							<th scope="row"><label for="<?php echo esc_attr( "mf-{$form}-tags" ); ?>">Mailchimp tags</label></th>
							<td><input id="<?php echo esc_attr( "mf-{$form}-tags" ); ?>" type="text" name="<?php echo esc_attr( $base ); ?>[tags]" value="<?php echo esc_attr( $row['tags'] ?? '' ); ?>" class="large-text" placeholder="Website form, Quote"></td>
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
												<td style="padding:4px 16px 4px 0"><label for="<?php echo esc_attr( "mf-{$form}-{$tag}" ); ?>"><?php echo esc_html( $name ); ?></label></td>
												<td style="padding:4px 0">
													<select id="<?php echo esc_attr( "mf-{$form}-{$tag}" ); ?>" name="<?php echo esc_attr( "{$base}[map][{$tag}]" ); ?>">
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
				</details>
			<?php endforeach; ?>

			<?php submit_button(); ?>
		</form>
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
				<p class="description">Connected with the API key from <?php echo esc_html( $source ); ?>. After changing the audience, save, then check the field mapping below.</p>
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
