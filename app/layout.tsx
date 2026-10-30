import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { helveticaNeue, nordique } from "./fonts";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/providers/cartProvider";
import { SITE_URL } from "@/lib/contact";
import "./globals.css";


export const metadata: Metadata = {
	// Resolves every page's relative canonical and Open Graph URLs
	metadataBase: new URL(SITE_URL),
	title: {
		default: "Majeurs | We Build Furniture For Scale",
		template: "%s | Majeurs",
	},
	description:
		"Majeurs designs and handcrafts furniture in Lagos: sofas, beds, dining and office pieces, made to order with up to 12-month warranty.",
	applicationName: "Majeurs",
	openGraph: {
		siteName: "Majeurs",
		locale: "en_NG",
		type: "website",
	},
};

export const viewport: Viewport = {
	themeColor: "#000000",
};

/**
 * Root layout: header + footer on every page.
 * Page-group layouts add the shell for each kind of page:
 *   (shop)/(catalog)   shop, category, tag, search: hero + filters + CTA + newsletter
 *   (shop)/(product)   product page
 *   (content)/(landing) full-width marketing pages
 *   (content)/(blog)   blog index, posts, categories: hero + sidebar
 *   (content)/(legal)  policy documents
 *   (content)/(confirmation) form thank-you pages
 *   (commerce)         cart, checkout, my-account (noindex)
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={`${helveticaNeue.variable} ${nordique.variable} h-full`}>
			<body className="flex min-h-full flex-col">
				<CartProvider>
					<Header />
					<main id="main" className="flex-1">
						{children}
					</main>
					<Footer />
				</CartProvider>
				<Toaster position="bottom-center" toastOptions={{ className: "!rounded-none !font-sans" }} />
			</body>
		</html>
	);
}
