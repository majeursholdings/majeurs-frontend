"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import MainForm from "@/components/customForm";
import { lostPasswordAction, resetPasswordAction } from "@/app/(commerce)/my-account/actions";
import { lostPasswordSchema, resetPasswordSchema, type LostPasswordInput, type ResetPasswordInput } from "@/lib/account/schemas";

export function LostPasswordForm() {
	const [sent, setSent] = useState(false);
	const methods = useForm<LostPasswordInput>({ mode: "onTouched", resolver: zodResolver(lostPasswordSchema), defaultValues: { login: "" } });

	if (sent) {
		return (
			<div className="space-y-3">
				<p className="text-black">Password reset email has been sent.</p>
				<p className="text-sm text-charcoal">
					If an account matches what you entered, we&apos;ve emailed a link to reset your password. It may take a few minutes to arrive; please
					check your spam folder too.
				</p>
			</div>
		);
	}

	return (
		<MainForm<LostPasswordInput>
			methods={methods}
			description="Lost your password? Please enter your username or email address. You will receive a link to create a new password via email."
			hideRequiredMarks
			isLoading={methods.formState.isSubmitting}
			submitLabel="Reset password"
			onSubmit={async (values) => {
				const result = await lostPasswordAction(values);
				if (result.ok) setSent(true);
				else toast.error(result.message);
			}}
			fields={[{ name: "login", type: "text", label: "Username or email", autoComplete: "username" }]}
		/>
	);
}

/** From the emailed link: /my-account/lost-password/?key=…&id=… (or &login=… for a new account) */
export function ResetPasswordForm({ resetKey, id, login }: { resetKey: string; id?: string; login?: string }) {
	const [done, setDone] = useState(false);
	const methods = useForm<ResetPasswordInput>({
		mode: "onTouched",
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { key: resetKey, id, login, password: "", confirm: "" },
	});

	if (done) {
		return (
			<div className="space-y-4">
				<p className="text-black">Your password has been reset.</p>
				<Link href="/my-account/" className="btn border-black bg-black text-white hover:bg-ink">
					Log in
				</Link>
			</div>
		);
	}

	return (
		<MainForm<ResetPasswordInput>
			methods={methods}
			description="Enter a new password below."
			hideRequiredMarks
			isLoading={methods.formState.isSubmitting}
			submitLabel="Save"
			onSubmit={async (values) => {
				const result = await resetPasswordAction(values);
				if (result.ok) setDone(true);
				else toast.error(result.message);
			}}
			fields={[
				{ name: "password", type: "password", label: "New password", autoComplete: "new-password" },
				{ name: "confirm", type: "password", label: "Re-enter new password", autoComplete: "new-password" },
			]}
		/>
	);
}
