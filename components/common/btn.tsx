import Link from "next/link"
import { MoveRight } from "lucide-react"
import { cn } from "@/lib/utils"

type LinkProps = {
        slug: string;
        label: string;
        /** Resting colours, e.g. "border-ink text-ink" */
        colorClassName?: string;
        /** Hover colours, e.g. "hover:bg-ink hover:text-sand hover:border-sand" */
        hoverClassName?: string;
}

export function PrimaryLink({ slug, label, colorClassName = "border-sand text-sand", hoverClassName = "hover:bg-sand hover:text-ink hover:border-ink" } : LinkProps ) {
    return (
        <Link
            href={slug}
            title={label}
            className={cn("btn mt-5 group transition-colors duration-300 ease-brand", colorClassName, hoverClassName)}
        >
            {label}
            <MoveRight className="size-6 group-hover:translate-x-1 duration-300 transition-transform ease-brand"/>
        </Link>
    )
}
