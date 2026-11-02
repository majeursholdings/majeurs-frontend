import { bindings, defineConfig, triggers } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };
import { LIVE_GROUPS, routePatterns } from "./src/routes.ts";

/**
 * Routes majeurs.com paths between Next.js (Vercel) and WordPress. Not deployed yet: see README.md for the
 * launch checklist. Preview with `npm run deploy:dry`.
 */
export default defineConfig({
	// Ecommerce@majeursholdings.com's Account (the majeurs.com zone)
	accountId: "1c6e0d070c78d420259226623ef8fea2",
	worker: {
		name: "majeurs-edge-router",
		compatibilityDate: "2026-10-01",
		entrypoint,
		workersDev: false,
		env: {
			NEXT_ORIGIN: bindings.text("https://majeurs-frontend.vercel.app"),
			ROUTING: bindings.text(process.env.ROUTING === "off" ? "off" : "on"),
		},
		triggers: routePatterns(LIVE_GROUPS).map((pattern) => triggers.fetch({ pattern, zone: "majeurs.com" })),
	},
});
