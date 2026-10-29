"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
    useFormContext,
    type Control,
    type FieldValues,
    type Path,
    type PathValue,
    type RegisterOptions,
    type UseFormRegister,
    type UseFormSetValue,
} from "react-hook-form";
import { X, FileText, AlertCircle, Image as ImageIcon, Upload as UploadIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DEFAULT_MAX_FILE_SIZE_MB,
    DOCUMENT_ACCEPT,
    IMAGE_ACCEPT,
    isCsvFile,
    isImageFile,
    getFileKindError,
} from "./fileRules";
import type { FormFieldConfig } from "./types";

/**
 * A file the record already has (e.g. a saved WordPress media item when editing). Kept in the
 * field's value as-is until removed; new picks are plain `File`s.
 */
export type SavedFile = { id: string | number; url: string; name?: string; kind?: "image" | "file" };

/** What a file field's value holds: picked `File`s (sent with the form) and any saved files kept. */
export type FileFieldValue = File | SavedFile;

type FileItem = {
    id: string;
    /** null for a saved file */
    file: File | null;
    saved?: SavedFile;
    name: string;
    size: number;
    previewUrl: string | null;
};

export type FileInputProps<T extends FieldValues = FieldValues> = {
    field: FormFieldConfig;
    register: UseFormRegister<T>;
    error?: string;
    control?: Control<T>;
    getValues?: () => T;
    setValue?: UseFormSetValue<T>;
};

function isSavedFile(value: unknown): value is SavedFile {
    return !!value && typeof value === "object" && "url" in value && "id" in value;
}

/** Saved files the value already holds when the field mounts, shown so they can be kept or removed. */
function savedItemsFrom(value: unknown): FileItem[] {
    const list = Array.isArray(value) ? value : value ? [value] : [];
    return list.filter(isSavedFile).map((saved) => ({
        id: `saved-${saved.id}`,
        file: null,
        saved,
        name: saved.name ?? "Current file",
        size: 0,
        previewUrl: saved.kind === "file" ? null : saved.url,
    }));
}

/**
 * File picker for "file" and "image" fields. Nothing is uploaded from the browser: the picked
 * `File`s stay in the form's value and go to the server with the submit (see toFormData), where
 * the form's own route adds them to the WordPress media library (lib/api/media.ts).
 */
