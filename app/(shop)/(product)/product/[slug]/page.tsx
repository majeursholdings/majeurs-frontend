import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/productGallery";
import { ProductDetails, ShareLinks, TrustList, WarrantyCard } from "@/components/product/productInfo";
import { ProductProvider, type ProductClientData } from "@/components/product/productProvider";
import { CustomOptionLink, ProductPrice, ProductSku, PurchaseActions, VariationPicker } from "@/components/product/productPurchase";
import { ProductRail, ProductRailSkeleton } from "@/components/product/productRail";
import { formatMoney, getFx, type Fx } from "@/lib/api/currency";
import { getCompleteTheRoom, getProduct, getYouMightAlsoLike, type ProductDetail } from "@/lib/api/product";
import { decodeEntities } from "@/lib/api/wp";
import { SITE_URL } from "@/lib/contact";
import { titleFromSlug } from "@/lib/routes/format";
import { productSlugs } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

// TODO: fetch slugs from the Store API instead of the snapshot
export function generateStaticParams() {
	return productSlugs.map((slug) => ({ slug }));
}

const plainText = (html: string) => decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

/** Rank Math head for the product (lib/seo.ts), with these values until its headless endpoint is on */
export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
	const p = await params;
	const product = await getProduct(p.slug);
	if (!product) return { title: titleFromSlug(p.slug) };
	const description = plainText(product.shortDescription) || plainText(product.description).slice(0, 160);
	return seoMetadata(`/product/${product.slug}/`, {
		title: product.name,
		description,
		alternates: { canonical: `/product/${product.slug}/` },
		openGraph: { title: product.name, description, url: `/product/${product.slug}/`, images: product.images.slice(0, 1).map((i) => ({ url: i.src, alt: i.alt })) },
	});
}

/** URL params and the visitor's currency are read inside <Suspense> so the shell can render instantly (cacheComponents). */
export default function Page({ params }: PageProps<"/product/[slug]">) {
	return (
		<Suspense fallback={<ProductSkeleton />}>
			<Content params={params} />
		</Suspense>
	);
}

async function Content({ params }: Pick<PageProps<"/product/[slug]">, "params">) {
	const p = await params;
	const [product, fx] = await Promise.all([getProduct(p.slug), getFx()]);
	if (!product) notFound();

	const url = `${SITE_URL}/product/${product.slug}/`;

	return (
		<>
			<SeoSchema path={`/product/${product.slug}/`} fallback={productSchema(product, url)} />

			<ProductProvider product={toClientData(product, fx, url)}>
				<div className="grid gap-8 md:grid-cols-2 lg:gap-14">
					<div className="md:sticky md:top-24 md:self-start">
						<ProductGallery />
					</div>

					<div className="min-w-0 space-y-5">
						<nav aria-label="Breadcrumb" className="text-xs">
							<ol className="flex flex-wrap gap-1 text-gold-muted">
								{[{ name: "Home", href: "/" }, ...product.breadcrumbs].map((crumb) => (
									<li key={crumb.href} className="after:ml-1 after:content-['/']">
										<Link href={crumb.href} className="hover:text-black">
											{crumb.name}
										</Link>
									</li>
								))}
								<li aria-current="page" className="text-charcoal">
									{product.name}
								</li>
							</ol>
						</nav>

						<div className="space-y-2">
							<h1 className="text-h3">{product.name}</h1>
							<ProductSku />
						</div>

						<ProductPrice />

						{product.shortDescription ? (
							<div className="text-sm text-charcoal" dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
						) : null}

						<VariationPicker />
						<CustomOptionLink />
						<PurchaseActions />

						<Link href="/materials-and-care/" className="inline-block text-sm text-black underline underline-offset-4 hover:text-gold">
							Material &amp; care guide →
						</Link>

						<WarrantyCard />
						<TrustList />
						<ShareLinks name={product.name} url={url} />
						<ProductDetails product={product} />
					</div>
				</div>
			</ProductProvider>

			<Suspense fallback={<div className="mt-20 md:mt-28"><ProductRailSkeleton /></div>}>
				<Rails product={product} fx={fx} />
			</Suspense>
		</>
	);
}

async function Rails({ product, fx }: { product: ProductDetail; fx: Fx }) {
	const room = await getCompleteTheRoom(product);
	const alsoLike = await getYouMightAlsoLike(product, room.map((r) => r.id));
	return (
		<div className="mt-20 space-y-20 md:mt-28 md:space-y-28">
			<ProductRail title="Complete the Room" subtitle="Pieces chosen to pair with this design." shopAllHref="/shop/" products={room} fx={fx} />
			<ProductRail title="You Might Also Like" products={alsoLike} fx={fx} />
		</div>
	);
}

/** Server-side pricing in the visitor's currency, so the client components only swap strings */
function toClientData(product: ProductDetail, fx: Fx, url: string): ProductClientData {
	const { min, max, regular, minorUnit, onSale } = product.price;
	const money = (amount: string) => formatMoney(amount, minorUnit, fx);
	return {
		id: product.id,
		name: product.name,
		url,
		sku: product.sku,
		inStock: product.inStock,
		purchasable: product.purchasable,
		maxQuantity: product.maxQuantity,
		images: product.images,
		price: min !== max ? `From ${money(min)}` : money(min),
		regularPrice: onSale && min === max && regular !== min ? money(regular) : undefined,
		options: product.options,
		variations: product.variations.map((v) => ({
			...v,
			price: money(v.price),
			regularPrice: v.regularPrice && v.regularPrice !== v.price ? money(v.regularPrice) : undefined,
		})),
	};
}

/** schema.org Product in the store's base currency (Google reads one currency per offer) */
function productSchema(product: ProductDetail, url: string) {
	const { min, max, minorUnit, currency } = product.price;
	const amount = (value: string) => (Number(value) / 10 ** minorUnit).toFixed(minorUnit);
	const availability = product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		url,
		sku: product.sku || undefined,
		image: product.images.map((i) => i.src),
		description: plainText(product.shortDescription) || undefined,
		brand: { "@type": "Brand", name: "Majeurs" },
		category: product.category?.name,
		offers:
			min !== max
				? { "@type": "AggregateOffer", priceCurrency: currency, lowPrice: amount(min), highPrice: amount(max), offerCount: product.variations.length, availability, url }
				: { "@type": "Offer", priceCurrency: currency, price: amount(min), availability, url },
	};
}

function ProductSkeleton() {
	return (
		<div className="grid gap-8 md:grid-cols-2 lg:gap-14" aria-label="Loading product">
			<div className="space-y-1.5">
				<div className="aspect-square animate-pulse bg-sand-50" />
				<div className="grid grid-cols-4 gap-1.5">
					{Array.from({ length: 4 }, (_, i) => (
						<div key={i} className="aspect-square animate-pulse bg-sand-50" />
					))}
				</div>
			</div>
			<div className="space-y-5">
				<div className="h-3 w-1/2 animate-pulse bg-sand-50" />
				<div className="h-8 w-3/4 animate-pulse bg-sand-50" />
				<div className="h-6 w-1/4 animate-pulse bg-sand-50" />
				<div className="h-11 w-2/3 animate-pulse bg-sand-50" />
				<div className="h-12 animate-pulse bg-sand-50" />
				<div className="h-12 animate-pulse bg-sand-50" />
			</div>
		</div>
	);
}
