import { CollectionsLanding } from "@/components/landing/collectionsLanding";
import { getPageContent } from "@/lib/content/get";
import { bespokeCollections } from "@/lib/content/pages/bespokeCollections";

/** /bespoke-furniture-collections-for-interior-designers/: copy and images from the page's fields in wp-admin (lib/content/pages/bespokeCollections.ts) */
export default async function BespokeCollectionsPage() {
	const c = await getPageContent(bespokeCollections);
	return <CollectionsLanding c={c} />;
}
