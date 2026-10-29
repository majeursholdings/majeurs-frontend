"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import MainForm from "@/components/customForm";
import { loginAction, registerAction } from "@/app/(commerce)/my-account/actions";
import { syncWishlist } from "@/components/providers/wishlistProvider";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/account/schemas";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function LoginForm() {
	const methods = useForm<LoginInput>({ mode: "onTouched", resolver: zodResolver(loginSchema), defaultValues: { username: "", password: "", remember: false } });

	const onSubmit = async (values: LoginInput) => {
		const result = await loginAction(values);
		if (!result.ok) {
			toast.error(result.message);
			return;
		}
		trackEvent({ event: "form_submit", form_name: "account_login" });
		// merge anything saved as a guest into the account
		void syncWishlist();
	};

	return (
		<MainForm<LoginInput>
			methods={methods}
			trackingName="account_login"
			hideRequiredMarks
			isLoading={methods.formState.isSubmitting}
			submitLabel="Log in"
			onSubmit={onSubmit}
			fields={[
				{ name: "username", type: "text", label: "Username or email address", autoComplete: "username" },
				{ name: "password", type: "password", label: "Password", autoComplete: "current-password" },
				{
					name: "remember",
					type: "checkbox",
					label: "Remember me",
					trailingSlot: (
						<Link href="/my-account/lost-password/" className="text-sm text-bronze underline underline-offset-4">
							Lost your password?
						</Link>
					),
				},
			]}
		/>
	);
}

export function RegisterForm() {
	const methods = useForm<RegisterInput>({ mode: "onTouched", resolver: zodResolver(registerSchema), defaultValues: { email: "" } });

	const onSubmit = async (values: RegisterInput) => {
		const result = await registerAction(values);
		if (!result.ok) {
			toast.error(result.message);
			return;
		}
		trackEvent({ event: "form_submit", form_name: "account_register" });
		void syncWishlist();
		toast.success(result.message);
	};

	return (
		<MainForm<RegisterInput>
			methods={methods}
			trackingName="account_register"
			hideRequiredMarks
			isLoading={methods.formState.isSubmitting}
			submitLabel="Register"
			onSubmit={onSubmit}
			fields={[{ name: "email", type: "email", label: "Email address", autoComplete: "email" }]}
			footerSlot={
				<p className="text-xs text-charcoal">
					Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other
					purposes described in our{" "}
					<Link href="/privacy-policy/" className="text-bronze underline">
						privacy policy
					</Link>
					.
				</p>
			}
		/>
	);
}

type Mode = "login" | "register";

const copy: Record<Mode, { eyebrow: string; title: string; text: string; switchText: string; switchLabel: string }> = {
	login: {
		eyebrow: "Welcome back",
		title: "Log in to your account",
		text: "Track orders, manage your addresses and check out faster.",
		switchText: "New to Majeurs?",
		switchLabel: "Create an account",
	},
	register: {
		eyebrow: "New to Majeurs",
		title: "Create an account",
		text: "Enter your email and we'll send you a link to set your password.",
		switchText: "Already have an account?",
		switchLabel: "Log in",
	},
};

/** Signed-out view of every account page: one card, Log in / Register tabs, one form at a time */
export function AuthForms() {
	const [mode, setMode] = useState<Mode>("login");
	const text = copy[mode];
	const other: Mode = mode === "login" ? "register" : "login";

	return (
		<div className="mx-auto w-full max-w-md md:pt-6">
			<div role="tablist" aria-label="Account" className="grid grid-cols-2 border-b border-sand">
				{(["login", "register"] as const).map((m) => (
					<button
						key={m}
						type="button"
						role="tab"
						id={`auth-tab-${m}`}
						aria-selected={mode === m}
						aria-controls="auth-panel"
						onClick={() => setMode(m)}
						className={cn(
							"-mb-px border-b-2 py-3 text-sm uppercase tracking-button transition-colors duration-300",
							mode === m ? "border-gold text-black" : "border-transparent text-grey hover:text-black",
						)}
					>
						{m === "login" ? "Log in" : "Register"}
					</button>
				))}
			</div>

			<div id="auth-panel" role="tabpanel" aria-labelledby={`auth-tab-${mode}`} className="border border-t-0 border-sand p-6 md:p-10">
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={mode}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
						className="space-y-8"
					>
						<div className="space-y-2">
							<p className="eyebrow">{text.eyebrow}</p>
							<h1 className="text-h4">{text.title}</h1>
							<p className="text-sm text-charcoal">{text.text}</p>
						</div>

						{mode === "login" ? <LoginForm /> : <RegisterForm />}

						<p className="border-t border-sand pt-6 text-center text-sm text-charcoal">
							{text.switchText}{" "}
							<button type="button" onClick={() => setMode(other)} className="text-black underline underline-offset-4 hover:text-gold">
								{text.switchLabel}
							</button>
						</p>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}
