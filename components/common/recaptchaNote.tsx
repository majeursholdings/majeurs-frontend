import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha/client";

/** Google's required wording when the floating reCAPTCHA badge is hidden (app/globals.css). Nothing when reCAPTCHA is off. */
export function RecaptchaNote({ className = "text-xs text-charcoal" }: { className?: string }) {
	if (!RECAPTCHA_SITE_KEY) return null;
	return (
		<p className={className}>
			This site is protected by reCAPTCHA and the Google{" "}
			<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
				Privacy Policy
			</a>{" "}
			and{" "}
			<a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
				Terms of Service
			</a>{" "}
			apply.
		</p>
	);
}
