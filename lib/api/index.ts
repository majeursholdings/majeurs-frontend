/** A message safe to show a visitor, from whatever a failed call threw (Error, { message }, or anything else). */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
	if (error instanceof Error && error.message) return error.message;
	if (error && typeof error === "object" && "message" in error && typeof error.message === "string" && error.message) {
		return error.message;
	}
	return fallback;
}
