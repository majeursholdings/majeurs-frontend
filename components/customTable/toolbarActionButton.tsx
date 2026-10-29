import type { ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ToolbarActionButton — the solid "+ Add an address" / "+ New request"
// button anchored to the right of the toolbar via TableToolbar's `actions`.
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolbarActionButtonProps {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: ReactNode;
    /** Greyed out and not clickable (a button only), e.g. until something else is set up. */
    disabled?: boolean;
}

export function ToolbarActionButton({
    label,
    onClick,
    href,
    icon,
    disabled = false,
}: ToolbarActionButtonProps) {
    const className =
        "inline-flex items-center gap-2 px-4 py-2 rounded-none bg-black hover:bg-ink text-white text-sm font-medium font-sans transition-colors cursor-pointer whitespace-nowrap disabled:cursor-not-allowed disabled:bg-sand disabled:text-charcoal";
    const content = (
        <>
            {icon ?? <Plus className="size-4" />}
            {label}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} disabled={disabled} className={className}>
            {content}
        </button>
    );
}
