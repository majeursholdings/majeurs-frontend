import Link from "next/link";

/** "Legal/terms of use" line under every enquiry form (as on WP) */
export function LegalNote({ purpose = "your request" }: { purpose?: string }) {
	return (
		<div className="space-y-2 text-xs text-charcoal">
			<p className="uppercase tracking-button text-black">Legal/terms of use</p>
			<p>
				The personal information you provide through the above form will be processed only for the purpose of dealing with {purpose}. For more
				information on how we process your personal data, please read our{" "}
				<Link href="/privacy-policy/" className="text-black underline">
					Privacy Policy
				</Link>{" "}
				or{" "}
				<Link href="/terms-of-use/" className="text-black underline">
					Terms of Use
				</Link>
				.
			</p>
		</div>
	);
}

export default LegalNote;
