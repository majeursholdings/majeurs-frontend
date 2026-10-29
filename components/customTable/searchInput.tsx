"use client";

import { useContext, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";
import { TableIdContext, useTableParam } from "./tableContext";

// ─────────────────────────────────────────────────────────────────────────────
// SearchInput
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchInputProps {
    placeholder?: string;
    paramKey?: string;
}

export function SearchInput({
    placeholder = "Search...",
    paramKey = "search",
}: SearchInputProps) {
    const tableId = useContext(TableIdContext);
    const { getParam, setParam } = useTableParam(tableId);
    const urlValue = getParam(paramKey) ?? "";
    // What's typed shows at once; the address (which every table and filter
    // on the page reads) follows a moment after typing stops, so each
    // keystroke doesn't re-render the page
    const [value, setValue] = useState(urlValue);
    const [syncedUrlValue, setSyncedUrlValue] = useState(urlValue);
    if (urlValue !== syncedUrlValue) {
        // Changed from elsewhere (back button, a link, "clear filters"): show that
        setSyncedUrlValue(urlValue);
        setValue(urlValue);
    }
    const writeToUrl = useDebouncedCallback((next: string) => setParam(paramKey, next), 250);

    return (
        <div className="relative flex items-center w-full max-w-sm">
            <Search className="absolute left-3 size-4 text-grey pointer-events-none shrink-0" />
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    writeToUrl(e.target.value);
                }}
                placeholder={placeholder}
                className={[
                    "w-full pl-9 pr-4 py-2 rounded-xs cursor-pointer",
                    "bg-sand-50 border border-sand",
                    "text-xs text-black/50 placeholder:text-grey font-sans",
                    "outline-none focus:bg-white focus:border-black focus:ring-2 focus:ring-gold/20",
                    "transition-all duration-300",
                ].join(" ")}
            />
        </div>
    );
}
