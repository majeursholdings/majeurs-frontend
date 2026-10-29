import Image from "next/image";
import Link from "next/link";
import { DEFAULT_HERO_IMAGE, PageHero } from "@/components/common/pageHero";
import { CustomizeCta } from "@/components/marketing/customizeCta";
import { getProjects } from "@/lib/api/projects";

/** /project/: every WP "project" post as a card, so new projects appear without a deploy */
export default async function ProjectsPage() {
	const projects = await getProjects();

	return (
		<>
			<PageHero
				title="Majeurs Projects"
				description="Majeurs Furniture's project portfolio showcases some of our team's completed residential and outdoor design projects. From completed renovations to complete setup projects, see how we turn ordinary spaces into extraordinary dream spaces."
				className="min-h-60 md:min-h-90 [&_p]:text-sm [&_p]:text-white"
			/>

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site">
					{projects.length ? (
						<ul className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
							{projects.map((project) => (
								<li key={project.slug}>
									<article className="group space-y-4">
										<Link href={project.href} aria-label={project.title} className="relative block aspect-[4/3] overflow-hidden bg-sand-50">
											{project.image ? (
												<Image
													src={project.image.src}
													alt={project.image.alt}
													fill
													sizes="(min-width: 1025px) 25vw, (min-width: 640px) 50vw, 100vw"
													className="object-cover transition-[scale] duration-700 ease-in-out group-hover:scale-[1.03]"
												/>
											) : null}
										</Link>
										<h2 className="text-lg font-display text-black">
											<Link href={project.href} className="transition-colors hover:text-gold">
												{project.title}
											</Link>
										</h2>
										<Link href={project.href} tabIndex={-1} className="btn border-black px-4 py-2 text-xs text-black hover:bg-black hover:text-white">
											View project
										</Link>
									</article>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-charcoal">New projects are on the way. Check back soon.</p>
					)}
				</div>
			</section>

			<CustomizeCta image={DEFAULT_HERO_IMAGE} fullBleed />
		</>
	);
}
