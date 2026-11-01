"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircle, Lock } from "lucide-react";
import MainForm from "@/components/customForm";
import type { StoreAddress } from "@/lib/api/cart";
import { goToNextStep, payOrder, unlockOrder, type PaymentHandle } from "@/lib/checkout/client";
import { ADDRESS_FIELDS, type CheckoutValues } from "@/lib/checkout/schema";
import { PaymentMethods, availableMethods } from "./paymentMethods";

/** Gateways offered for paying an existing order; the currency rules in availableMethods still apply */
const GATEWAYS = ["paystack", "stripe"];

type PayForOrderProps = {
	orderId: number;
	orderKey: string;
	total: string;
	totalMinor: number;
	currency: string;
	billingAddress: StoreAddress & { email: string };
};

/** The order's billing details in the checkout form's shape, for the card form's billing details */
function billingValues(address: PayForOrderProps["billingAddress"], paymentMethod: string): CheckoutValues {
	const billing = Object.fromEntries(ADDRESS_FIELDS.map((f) => [`b_${f}`, address[f] ?? ""]));
	return { email: address.email, delivery: "pickup", sameBilling: false, note: "", newsletter: false, payment_method: paymentMethod, b_country: address.country, ...billing } as CheckoutValues;
}

/** Order-pay: choose a payment method and pay for an order that's waiting for payment */
export function PayForOrder({ orderId, orderKey, total, totalMinor, currency, billingAddress }: PayForOrderProps) {
	const gateways = availableMethods(GATEWAYS, currency);
	const [method, setMethod] = useState(gateways[0]?.id ?? "");
	const [paying, setPaying] = useState(false);
	const handle = useRef<PaymentHandle>(null);

	const pay = async () => {
		setPaying(true);
		try {
			const gateway = method === "stripe" ? handle.current : null;
			const paymentData = (await gateway?.prepare?.(billingValues(billingAddress, method), { amount: totalMinor, currency })) ?? [];
			const placed = await payOrder({ orderId, orderKey, paymentMethod: method, paymentData });
			await (gateway?.complete ? gateway.complete(placed) : goToNextStep(placed));
		} catch (error) {
			setPaying(false);
			toast.error((error as Error).message);
		}
	};

	return (
		<section className="space-y-4">
			<h2 className="text-h4">Payment</h2>
			<PaymentMethods methods={gateways} value={method} onChange={setMethod} amount={totalMinor} currency={currency} handleRef={handle} disabled={paying} />
			<button type="button" onClick={pay} disabled={paying || !method} className="btn w-full border-black bg-black text-white hover:border-gold hover:bg-gold disabled:opacity-60">
				{paying ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
				{paying ? "Processing…" : `Pay ${total}`}
			</button>
		</section>
	);
}

const unlockSchema = z.object({ email: z.string().trim().email("Please enter a valid email address") });
type UnlockInput = z.input<typeof unlockSchema>;

/** For an order link opened in another browser: the billing email proves it's theirs (as WooCommerce asks) */
export function OrderAccessForm({ orderId, orderKey }: { orderId: number; orderKey: string }) {
	const router = useRouter();
	const methods = useForm<UnlockInput>({ mode: "onTouched", resolver: zodResolver(unlockSchema), defaultValues: { email: "" } });

	const onSubmit = async ({ email }: UnlockInput) => {
		try {
			await unlockOrder({ orderId, orderKey, email });
			router.refresh();
		} catch (error) {
			toast.error((error as Error).message);
		}
	};

	return (
		<MainForm<UnlockInput>
			methods={methods}
			requireValidToSubmit={false}
			isLoading={methods.formState.isSubmitting}
			submitLabel="Continue"
			onSubmit={onSubmit}
			fields={[{ name: "email", type: "email", label: "Email address", autoComplete: "email", description: "The email address you used for this order.", validation: { required: true } }]}
		/>
	);
}
