"use client";

import { useState } from "react";
import type { ActionResult } from "@/lib/account/schemas";
import { RECAPTCHA_V2_SITE_KEY, loadRecaptcha, recaptchaToken, type RecaptchaProof } from "@/lib/recaptcha/client";

/**
 * reCAPTCHA for one form. `send` runs the form's action with a fresh v3 token; if the server answers
 * `challenge` (score too low), `checkbox` becomes the v2 "I'm not a robot" box, and the next submit sends
 * its token instead. Put `checkbox` above the submit button (MainForm's footerSlot).
 *
 *   const recaptcha = useRecaptcha("login");
 *   const result = await recaptcha.send((proof) => loginAction(values, proof));
 *   <MainForm footerSlot={recaptcha.checkbox} … />
 */
export function useRecaptcha(action: string) {
	const [challenge, setChallenge] = useState(false);
	const [v2Token, setV2Token] = useState("");
	// a v2 token works once: remount the checkbox after each use
	const [round, setRound] = useState(0);

	const send = async <R extends ActionResult>(call: (proof: RecaptchaProof) => Promise<R>): Promise<R> => {
		if (challenge && !v2Token) return { ok: false, message: "Please tick “I'm not a robot” first." } as R;
		const result = await call(challenge ? { v2: v2Token } : await recaptchaToken(action));
		if (challenge) {
			setV2Token("");
			setRound((r) => r + 1);
		}
		// no v2 site key here: nothing to tick, so it's a plain failure
		if (!result.ok && result.challenge && !RECAPTCHA_V2_SITE_KEY) return { ...result, challenge: undefined } as R;
		setChallenge(!result.ok && (result.challenge === true || challenge));
		return result;
	};

	const checkbox = challenge ? <Checkbox key={round} onChange={setV2Token} /> : null;
	return { send, checkbox };
}

function Checkbox({ onChange }: { onChange: (token: string) => void }) {
	return (
		<div
			className="min-h-[78px]"
			ref={(el) => {
				if (!el) return;
				loadRecaptcha()
					.then((grecaptcha) => {
						// the ref runs again on re-render; draw the box only once
						if (el.isConnected && !el.hasChildNodes()) {
							grecaptcha.render(el, { sitekey: RECAPTCHA_V2_SITE_KEY, callback: onChange, "expired-callback": () => onChange(""), "error-callback": () => onChange("") });
						}
					})
					.catch(() => {});
			}}
		/>
	);
}
