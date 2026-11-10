<?php
/**
 * Majeurs headless: branded emails
 *
 * Install: WP admin > Snippets > Add New > paste this file (without the opening <?php tag),
 * "Run snippet everywhere", Activate. Snippet name: "NextJS - Email Design".
 *
 * Every WooCommerce email (order confirmations, invoices, refunds, password reset, new account, the admin's new
 * order) and the enquiry notifications (majeurs-forms.php) share one look, from the site's design system: the
 * black Majeurs logo, black headings, a warm off-white page, square black buttons. Each email has one clear call to
 * action, chosen by email type (majeurs_email_cta), and customer emails end with a "Need help?" box using
 * Site content > Contact details (phone, WhatsApp, email; majeurs-content.php).
 *
 * WooCommerce > Settings > Emails still controls the texts, the footer text and which emails are sent. The colours
 * and logo are set here, so they match the website whatever those settings say.
 *
 * Preview (admins): GET /wp-json/majeurs/v1/email-preview?type=WC_Email_Customer_Processing_Order
 * -> the email as HTML, with WooCommerce's sample order. type=enquiry previews an enquiry notification.
 */

defined( 'ABSPATH' ) || exit;

/* ---------- design tokens (app/globals.css) ---------- */

function majeurs_email_tokens() {
	return array(
		'page'   => '#f4f1ec', // warm off-white around the email
		'body'   => '#ffffff',
		'black'  => '#000000',
		'ink'    => '#1f252c', // text
		'muted'  => '#4d4d4d', // secondary text
		'line'   => '#e2dddb', // sand: borders, the help box
		'link'   => '#695006', // bronze: text links
		'accent' => '#b2902f', // gold: the thin rule under the logo
		'font'   => "'Helvetica Neue', Helvetica, Arial, sans-serif",
		'logo'   => content_url( 'uploads/majeurs-logo-black.png' ), // 512 x 79, shown at 140px
	);
}

/** The website (where buttons lead): "Majeurs site URL" (majeurs-content.php), else the WordPress home */
function majeurs_email_site_url( $path = '/' ) {
	$base = function_exists( 'majeurs_checkout_site_url' ) ? majeurs_checkout_site_url() : '';
	return untrailingslashit( $base ?: home_url() ) . $path;
}

/** Site content > Contact details, with the website's defaults */
function majeurs_email_contact() {
	$phone    = trim( (string) get_option( 'options_contactDetails_phone', '' ) ) ?: '+234 814 399 8290';
	$email    = trim( (string) get_option( 'options_contactDetails_email', '' ) ) ?: 'customerservice@majeursholdings.com';
	$whatsapp = preg_replace( '/\D/', '', trim( (string) get_option( 'options_contactDetails_whatsapp', '' ) ) ?: $phone );
	if ( 0 === strpos( $whatsapp, '0' ) ) {
		$whatsapp = '234' . substr( $whatsapp, 1 );
	}
	return array(
		'phone'    => $phone,
		'tel'      => 'tel:+' . ltrim( preg_replace( '/\D/', '', $phone ), '0' ),
		'email'    => $email,
		'whatsapp' => 'https://wa.me/' . $whatsapp,
	);
}

/* ---------- WooCommerce's colours and logo ---------- */

$majeurs_email_options = array(
	'woocommerce_email_base_color'            => 'black',
	'woocommerce_email_background_color'      => 'page',
	'woocommerce_email_body_background_color' => 'body',
	'woocommerce_email_text_color'            => 'ink',
	'woocommerce_email_footer_text_color'     => 'muted',
);
foreach ( $majeurs_email_options as $majeurs_option => $majeurs_token ) {
	add_filter( 'pre_option_' . $majeurs_option, function () use ( $majeurs_token ) {
		return majeurs_email_tokens()[ $majeurs_token ];
	} );
}
add_filter( 'pre_option_woocommerce_email_header_image', function () {
	return majeurs_email_tokens()['logo'];
} );
add_filter( 'pre_option_woocommerce_email_header_image_width', function () {
	return '140';
} );
add_filter( 'pre_option_woocommerce_email_header_alignment', function () {
	return 'left';
} );
add_filter( 'pre_option_woocommerce_email_font_family', function () {
	return 'Helvetica';
} );
add_filter( 'woocommerce_email_header_image_url', function () {
	return majeurs_email_site_url();
} );

/* ---------- styles (inlined by WooCommerce) ---------- */

