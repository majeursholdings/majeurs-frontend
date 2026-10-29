import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// AvatarCell — avatar/icon + primary text, with an optional subtitle line
// underneath (e.g. a customer's name / email, or a product name / "First
// installment"). Use inside a ColumnDef's `cell`.
// ─────────────────────────────────────────────────────────────────────────────

export interface AvatarCellProps {
    name: ReactNode;
    subtitle?: ReactNode;
    /** Photo URL. Omit to fall back to an initial, or pass `icon` instead. */
    src?: string;
    /** Renders inside a colored circle instead of a photo/initial. */
    icon?: ReactNode;
    /** Background/text classes for the icon circle. Defaults to a green tint. */
    iconClassName?: string;
}

export function AvatarCell({
    name,
    subtitle,
    src,
    icon,
    iconClassName,
}: AvatarCellProps) {
    return (
        <div className="flex items-center gap-3">
            {icon ? (
                <span
                    className={`flex items-center justify-center size-8 rounded-full shrink-0 ${iconClassName ?? "bg-sand-50 text-gold"}`}
                >
                    {icon}
                </span>
            ) : src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt=""
                    className="size-8 rounded-full object-cover shrink-0"
                />
            ) : (
                <span className="flex items-center justify-center size-8 rounded-full bg-sand-50 text-charcoal text-xs font-medium font-sans shrink-0">
                    {typeof name === "string" ? name.slice(0, 1).toUpperCase() : ""}
                </span>
            )}
            <div className="min-w-0">
                <div className="text-sm font-medium font-sans text-ink truncate">
                    {name}
                </div>
                {subtitle && (
                    <div className="text-xs text-grey font-sans truncate">
                        {subtitle}
                    </div>
                )}
            </div>
        </div>
    );
}
