import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/productGallery";
import { ProductDetails, ShareLinks, TrustList, WarrantyCard } from "@/components/product/productInfo";
import { ProductProvider, type ProductClientData } from "@/components/product/productProvider";
import { CustomOptionLink, ProductPrice, ProductSku, PurchaseActions, VariationPicker } from "@/components/product/productPurchase";
import { ProductRail, ProductRailSkeleton } from "@/components/product/productRail";
import { RelatedVariants, RelatedVariantsSkeleton } from "@/components/product/relatedVariants";
import { formatMoney, getFx, type Fx } from "@/lib/api/currency";
import { getCompleteTheRoom, getProduct, getRelatedVariants, getYouMightAlsoLike, type ProductDetail } from "@/lib/api/product";
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

/**
 * The product is looked up before <Suspense> so an unknown slug is a real 404 (notFound() mid-stream sends 200 + noindex).
 * The visitor's currency is still read inside it; getProduct is cached, so Content reuses the result.
 */
export default async function Page({ params }: PageProps<"/product/[slug]">) {
	if (!(await getProduct((await params).slug))) notFound();
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
	const schema = productSchema(product, url);

	return (
		<>
			<SeoSchema path={`/product/${product.slug}/`} fallback={schema} mainEntity={product.variations.length ? schema : undefined} />

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

						<Suspense fallback={<RelatedVariantsSkeleton />}>
							<RelatedVariants product={product} fx={fx} />
						</Suspense>

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
	const [variants, room] = await Promise.all([getRelatedVariants(product), getCompleteTheRoom(product)]);
	const alsoLike = await getYouMightAlsoLike(product, [...variants, ...room].map((r) => r.id));
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

/** schema.org property for an option label ("Bed Size" -> size), for ProductGroup.variesBy and each variant's value */
const variesBy = (option: string) => ["material", "color", "size", "pattern"].find((p) => option.toLowerCase().replace("colour", "color").includes(p));

/**
 * schema.org Product in the store's base currency (Google reads one currency per offer). A variable product is a
 * ProductGroup with one Product per variation, as Rank Math outputs on the WP theme; its headless getHead endpoint
 * only returns a plain Product, so this also replaces that node (SeoSchema mainEntity).
 */
function productSchema(product: ProductDetail, url: string) {
	const { min, minorUnit, currency } = product.price;
	const amount = (value: string) => (Number(value) / 10 ** minorUnit).toFixed(minorUnit);
	const offer = (price: string, inStock: boolean) => ({
		"@type": "Offer",
		priceCurrency: currency,
		price: amount(price),
		availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
		itemCondition: "https://schema.org/NewCondition",
		url,
	});
	const base = {
		"@context": "https://schema.org",
		name: product.name,
		url,
		image: product.images.map((i) => i.src),
		description: plainText(product.shortDescription) || undefined,
		brand: { "@type": "Brand", name: "Majeurs" },
		category: product.category?.name,
	};
	if (!product.variations.length) return { ...base, "@type": "Product", sku: product.sku || undefined, offers: offer(min, product.inStock) };

	const termName = (option: string, slug: string) => product.options.find((o) => o.name === option)?.terms.find((t) => t.slug === slug)?.name ?? slug;
	const properties = product.options.map((o) => variesBy(o.name)).filter(Boolean);
	return {
		...base,
		"@type": "ProductGroup",
		productGroupID: product.sku || String(product.id),
		variesBy: properties.map((p) => `https://schema.org/${p}`),
		hasVariant: product.variations.map((v) => {
			const values = Object.entries(v.attributes).filter(([, slug]) => slug);
			return {
				"@type": "Product",
				name: [product.name, ...values.map(([option, slug]) => termName(option, slug))].join(" – "),
				sku: v.sku || undefined,
				image: v.image?.src ?? product.images[0]?.src,
				...Object.fromEntries(values.flatMap(([option, slug]) => {
					const property = variesBy(option);
					return property ? [[property, termName(option, slug)]] : [];
				})),
				offers: offer(v.price, v.inStock),
			};
		}),
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