add_filter( 'woocommerce_email_styles', function ( $css ) {
	$t = majeurs_email_tokens();
	return $css . "
body, #outer_wrapper { background-color: {$t['page']}; }
#wrapper { padding: 32px 0; }
#inner_wrapper, #template_container, #template_header { border-radius: 0 !important; }
#template_container { background-color: {$t['body']}; border: 0; box-shadow: none; }
#template_header_image { padding: 36px 48px 0; text-align: left; }
#template_header_image p { margin: 0; padding-bottom: 20px; border-bottom: 2px solid {$t['accent']}; }
#template_header_image img { width: 140px; height: auto; }
#template_header { background-color: {$t['body']}; color: {$t['black']}; border: 0; border-radius: 0; }
#header_wrapper { padding: 28px 48px 4px; }
#header_wrapper h1, h1 { color: {$t['black']}; font-family: {$t['font']}; font-size: 28px; font-weight: 400; line-height: 1.25; letter-spacing: -0.2px; text-align: left; margin: 0; }
#body_content { background-color: {$t['body']}; }
#body_content_inner_cell { padding: 16px 48px 40px !important; }
#body_content_inner, #body_content p, #body_content table td { color: {$t['ink']}; font-family: {$t['font']}; font-size: 15px; line-height: 1.6; }
#body_content p { margin: 0 0 16px; }
a, .link { color: {$t['link']}; font-weight: 400; text-decoration: underline; }
h2 { color: {$t['black']}; font-family: {$t['font']}; font-size: 12px; font-weight: 700; letter-spacing: 1.6px; line-height: 1.4; text-transform: uppercase; margin: 32px 0 12px; }
h2 a { color: {$t['black']}; text-decoration: none; }
h3 { color: {$t['black']}; font-family: {$t['font']}; font-size: 15px; font-weight: 700; }
.hr, .hr-top, .hr-bottom { border-color: {$t['line']}; }
#body_content table .email-order-details th, #body_content table .email-order-details td { border-color: {$t['line']}; }
#body_content .email-order-details .order-totals-total th, #body_content .email-order-details .order-totals-total td { color: {$t['black']}; font-size: 17px; font-weight: 700; }
.address { border: 0; background-color: {$t['page']}; padding: 16px 20px; color: {$t['ink']}; font-style: normal; }
.address a { color: {$t['link']}; }
.email-additional-content p, .email-additional-content-aligned p { color: {$t['muted']}; text-align: left; }
#template_footer td { padding: 0; }
#template_footer #credit { border-top: 1px solid {$t['line']}; padding: 24px 48px 40px; }
#template_footer #credit, #template_footer #credit p { color: {$t['muted']}; font-family: {$t['font']}; font-size: 12px; line-height: 1.6; text-align: left; }
#template_footer #credit a { color: {$t['muted']}; }
/* WooCommerce's own reset-password link becomes the button */
.mj-customer_reset_password a.link { display: inline-block; background-color: {$t['black']}; color: #ffffff; font-size: 13px; font-weight: 700; letter-spacing: 1.6px; padding: 16px 32px; text-decoration: none; text-transform: uppercase; }
@media screen and (max-width: 600px) {
	#template_header_image { padding: 28px 24px 0 !important; }
	#header_wrapper { padding: 24px 24px 4px !important; }
	#header_wrapper h1 { font-size: 24px !important; }
	#body_content_inner_cell { padding: 16px 24px 32px !important; }
	#template_footer #credit { padding: 24px 24px 32px !important; }
}
";
}, 20 );

/* ---------- building blocks ---------- */

/** A full-width-on-mobile black button. Tables, so Outlook keeps the padding. */
function majeurs_email_button( $url, $label, $style = 'solid' ) {
	$t       = majeurs_email_tokens();
	$solid   = 'solid' === $style;
	$bg      = $solid ? $t['black'] : $t['body'];
	$color   = $solid ? '#ffffff' : $t['black'];
	$border  = $t['black'];
	return '<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td bgcolor="' . esc_attr( $bg ) . '" style="background-color:' . esc_attr( $bg ) . ';border:1px solid ' . esc_attr( $border ) . ';">'
		. '<a href="' . esc_url( $url ) . '" target="_blank" style="display:inline-block;padding:16px 32px;font-family:' . esc_attr( $t['font'] ) . ';font-size:13px;font-weight:700;letter-spacing:1.6px;line-height:1;text-transform:uppercase;text-decoration:none;color:' . esc_attr( $color ) . ';">' . esc_html( $label ) . '</a>'
		. '</td></tr></table>';
}

/** "Need help?" box at the end of customer emails */
function majeurs_email_help( $topic = '' ) {
	$t = majeurs_email_tokens();
	$c = majeurs_email_contact();
	$wa = $c['whatsapp'] . ( $topic ? '?text=' . rawurlencode( $topic ) : '' );
	return '<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:32px 0 0;background-color:' . esc_attr( $t['page'] ) . ';"><tr><td style="padding:24px 24px 8px;font-family:' . esc_attr( $t['font'] ) . ';">'
		. '<p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:' . esc_attr( $t['black'] ) . ';">Need help?</p>'
		. '<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:' . esc_attr( $t['ink'] ) . ';">Call or WhatsApp <a href="' . esc_url( $c['tel'] ) . '" style="color:' . esc_attr( $t['link'] ) . ';">' . esc_html( $c['phone'] ) . '</a>, or email <a href="mailto:' . esc_attr( $c['email'] ) . '" style="color:' . esc_attr( $t['link'] ) . ';">' . esc_html( $c['email'] ) . '</a>. Our customer care team will help.</p>'
		. majeurs_email_button( $wa, 'Chat on WhatsApp', 'outline' )
		. '</td></tr></table>';
}

/**
 * The email's one call to action: [ label, url ] or null. Customers with an account see their order in My account;
 * a guest's order page only works in the browser that placed it, so guests get WhatsApp about that order instead.
 */
function majeurs_email_cta( $email, $order = null ) {
	$id = $email instanceof WC_Email ? $email->id : '';
	if ( $order instanceof WC_Order ) {
		$view = $order->get_customer_id()
			? array( 'View your order', $order->get_view_order_url() )
			: array( 'Chat with us about this order', majeurs_email_contact()['whatsapp'] . '?text=' . rawurlencode( 'Hello Majeurs, I have a question about order #' . $order->get_order_number() . '.' ) );
		switch ( $id ) {
			case 'customer_processing_order':
			case 'customer_on_hold_order':
			case 'customer_completed_order':
			case 'customer_note':
			case 'customer_refunded_order':
			case 'customer_partially_refunded_order':
				return $view;
			case 'customer_invoice':
				return $order->needs_payment() ? array( 'Pay for this order', $order->get_checkout_payment_url() ) : $view;
			case 'customer_failed_order':
				return $order->needs_payment() ? array( 'Try paying again', $order->get_checkout_payment_url() ) : $view;
			case 'customer_cancelled_order':
				return array( 'Continue shopping', majeurs_email_site_url( '/shop/' ) );
			case 'new_order':
			case 'cancelled_order':
			case 'failed_order':
				return array( 'Open the order in wp-admin', $order->get_edit_order_url() );
		}
		return null;
	}
	if ( 'customer_new_account' === $id ) {
		return ! empty( $email->set_password_url )
			? array( 'Set your password', $email->set_password_url )
			: array( 'Go to your account', wc_get_page_permalink( 'myaccount' ) );
	}
	return null;
}

/* ---------- where they go in WooCommerce's emails ---------- */

// a wrapper with the email's id, so styles can target one email (e.g. the reset-password link)
add_action( 'woocommerce_email_header', function ( $heading, $email = null ) {
	echo '<div class="mj-email mj-' . esc_attr( $email instanceof WC_Email ? $email->id : 'email' ) . '">';
}, 99, 2 );

// order emails: the button right under the opening text, above the order details
add_action( 'woocommerce_email_order_details', function ( $order, $sent_to_admin, $plain_text, $email = null ) {
	$cta = majeurs_email_cta( $email, $order );
	if ( ! $cta ) {
		return;
	}
	if ( $plain_text ) {
		echo esc_html( $cta[0] ) . ': ' . esc_url_raw( $cta[1] ) . "\n\n";
		return;
	}
	echo majeurs_email_button( $cta[1], $cta[0] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in majeurs_email_button()
}, 5, 4 );

// account emails have no order details: their button goes at the end; then the help box on customer emails
add_action( 'woocommerce_email_footer', function ( $email = null ) {
	if ( $email instanceof WC_Email && ! $email->object instanceof WC_Order ) {
		$cta = majeurs_email_cta( $email );
		if ( $cta ) {
			echo majeurs_email_button( $cta[1], $cta[0] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
	}
	if ( $email instanceof WC_Email && $email->is_customer_email() ) {
		$topic = $email->object instanceof WC_Order ? 'Hello Majeurs, I have a question about order #' . $email->object->get_order_number() . '.' : '';
		echo majeurs_email_help( $topic ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
	echo '</div>';
}, 5 );

/* ---------- enquiry notifications (majeurs-forms.php) ---------- */

/**
 * An enquiry email in the same frame as WooCommerce's: $heading on top, $content, then the buttons. Plain HTML
 * when WooCommerce isn't loaded.
 */
function majeurs_email_wrap( $heading, $content, array $buttons = array() ) {
	$html = $content;
	foreach ( $buttons as $i => $button ) {
		$html .= majeurs_email_button( $button[1], $button[0], 0 === $i ? 'solid' : 'outline' );
	}
	if ( ! function_exists( 'WC' ) || ! WC()->mailer() ) {
		return $html;
	}
	$wrapped = WC()->mailer()->wrap_message( $heading, $html );
	$email   = new WC_Email();
	return $email->style_inline( $wrapped );
}

/** An enquiry's fields as a two-column table */
function majeurs_email_fields_table( array $rows, array $links = array() ) {
	$t    = majeurs_email_tokens();
	$cell = 'padding:12px 0;border-bottom:1px solid ' . $t['line'] . ';vertical-align:top;font-family:' . $t['font'] . ';font-size:15px;line-height:1.5;';
	$html = '<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border-top:1px solid ' . esc_attr( $t['line'] ) . ';">';
	foreach ( $rows as $row ) {
		$html .= '<tr><th align="left" width="38%" style="' . esc_attr( $cell ) . 'padding-right:16px;font-weight:400;color:' . esc_attr( $t['muted'] ) . ';">' . esc_html( $row[0] ) . '</th>'
			. '<td style="' . esc_attr( $cell ) . 'color:' . esc_attr( $t['ink'] ) . ';">' . nl2br( make_clickable( esc_html( $row[1] ) ) ) . '</td></tr>';
	}
	foreach ( $links as $i => $url ) {
		$html .= '<tr><th align="left" width="38%" style="' . esc_attr( $cell ) . 'padding-right:16px;font-weight:400;color:' . esc_attr( $t['muted'] ) . ';">Attachment ' . ( $i + 1 ) . '</th>'
			. '<td style="' . esc_attr( $cell ) . '"><a href="' . esc_url( $url ) . '" style="color:' . esc_attr( $t['link'] ) . ';">' . esc_html( basename( $url ) ) . '</a></td></tr>';
	}
	return $html . '</table>';
}

/* ---------- preview ---------- */

add_action( 'rest_api_init', function () {
	register_rest_route( 'majeurs/v1', '/email-preview', array(
		'methods'             => 'GET',
		'permission_callback' => function () {
			return current_user_can( 'manage_woocommerce' );
		},
		'callback'            => 'majeurs_email_preview',
	) );
} );

function majeurs_email_preview( WP_REST_Request $request ) {
	$type = sanitize_text_field( (string) ( $request->get_param( 'type' ) ?: 'WC_Email_Customer_Processing_Order' ) );
	if ( 'enquiry' === $type ) {
		$html = majeurs_email_wrap(
			'New enquiry: Get a quote',
			'<p>Ada Obi sent the <strong>Get a quote</strong> form on 10 November 2026 at 2:15 pm.</p>'
				. majeurs_email_fields_table( array( array( 'First name', 'Ada' ), array( 'Last name', 'Obi' ), array( 'Email', 'ada@example.com' ), array( 'Phone', '+234 803 000 0000' ), array( 'What they need', 'Sofas and armchairs' ), array( 'Message', "Three-seater in velvet for a living room in Lekki.\nCan we visit the showroom?" ) ) )
				. '<p style="color:#4d4d4d;font-size:13px;">Sent from https://majeurs.com/get-a-quote-for-custom-made-furniture-in-lagos/</p>',
			array( array( 'Reply to Ada Obi', 'mailto:ada@example.com' ), array( 'Open in wp-admin', admin_url( 'edit.php?post_type=majeurs_enquiry' ) ) )
		);
	} else {
		if ( ! class_exists( '\Automattic\WooCommerce\Internal\Admin\EmailPreview\EmailPreview' ) ) {
			return new WP_Error( 'majeurs_no_preview', 'This WooCommerce has no email preview.', array( 'status' => 501 ) );
		}
		$preview = \Automattic\WooCommerce\Internal\Admin\EmailPreview\EmailPreview::instance();
		try {
			$preview->set_email_type( $type );
			$html = $preview->render();
		} catch ( \Throwable $e ) {
			return new WP_Error( 'majeurs_preview_failed', $e->getMessage(), array( 'status' => 400 ) );
		}
	}
	$response = new WP_REST_Response( null, 200 );
	$response->header( 'Content-Type', 'text/html; charset=UTF-8' );
	add_filter( 'rest_pre_serve_request', function ( $served ) use ( $html ) {
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- an email, rendered by WooCommerce
		return true;
	} );
	return $response;
}
