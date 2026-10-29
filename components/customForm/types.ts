import { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { DeepPartialSkipArrayKey, FieldValues, RegisterOptions, UseFormReturn } from "react-hook-form";
import type { TrackedFormName } from "@/lib/analytics";

export type FieldType =
    | "text"
    | "email"
    | "password"
    | "tel"
    | "search"
    | "number"
    | "number-dollar"
    | "amount" // money — digits only, shown as "$3,000"; the value is the digit string
    | "textarea"
    | "select"
    | "combobox" // a select you can type into to filter its options
    | "multiselect"
    | "radio"
    | "date"
    | "datetime"
    | "file"
    | "image"
    | "checkbox";

export type SelectOption = {
    label: string;
    value: string;
};

export type FormFieldConfig = {
    name: string;
    /** DOM id; MainForm sets a unique one per form so the same form can appear twice on a page. Defaults to `name`. */
    id?: string;
    type: FieldType;
    label?: ReactNode; // string, or JSX (e.g. a checkbox label with an inline link)
    placeholder?: string;
    description?: string; // helper text below the field
    icon?: ReactNode; // optional leading icon for text inputs
    uploadIcon?: ReactNode; // custom icon for file/image upload
    accept?: string; // for file/image — narrows what the field takes, e.g. "image/png, image/jpeg" (see fileRules.ts)
    multiple?: boolean; // for file upload
    options?: SelectOption[]; // for select / combobox / multiselect / radio fields
    maxSelections?: number; // for multiselect — caps how many options can be chosen
    // For async select / combobox fields — the field suspends until it
    // resolves, so return the same (cached) promise on every call.
    loadOptions?: () => Promise<SelectOption[]>;
    emptyMessage?: string; // for combobox — shown when no option matches the search
    currencySymbol?: string; // for amount — defaults to DEFAULT_CURRENCY_SYMBOL ($)
    rows?: number; // for textarea
    height?: number;
    min?: number | string;
    max?: number | string;
    step?: number;
    minDate?: Date | string; // for date/datetime — disables earlier dates
    maxDate?: Date | string; // for date — disables later dates
    isDateDisabled?: (date: Date) => boolean;
    autoComplete?: string;
    autoFocus?: boolean; // e.g. the header search, focused as its panel opens
    inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"]; // e.g. "numeric" for a phone or order number
    /**
     * Extra attributes for a text-like <input>, e.g. combobox ARIA and key handlers (the search suggestions).
     * MainForm's own name, value, onChange, onBlur and ref always win.
     */
    inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type" | "value" | "defaultValue" | "onChange" | "onBlur">;
    maxLength?: number;
    readOnly?: boolean; // shown but not editable — e.g. a value filled in by a lookup
    validation?: RegisterOptions;
    defaultValue?: string | number | boolean;
    className?: string;
    disabled?: boolean;
    capture?: "user" | "environment";
    maxFiles?: number;
    maxSizeMB?: number; // per file — defaults to DEFAULT_MAX_FILE_SIZE_MB (5MB)
    showPreview?: boolean;
    clearable?: boolean; // for select — an × in the field clears the choice
    trailingSlot?: ReactNode; // e.g. a "Forgot password?" link next to a checkbox
    /** For a "file" field: take images as well as documents (e.g. a floor plan as a photo or a PDF). */
    acceptImages?: boolean;
    /** For a "file" field: take a CSV file (with `accept: CSV_ACCEPT`), e.g. for an import the server reads. */
    acceptCsv?: boolean;
};

export type MainFormProps<T extends FieldValues = FieldValues> = {
    title?: string;
    description?: string;
    fields: FormFieldConfig[];
    onSubmit: (values: T) => void | Promise<void>;
    submitLabel?: string;
    isLoading?: boolean;
    className?: string;
    rowPairs?: [string, string][];
    footerSlot?: ReactNode | ((values: DeepPartialSkipArrayKey<T>) => ReactNode);
    /** Bring your own react-hook-form instance — lets several MainForm/field
     * groups (e.g. steps of a wizard) share one form so values and validation
     * persist as steps mount/unmount. Falls back to an internal instance. */
    methods?: UseFormReturn<T>;
    /** Disable the submit button until every required field currently holds a
     * value (checked on each render from live field values, not on submit).
     * @default true */
    requireValidToSubmit?: boolean;
    /** Replace the default full-width submit button with custom footer
     * actions (e.g. a Back + Continue row). Receives the same loading/submit
     * readiness state the default button would use. */
    renderFooter?: (state: { isLoading: boolean; canSubmit: boolean }) => ReactNode;
    /** gap-* classes for the space between fields, and between the two fields of a
     * row pair — e.g. "gap-6 md:gap-y-8 md:gap-x-6" for a roomier form.
     * @default "gap-4" */
    fieldGapClassName?: string;
    /** Leave the red asterisk off required fields' labels — e.g. a login form, where every field is required.
     * @default false */
    hideRequiredMarks?: boolean;
    /** Sends form_start to analytics the first time someone focuses a field
     * (with consent). Submissions are tracked by the form's own handler, which
     * knows whether it worked. */
    trackingName?: TrackedFormName;
    /** "inline" puts the fields and the footer on one row (e.g. a search bar: input + square button).
     * @default "stacked" */
    layout?: "stacked" | "inline";
};