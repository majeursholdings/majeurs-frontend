"use client";

import { toast } from "sonner";
import MainForm from "@/components/customForm";
import type { FormFieldConfig } from "@/components/customForm/types";
import { DataTable, ExportMenu, StatusBadge, exportRows, type ColumnDef } from "@/components/customTable";

/** Every customForm field type, as a quick visual check of the shared form component. */
const fields: FormFieldConfig[] = [
	{ name: "firstName", type: "text", label: "First name", placeholder: "Enter first name", validation: { required: "Enter your first name" } },
	{ name: "lastName", type: "text", label: "Last name", placeholder: "Enter last name", validation: { required: "Enter your last name" } },
	{ name: "email", type: "email", label: "Email", placeholder: "you@example.com", validation: { required: "Enter your email" } },
	{ name: "phone", type: "tel", label: "Phone", placeholder: "+234 800 000 0000" },
	{
		name: "category",
		type: "select",
		label: "Category",
		options: [
			{ label: "Sofas", value: "sofas" },
			{ label: "Beds", value: "beds" },
			{ label: "Tables", value: "tables" },
		],
	},
	{
		name: "country",
		type: "combobox",
		label: "Country",
		options: [
			{ label: "Nigeria", value: "NG" },
			{ label: "Ghana", value: "GH" },
			{ label: "United Kingdom", value: "GB" },
		],
	},
	{ name: "budget", type: "amount", label: "Budget" },
	{ name: "deliveryDate", type: "date", label: "Preferred delivery date" },
	{
		name: "finish",
		type: "radio",
		label: "Finish",
		options: [
			{ label: "Walnut", value: "walnut" },
			{ label: "Oak", value: "oak" },
		],
	},
	{ name: "message", type: "textarea", label: "Message", rows: 4, placeholder: "Tell us about your project" },
	{ name: "references", type: "image", label: "Reference photos", multiple: true, maxFiles: 3 },
	{ name: "consent", type: "checkbox", label: "Send me news about new collections" },
];

type OrderRow = { id: string; order: string; date: string; status: "Processing" | "Completed" | "On hold"; total: number };

const rows: OrderRow[] = [
	{ id: "1", order: "#6120", date: "2026-10-20", status: "Processing", total: 1017 },
	{ id: "2", order: "#6098", date: "2026-09-14", status: "Completed", total: 2025 },
	{ id: "3", order: "#6051", date: "2026-08-02", status: "On hold", total: 460 },
];

const tones = { Processing: "amber", Completed: "green", "On hold": "gray" } as const;

const columns: ColumnDef<OrderRow>[] = [
	{ key: "order", header: "Order" },
	{ key: "date", header: "Date" },
	{ key: "status", header: "Status", cell: (row) => <StatusBadge label={row.status} tone={tones[row.status]} /> },
	{ key: "total", header: "Total", cell: (row) => `$${row.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
];

export function FormAndTableDemo() {
	return (
		<div className="grid gap-12 lg:grid-cols-2">
			<div className="space-y-4">
				<p className="eyebrow">customForm</p>
				<MainForm
					title="Custom order request"
					description="Every field type in the shared form component."
					fields={fields}
					rowPairs={[["email", "phone"]]}
					submitLabel="Send request"
					onSubmit={(values) => {
						toast.success("Form submitted");
						console.info(values);
					}}
				/>
			</div>
			<div className="space-y-4">
				<p className="eyebrow">customTable</p>
				<DataTable
					tableId="demo-orders"
					columns={columns}
					rows={rows}
					showIndex
					toolbar={
						<ExportMenu
							onExport={(format) =>
								exportRows(
									rows,
									[
										{ header: "Order", value: (r) => r.order },
										{ header: "Date", value: (r) => new Date(r.date), kind: "date" },
										{ header: "Status", value: (r) => r.status },
										{ header: "Total", value: (r) => r.total, kind: "money" },
									],
									{ format, filename: "orders", title: "Orders" },
								)
							}
						/>
					}
				/>
			</div>
		</div>
	);
}
