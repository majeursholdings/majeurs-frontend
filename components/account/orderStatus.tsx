import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
	completed: "bg-[#e6f4ea] text-[#1e6b34]",
	processing: "bg-cream text-bronze",
	"on-hold": "bg-cream text-bronze",
	pending: "bg-sand-50 text-charcoal",
	cancelled: "bg-[#fbe9e8] text-destructive",
	failed: "bg-[#fbe9e8] text-destructive",
	refunded: "bg-sand-50 text-charcoal",
};

/** WooCommerce order status as a small label */
export function OrderStatus({ status, label }: { status: string; label: string }) {
	return <span className={cn("inline-block px-2 py-0.5 text-xs", tones[status] ?? "bg-sand-50 text-charcoal")}>{label}</span>;
}
