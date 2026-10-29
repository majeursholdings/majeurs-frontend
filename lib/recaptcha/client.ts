// reCAPTCHA for the public forms: v3 (invisible, score-based) on every submit, and the v2 "I'm not a robot"
// checkbox as a second chance when v3 scores the visitor too low (components/common/recaptchaChallenge.tsx).
// Server side: lib/recaptcha/server.ts. Google's script loads on first use, not on every page.

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
export const RECAPTCHA_V2_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY ?? "";

export const RECAPTCHA_FAILED = "We couldn't confirm you're not a robot. Please refresh the page and try again, or chat with us on WhatsApp.";
export const RECAPTCHA_CHALLENGE = "One more step: tick “I'm not a robot” below, then submit again.";

/** What a form sends with its submit: a v3 token, or the v2 checkbox's token after a challenge */
export type RecaptchaProof = string | { v2: string };

type RenderOptions = { sitekey: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void };
type Grecaptcha = {
	ready: (cb: () => void) => void;
	execute: (siteKey: string, options: { action: string }) => Promise<string>;
	render: (container: HTMLElement, options: RenderOptions) => number;
};

declare global {
	interface Window {
		grecaptcha?: Grecaptcha;
	}
}

let loading: Promise<Grecaptcha> | undefined;

/** Loads Google's script once. The v3 script can also draw the v2 checkbox. */
export function loadRecaptcha(): Promise<Grecaptcha> {
	loading ??= new Promise<Grecaptcha>((resolve, reject) => {
		const script = document.createElement("script");
		script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(RECAPTCHA_SITE_KEY)}`;
		script.async = true;
		script.onload = () => (window.grecaptcha ? window.grecaptcha.ready(() => resolve(window.grecaptcha!)) : reject(new Error("reCAPTCHA missing")));
		script.onerror = () => {
			loading = undefined; // let the next submit try again
			script.remove();
			reject(new Error("reCAPTCHA failed to load"));
		};
		document.head.appendChild(script);
	});
	return loading;
}

/** Start loading early, e.g. onFocusCapture on a long form, so the submit doesn't wait for it */
export function preloadRecaptcha() {
	if (RECAPTCHA_SITE_KEY) loadRecaptcha().catch(() => {});
}

/**
 * A fresh v3 token for this submit (tokens expire after 2 minutes, so get one per submit).
 * Returns "" when reCAPTCHA isn't set up or is blocked; the server then rejects the submit with a message.
 * `action`: letters, digits and underscores only; the server checks it matches.
 */
export async function recaptchaToken(action: string): Promise<string> {
	if (!RECAPTCHA_SITE_KEY) return "";
	try {
		const grecaptcha = await loadRecaptcha();
		return await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
	} catch {
		return "";
	}
}

/** reCAPTCHA action names allow only letters, digits, "_" and "/": "plan-a-visitation" -> "enquiry_plan_a_visitation" */
export const enquiryAction = (form: string) => `enquiry_${form.replace(/-/g, "_")}`;
