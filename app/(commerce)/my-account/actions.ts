"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import * as account from "@/lib/api/account";
import { getErrorMessage } from "@/lib/api";
import type { RecaptchaProof } from "@/lib/recaptcha/client";
import { checkRecaptcha, recaptchaRejected } from "@/lib/recaptcha/server";
import {
	addressSchema,
	changePasswordSchema,
	loginSchema,
	lostPasswordSchema,
	profileSchema,
	registerSchema,
	resetPasswordSchema,
	type ActionResult,
} from "@/lib/account/schemas";

/** Runs a validated account call, turning any failure into a message the form can show */
async function run(fn: () => Promise<unknown>, message?: string): Promise<ActionResult> {
	try {
		await fn();
		return { ok: true, message };
	} catch (error) {
		if (!(error instanceof account.AccountError)) console.error(error);
		return { ok: false, message: getErrorMessage(error) };
	}
}

const invalid = (error: { issues: { message: string }[] }): ActionResult => ({ ok: false, message: error.issues[0]?.message ?? "Please check the form." });

// The signed-out forms carry reCAPTCHA proof (useRecaptcha on the client); signed-in ones don't need it.

// Setting the session cookie re-renders the current page, so the account appears without a redirect
export async function loginAction(input: unknown, recaptcha: RecaptchaProof): Promise<ActionResult> {
	const parsed = loginSchema.safeParse(input);
	if (!parsed.success) return invalid(parsed.error);
	const check = await checkRecaptcha(recaptcha, "login");
	if (check !== "ok") return recaptchaRejected(check);
	return run(() => account.login(parsed.data.username, parsed.data.password, parsed.data.remember));
}

export async function registerAction(input: unknown, recaptcha: RecaptchaProof): Promise<ActionResult> {
	const parsed = registerSchema.safeParse(input);
	if (!parsed.success) return invalid(parsed.error);
	const check = await checkRecaptcha(recaptcha, "register");
	if (check !== "ok") return recaptchaRejected(check);
	return run(() => account.register(parsed.data.email), "Your account was created. We've emailed you a link to set your password.");
}

export async function lostPasswordAction(input: unknown, recaptcha: RecaptchaProof): Promise<ActionResult> {
	const parsed = lostPasswordSchema.safeParse(input);
	if (!parsed.success) return invalid(parsed.error);
	const check = await checkRecaptcha(recaptcha, "lost_password");
	if (check !== "ok") return recaptchaRejected(check);
	return run(() => account.requestPasswordReset(parsed.data.login));
}

export async function resetPasswordAction(input: unknown, recaptcha: RecaptchaProof): Promise<ActionResult> {
	const parsed = resetPasswordSchema.safeParse(input);
	if (!parsed.success) return invalid(parsed.error);
	const check = await checkRecaptcha(recaptcha, "reset_password");
	if (check !== "ok") return recaptchaRejected(check);
	const { key, id, login, password } = parsed.data;
	return run(() => account.resetPassword({ key, id, login, password }), "Your password has been reset. You can now log in.");
}

export async function logoutAction() {
	await account.logout();
	redirect("/my-account/");
}

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
	const parsed = profileSchema.safeParse(input);
	if (!parsed.success) return invalid(parsed.error);
	const { first_name, last_name } = parsed.data;
	const result = await run(() => account.updateProfile({ first_name, last_name }), "Your name has been updated.");
	if (result.ok) refresh();
	return result;
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
	const parsed = changePasswordSchema.safeParse(input);
	if (!parsed.success) return invalid(parsed.error);
	const { current_password, new_password } = parsed.data;
	return run(() => account.changePassword({ current_password, new_password }), "Your password has been changed.");
}

export async function updateAddressAction(type: "billing" | "shipping", input: unknown): Promise<ActionResult> {
	if (type !== "billing" && type !== "shipping") return { ok: false, message: "Unknown address." };
	const parsed = addressSchema.safeParse(input);
	if (!parsed.success) return invalid(parsed.error);
	const result = await run(() => account.updateAddress(type, parsed.data), "Address changed successfully.");
	if (result.ok) refresh();
	return result;
}
