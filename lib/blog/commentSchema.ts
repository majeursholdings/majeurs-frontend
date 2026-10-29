// Shared by the comment form (client) and its Server Action, so keep it free of server imports
import { z } from "zod";

/** Names and email are only required from guests; the action checks that against the session and joins the names for WP. */
export const commentSchema = z.object({
	post: z.number().int().positive(),
	parent: z.number().int().min(0).default(0),
	comment: z.string().trim().min(2, "Write your comment").max(5000, "Keep your comment under 5,000 characters"),
	first_name: z.string().trim().max(120).optional().default(""),
	last_name: z.string().trim().max(120).optional().default(""),
	email: z.union([z.string().trim().email("Please enter a valid email address"), z.literal("")]).optional().default(""),
});

export type CommentInput = z.input<typeof commentSchema>;
