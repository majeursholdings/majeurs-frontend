"use client";

import { Menu } from "@base-ui/react/menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectFilterItem } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// OptionsMenu — the "All ⌄" button and its list of options, behind every
// table filter and sort (SelectFilter, DateSortFilter) and SortByDropdown.
// The list is placed against the button and kept inside the viewport: it
// opens above when there's no room below, and slides in from an edge rather
// than poking past it — wherever the button ends up in a wrapped toolbar.
// ─────────────────────────────────────────────────────────────────────────────

export function OptionsMenu({
    items,
    value,
    onChange,
    resetLabel,
    align = "end",
}: {
    items: SelectFilterItem[];
    /** The chosen item's value — "" for none. */
    value: string;
    onChange: (value: string) => void;
    /** The first option, which clears the choice — and the button's text while nothing's chosen. */
    resetLabel: string;
    /** The button edge the list lines up with, when there's room. */
    align?: "start" | "end";
}) {
    const activeLabel = items.find((item) => item.value === value)?.label ?? resetLabel;
    const options = [{ label: resetLabel, value: "" }, ...items];

    return (
        <Menu.Root modal={false}>
            <Menu.Trigger
                className={cn(
                    "group flex items-center gap-2 px-3 py-2 rounded-none text-xs font-medium font-sans cursor-pointer",
                    "border transition-all duration-300 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
                    value
                        ? "bg-sand-50 border-black text-black"
                        : "bg-sand-50 border-sand text-black/50 hover:border-grey",
                )}
            >
                {activeLabel}
                <ChevronDown
                    className="size-3.5 transition-transform duration-200 group-data-popup-open:rotate-180"
                    aria-hidden
                />
            </Menu.Trigger>
            <Menu.Portal>
                <Menu.Positioner side="bottom" align={align} sideOffset={4} collisionPadding={16} className="z-50 outline-none">
                    <Menu.Popup className="max-h-(--available-height) min-w-35 origin-(--transform-origin) overflow-y-auto rounded-none border border-sand bg-white py-1 shadow-lg outline-none transition-[opacity,scale] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                        <Menu.RadioGroup value={value} onValueChange={(next) => onChange(String(next))}>
                            {options.map((option) => (
                                <Menu.RadioItem
                                    key={option.value}
                                    value={option.value}
                                    closeOnClick
                                    className="w-full px-3 py-2 text-left text-xs font-sans whitespace-nowrap text-ink outline-none transition-colors cursor-pointer data-highlighted:bg-sand-50 data-checked:bg-sand-50 data-checked:text-black"
                                >
                                    {option.label}
                                </Menu.RadioItem>
                            ))}
                        </Menu.RadioGroup>
                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
    );
}
