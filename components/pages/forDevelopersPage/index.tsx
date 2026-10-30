import { CollectionsLanding } from "@/components/landing/collectionsLanding";
import { getPageContent } from "@/lib/content/get";
import { forDevelopers } from "@/lib/content/pages/forDevelopers";

/** /for-developers/: copy and images from the page's fields in wp-admin (lib/content/pages/forDevelopers.ts) */
export default async function ForDevelopersPage() {
	const c = await getPageContent(forDevelopers);
	return <CollectionsLanding c={c} />;
}
