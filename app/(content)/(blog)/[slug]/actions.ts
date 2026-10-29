"use server";

import { updateTag } from "next/cache";
import { AccountError, hasSession, postComment } from "@/lib/api/account";
import { getErrorMessage } from "@/lib/api";
import type { ActionResult } from "@/lib/account/schemas";
import { commentSchema } from "@/lib/blog/commentSchema";

export async function postCommentAction(input: unknown): Promise<ActionResult> {
	const parsed = commentSchema.safeParse(input);
	if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
	const { first_name, last_name, email, ...rest } = parsed.data;

	const signedIn = await hasSession();
	if (!signedIn && (!first_name || !last_name || !email)) return { ok: false, message: "Please enter your first name, last name and email address." };
	// WordPress keeps one author name per comment
	const author = `${first_name} ${last_name}`;

	try {
		const result = await postComment(signedIn ? rest : { ...rest, author, email });
		if (!result.approved) return { ok: true, message: "Thanks! Your comment is awaiting moderation." };
		updateTag(`comments:${rest.post}`);
		return { ok: true, message: "Your comment has been posted." };
	} catch (error) {
		if (!(error instanceof AccountError)) console.error(error);
		return { ok: false, message: getErrorMessage(error) };
	}
}
