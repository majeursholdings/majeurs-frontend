// Server-only: checks the reCAPTCHA proof a form sent (lib/recaptcha/client.ts) with Google.
// RECAPTCHA_SECRET_KEY unset = checks are off (local dev). RECAPTCHA_MIN_SCORE: 0–1, default 0.5.
// RECAPTCHA_V2_SECRET_KEY set = a low v3 score gets the v2 checkbox instead of a rejection.

import type { ActionResult } from "@/lib/account/schemas";
import { RECAPTCHA_CHALLENGE, RECAPTCHA_FAILED } from "./client";

export { RECAPTCHA_FAILED };

type SiteVerify = { success: boolean; score?: number; action?: string; hostname?: string; "error-codes"?: string[] };

/** "challenge": a real v3 token that scored too low, so the visitor can prove themselves with the v2 checkbox */
export type RecaptchaCheck = "ok" | "challenge" | "failed";

async function siteVerify(secret: string, token: string): Promise<SiteVerify | null> {
	try {
		const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
			method: "POST",
			body: new URLSearchParams({ secret, response: token }),
			cache: "no-store",
			signal: AbortSignal.timeout(10_000),
		});
		return await res.json();
	} catch (error) {
		console.error("reCAPTCHA verify failed", error);
		return null;
	}
}

export async function checkRecaptcha(proof: unknown, action: string): Promise<RecaptchaCheck> {
	const secret = process.env.RECAPTCHA_SECRET_KEY;
	if (!secret) {
		if (process.env.NODE_ENV === "production") console.warn("RECAPTCHA_SECRET_KEY is not set: forms are not protected");
		return "ok";
	}
	const v2Secret = process.env.RECAPTCHA_V2_SECRET_KEY;

	// the v2 checkbox, ticked after a challenge
	if (proof && typeof proof === "object" && "v2" in proof) {
		const token = proof.v2;
		if (!v2Secret || typeof token !== "string" || !token) return "failed";
		const data = await siteVerify(v2Secret, token);
		// Google unreachable: let the submit through rather than lose a real enquiry (the honeypot still applies)
		if (!data) return "ok";
		if (!data.success) console.warn("reCAPTCHA v2 rejected", { action, errors: data["error-codes"], hostname: data.hostname });
		return data.success ? "ok" : "failed";
	}

	if (typeof proof !== "string" || !proof) return "failed";
	const data = await siteVerify(secret, proof);
	if (!data) return "ok";

	const minScore = Number(process.env.RECAPTCHA_MIN_SCORE ?? 0.5);
	const genuine = data.success && data.action === action;
	if (genuine && (data.score ?? 0) >= minScore) return "ok";
	console.warn("reCAPTCHA rejected", { action, got: data.action, score: data.score, errors: data["error-codes"], hostname: data.hostname });
	return genuine && v2Secret ? "challenge" : "failed";
}

/** The form's response when checkRecaptcha isn't "ok" */
export const recaptchaRejected = (check: RecaptchaCheck): ActionResult =>
	check === "challenge" ? { ok: false, challenge: true, message: RECAPTCHA_CHALLENGE } : { ok: false, message: RECAPTCHA_FAILED };
