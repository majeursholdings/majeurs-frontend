// Shared by the account forms (client) and the account Server Actions, so keep it free of server imports
import { z } from "zod";

const password = z.string().min(8, "Use at least 8 characters");

export const loginSchema = z.object({
	username: z.string().trim().min(1, "Enter your username or email address"),
	password: z.string().min(1, "Enter your password"),
	remember: z.boolean().default(false),
});

export const registerSchema = z.object({
	email: z.string().trim().email("Please enter a valid email address"),
});

export const lostPasswordSchema = z.object({
	login: z.string().trim().min(1, "Enter your username or email address"),
});

export const resetPasswordSchema = z
	.object({
		key: z.string().min(1),
		id: z.string().optional(),
		login: z.string().optional(),
		password,
		confirm: z.string(),
	})
	.refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

export const accountDetailsSchema = z
	.object({
		first_name: z.string().trim().min(1, "Enter your first name"),
		last_name: z.string().trim().min(1, "Enter your last name"),
		display_name: z.string().trim().min(1, "Enter a display name"),
		email: z.string().trim().email("Please enter a valid email address"),
		current_password: z.string().optional(),
		new_password: z.union([password, z.literal("")]).optional(),
		confirm_password: z.string().optional(),
	})
	.refine((v) => !v.new_password || v.current_password, { message: "Enter your current password", path: ["current_password"] })
	.refine((v) => (v.new_password ?? "") === (v.confirm_password ?? ""), { message: "Passwords don't match", path: ["confirm_password"] });

export const addressSchema = z.object({
	first_name: z.string().trim().min(1, "Enter a first name"),
	last_name: z.string().trim().min(1, "Enter a last name"),
	company: z.string().trim().optional().default(""),
	country: z.string().trim().min(1, "Choose a country"),
	address_1: z.string().trim().min(1, "Enter a street address"),
	address_2: z.string().trim().optional().default(""),
	city: z.string().trim().min(1, "Enter a town or city"),
	state: z.string().trim().optional().default(""),
	postcode: z.string().trim().optional().default(""),
	phone: z.string().trim().optional().default(""),
	email: z.union([z.string().trim().email("Please enter a valid email address"), z.literal("")]).optional().default(""),
});

export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type LostPasswordInput = z.input<typeof lostPasswordSchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
export type AccountDetailsInput = z.input<typeof accountDetailsSchema>;
export type AddressInput = z.input<typeof addressSchema>;

/** What every account Server Action returns */
export type ActionResult = { ok: true; message?: string } | { ok: false; message: string };
