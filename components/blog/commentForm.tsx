"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import MainForm from "@/components/customForm";
import type { FormFieldConfig } from "@/components/customForm/types";
import { postCommentAction } from "@/app/(content)/(blog)/[slug]/actions";
import { commentSchema, type CommentInput } from "@/lib/blog/commentSchema";
import { RecaptchaNote } from "@/components/common/recaptchaNote";
import { useRecaptcha } from "@/components/common/recaptchaChallenge";

/** WP "Leave a Reply": comment only when signed in, plus name + email for guests */
export function CommentForm({ postId, signedInAs }: { postId: number; signedInAs?: string }) {
	const methods = useForm<CommentInput>({
		mode: "onTouched",
		resolver: zodResolver(commentSchema),
		defaultValues: { post: postId, parent: 0, comment: "", first_name: "", last_name: "", email: "" },
	});
	const recaptcha = useRecaptcha("comment");

	const fields: FormFieldConfig[] = [
		{ name: "comment", type: "textarea", label: "Comment", rows: 7, validation: { required: true } },
		...(signedInAs
			? []
			: ([
					{ name: "first_name", type: "text", label: "First name", autoComplete: "given-name", validation: { required: true } },
					{ name: "last_name", type: "text", label: "Last name", autoComplete: "family-name", validation: { required: true } },
					{ name: "email", type: "email", label: "Email", autoComplete: "email", validation: { required: true } },
				] satisfies FormFieldConfig[])),
	];

	return (
		<div className="space-y-4 bg-white p-6 md:p-8">
			<h3 className="text-base text-black">Leave a Reply</h3>
			<p className="text-xs text-charcoal">
				{signedInAs ? (
					<>
						Logged in as {signedInAs}.{" "}
						<Link href="/my-account/edit-account/" className="text-bronze underline">
							Edit your profile
						</Link>
						.{" "}
					</>
				) : (
					"Your email address will not be published. "
				)}
				Required fields are marked <span className="text-destructive">*</span>
			</p>
			<MainForm<CommentInput>
				methods={methods}
				requireValidToSubmit={false}
				isLoading={methods.formState.isSubmitting}
				submitLabel="Post comment"
				rowPairs={[["first_name", "last_name"]]}
				onSubmit={async (values) => {
					const result = await recaptcha.send((proof) => postCommentAction(values, proof));
					if (!result.ok) {
						toast.error(result.message);
						return;
					}
					toast.success(result.message);
					methods.reset({ ...values, comment: "" });
				}}
				fields={fields}
				footerSlot={
					<>
						{recaptcha.checkbox}
						<RecaptchaNote />
					</>
				}
			/>
		</div>
	);
}
