"use client";

import { createContext, useContext } from "react";
import { whatsappLink, type Contact } from "@/lib/contact";

const ContactContext = createContext<Contact | null>(null);

/** Hands wp-admin > Site content > Contact details (read once in app/layout.tsx) to client components */
export function ContactProvider({ contact, children }: { contact: Contact; children: React.ReactNode }) {
	return <ContactContext value={contact}>{children}</ContactContext>;
}

/** Phone, WhatsApp, email and social accounts, plus a wa.me link builder for the WhatsApp number */
export function useContact() {
	const contact = useContext(ContactContext);
	if (!contact) throw new Error("useContact needs <ContactProvider> (app/layout.tsx)");
	return { ...contact, whatsappLink: (text?: string) => whatsappLink(contact.whatsapp, text) };
}
