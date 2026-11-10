import { bindings, defineConfig, triggers } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };
import { routePatterns } from "./src/routes.ts";

/**
 * Routes majeurs.com requests between Next.js (Vercel) and WordPress. Not deployed yet: see README.md and
 * docs/GO_LIVE_PLAN.md. Preview with `npm run deploy:dry`.
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
			// value set once with `cf workers secrets update` (README.md); equals EDGE_SECRET on Vercel Production
			EDGE_SECRET: bindings.secret(),
		},
		triggers: routePatterns().map((pattern) => triggers.fetch({ pattern, zone: "majeurs.com" })),
	},
});