export const FileInput = <T extends FieldValues = FieldValues>({
    field,
    register,
    error,
    getValues,
    setValue,
}: FileInputProps<T>) => {
    const formContext = useFormContext<T>();
    const setValueFn = setValue ?? formContext?.setValue;
    const getValuesFn = getValues ?? formContext?.getValues;

    const [items, setItems] = useState<FileItem[]>(() =>
        savedItemsFrom(getValuesFn ? (getValuesFn() as Record<string, unknown>)[field.name] : null),
    );
    const [fileErrors, setFileErrors] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Only the ref goes on the <input>: the field's value is set from `items`, never the input's FileList
    const { ref } = register(field.name as Path<T>, field.validation as RegisterOptions<T, Path<T>>);

    // Free preview URLs when the field goes away: a ref callback's cleanup runs on unmount (React 19).
    // Stable (no deps) so it doesn't run on every render; itemsRef is kept current by commit().
    const itemsRef = useRef(items);
    const releasePreviewsOnUnmount = useCallback(
        () => () => itemsRef.current.forEach((item) => item.file && item.previewUrl && URL.revokeObjectURL(item.previewUrl)),
        [],
    );

    const icon =
        field.uploadIcon ??
        (field.type === "image" ? <ImageIcon className="size-5 text-grey" /> : <UploadIcon className="size-5 text-grey" />);

    const validateFile = (file: File): string | null => {
        const maxSizeMB = field.maxSizeMB ?? DEFAULT_MAX_FILE_SIZE_MB;
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) return `Exceeds ${maxSizeMB}MB limit (${sizeMB.toFixed(1)}MB)`;

        const kindError = getFileKindError(file, field.type === "image" ? "image" : "file");
        // A "file" field set to take images (or CSV) too lets those through
        if (
            kindError &&
            !(field.type === "file" && field.acceptImages && isImageFile(file)) &&
            !(field.type === "file" && field.acceptCsv && isCsvFile(file))
        ) {
            return field.acceptCsv ? "Only CSV files can be added" : kindError;
        }

        if (field.accept) {
            const tokens = field.accept.split(",").map((t) => t.trim().toLowerCase());
            const mime = file.type.toLowerCase();
            const name = file.name.toLowerCase();
            const matches = tokens.some((token) =>
                token.startsWith(".") ? name.endsWith(token) : token.endsWith("/*") ? mime.startsWith(token.slice(0, -2)) : mime === token,
            );
            if (!matches) return `Unsupported format (${file.type || "file"})`;
        }
        return null;
    };

    const commit = useCallback(
        (next: FileItem[]) => {
            itemsRef.current = next;
            setItems(next);
            const value: FileFieldValue[] = next.map((item) => item.file ?? item.saved!);
            setValueFn?.(field.name as Path<T>, (field.multiple ? value : (value[0] ?? null)) as PathValue<T, Path<T>>, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            });
        },
        [field.name, field.multiple, setValueFn],
    );

    const handleFilesSelected = (picked: File[]) => {
        if (!picked.length) return;
        const errors: string[] = [];
        const valid: File[] = [];
        picked.forEach((file) => {
            const err = validateFile(file);
            if (err) errors.push(`${file.name}: ${err}`);
            else valid.push(file);
        });
        // each pick replaces the last pick's refusals
        setFileErrors(errors);
        if (!valid.length) return;

        const same = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
        const added: FileItem[] = valid.map((file) => ({
            id: `file-${file.name}-${file.size}-${file.lastModified}`,
            file,
            name: file.name,
            size: file.size,
            previewUrl: isImageFile(file) ? URL.createObjectURL(file) : null,
        }));

        let next = field.multiple
            ? [...items, ...added.filter((a) => !items.some((it) => it.file && same(it.file, a.file!)))]
            : added.slice(0, 1);
        if (field.maxFiles) next = next.slice(0, field.maxFiles);

        // free previews that didn't make it in, or were replaced
        [...items, ...added]
            .filter((it) => !next.includes(it) && it.file && it.previewUrl)
            .forEach((it) => URL.revokeObjectURL(it.previewUrl!));
        commit(next);
    };

    const handleRemove = (item: FileItem) => {
        if (item.file && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        commit(items.filter((it) => it.id !== item.id));
    };

    const activeError = fileErrors.length ? `${fileErrors.join(". ")}.` : error;
    const inputId = field.id ?? field.name;

    return (
        <div ref={releasePreviewsOnUnmount} className="flex flex-col gap-3">
            <label
                htmlFor={inputId}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFilesSelected(Array.from(e.dataTransfer.files ?? []));
                }}
                className={cn(
                    "group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-none border-2 border-dashed p-5 transition-colors duration-200",
                    isDragging && "border-black bg-sand-50/50",
                    activeError ? "border-destructive bg-[#FFF5F5]" : "border-sand hover:border-black",
                )}
            >
                {icon}
                <div className="text-center">
                    <span className={cn("font-sans text-sm font-medium", activeError ? "text-destructive" : "text-black group-hover:underline")}>
                        Click to choose
                    </span>
                    <span className="font-sans text-sm text-charcoal"> or drag and drop</span>
                </div>
                {field.description && <span className="text-center font-sans text-xs text-grey">{field.description}</span>}
                {field.maxFiles && (
                    <span className="font-sans text-xs text-charcoal">
                        {items.length}/{field.maxFiles} selected
                    </span>
                )}
                <input
                    id={inputId}
                    type="file"
                    accept={field.accept ?? (field.type === "image" ? IMAGE_ACCEPT : DOCUMENT_ACCEPT)}
                    capture={field.capture}
                    multiple={field.multiple}
                    disabled={field.disabled}
                    className="hidden"
                    ref={ref}
                    onChange={(e) => {
                        handleFilesSelected(Array.from(e.target.files ?? []));
                        // so the same file can be picked again after removing it
                        e.target.value = "";
                    }}
                />
            </label>

            {activeError && (
                <span className="flex items-center gap-1 font-sans text-xs font-normal text-destructive">
                    <AlertCircle className="size-3.5 shrink-0 text-destructive" />
                    {activeError}
                </span>
            )}

            {items.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {items.map((item) => (
                        <div key={item.id} className="relative flex flex-col justify-between overflow-hidden rounded-none border border-sand bg-white">
                            {item.previewUrl && field.showPreview !== false ? (
                                <div className="relative aspect-video w-full overflow-hidden bg-sand-50">
                                    <Image src={item.previewUrl} alt={item.name} fill unoptimized className="object-cover" />
                                </div>
                            ) : (
                                <div className="flex h-24 flex-col items-center justify-center bg-sand-50 text-charcoal">
                                    <FileText className="size-8" />
                                    <span className="mt-1 font-mono text-[10px] font-bold uppercase">{item.name.split(".").pop() || "file"}</span>
                                </div>
                            )}
                            <div className="flex flex-col gap-1 p-2.5">
                                <p className="truncate font-sans text-xs font-semibold text-ink" title={item.name}>
                                    {item.name}
                                </p>
                                <p className="truncate text-[11px] text-charcoal">{item.file ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : "Saved"}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(item)}
                                aria-label={`Remove ${item.name}`}
                                className="absolute top-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded-full border border-sand bg-white text-ink shadow-md transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                                <X className="size-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
