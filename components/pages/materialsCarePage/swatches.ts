// Fabric swatches from the live Materials & Care page (28 Oct 2026)
import { WP_URL } from "@/lib/api/wp";

const UPLOADS = `${WP_URL}/wp-content/uploads`;

export type Swatch = { name: string; image: string; detail: string };

/** Jacquards: the pattern is woven in */
export const jacquards: Swatch[] = [
	{ name: "Blush Palm", detail: "235 GSM", image: `${UPLOADS}/material-swatch-2039-38.jpg` },
	{ name: "Celadon Scallop", detail: "240 GSM", image: `${UPLOADS}/ultrafabrics-swatch-2039-30-1.jpg` },
	{ name: "Champagne Diamond", detail: "235 GSM", image: `${UPLOADS}/material-swatch-2039-21.jpg` },
	{ name: "Champagne Leaf", detail: "245 GSM", image: `${UPLOADS}/material-swatch-2038-44.jpg` },
	{ name: "Cream Arches", detail: "240 GSM", image: `${UPLOADS}/material-swatch-2038-27.jpg` },
	{ name: "Dove Leaf", detail: "225 GSM", image: `${UPLOADS}/material-swatch-2039-77.jpg` },
	{ name: "Gold Honeycomb", detail: "220 GSM", image: `${UPLOADS}/material-swatch-2039-42.jpg` },
	{ name: "Gold Prism", detail: "210 GSM", image: `${UPLOADS}/material-swatch-2039-04.jpg` },
	{ name: "Grey Honeycomb", detail: "220 GSM", image: `${UPLOADS}/material-swatch-2039-67.jpg` },
	{ name: "Grey Palm", detail: "235 GSM", image: `${UPLOADS}/ultrafabrics-swatch-2039-82-1.jpg` },
	{ name: "Grey Plume", detail: "225 GSM", image: `${UPLOADS}/material-swatch-2039-73.jpg` },
	{ name: "Ivory Fan", detail: "230 GSM", image: `${UPLOADS}/material-swatch-2039-74.jpg` },
	{ name: "Ivory Plume", detail: "225 GSM", image: `${UPLOADS}/material-swatch-2038-75.jpg` },
	{ name: "Ivory Trellis", detail: "210 GSM", image: `${UPLOADS}/material-swatch-2038-53.jpg` },
	{ name: "Linen Geometric", detail: "245 GSM", image: `${UPLOADS}/material-swatch-2038-63.jpg` },
	{ name: "Linen Grain", detail: "225 GSM", image: `${UPLOADS}/material-swatch-2039-23.jpg` },
	{ name: "Mint Ogee", detail: "235 GSM", image: `${UPLOADS}/material-swatch-2039-33.jpg` },
	{ name: "Mocha Hexagon", detail: "265 GSM", image: `${UPLOADS}/material-swatch-2039-25.jpg` },
	{ name: "Mushroom Diamond", detail: "220 GSM", image: `${UPLOADS}/material-swatch-2039-71.jpg` },
	{ name: "Oat Honeycomb", detail: "250 GSM", image: `${UPLOADS}/material-swatch-2039-05.jpg` },
	{ name: "Pearl Chevron", detail: "225 GSM", image: `${UPLOADS}/material-swatch-2038-40.jpg` },
	{ name: "Pearl Diamond", detail: "245 GSM", image: `${UPLOADS}/material-swatch-2038-55.jpg` },
	{ name: "Pearl Prism", detail: "210 GSM", image: `${UPLOADS}/material-swatch-2039-11.jpg` },
	{ name: "Pearl Swirl", detail: "255 GSM", image: `${UPLOADS}/material-swatch-2039-79.jpg` },
	{ name: "Pewter Strata", detail: "235 GSM", image: `${UPLOADS}/material-swatch-2038-08.jpg` },
	{ name: "Sage Fan", detail: "240 GSM", image: `${UPLOADS}/material-swatch-2039-87.jpg` },
	{ name: "Sage Scallop", detail: "240 GSM", image: `${UPLOADS}/material-swatch-2038-59.jpg` },
	{ name: "Sand Arches", detail: "240 GSM", image: `${UPLOADS}/material-swatch-2039-43.jpg` },
	{ name: "Sand Diamond", detail: "245 GSM", image: `${UPLOADS}/material-swatch-2038-67.jpg` },
	{ name: "Sand Lattice", detail: "240 GSM", image: `${UPLOADS}/material-swatch-2039-03.jpg` },
	{ name: "Silver Mist", detail: "240 GSM", image: `${UPLOADS}/material-swatch-2038-58.jpg` },
	{ name: "Silver Strata", detail: "205 GSM", image: `${UPLOADS}/material-swatch-2039-86.jpg` },
	{ name: "Silver Wave", detail: "230 GSM", image: `${UPLOADS}/material-swatch-2039-75.jpg` },
	{ name: "Stone Marble", detail: "205 GSM", image: `${UPLOADS}/material-swatch-2039-61.jpg` },
	{ name: "Taupe Honeycomb", detail: "250 GSM", image: `${UPLOADS}/material-swatch-2039-66.jpg` },
	{ name: "Taupe Leaf", detail: "245 GSM", image: `${UPLOADS}/ultrafabrics-swatch-2039-68-1.jpg` },
	{ name: "Taupe Maze", detail: "245 GSM", image: `${UPLOADS}/ultrafabrics-swatch-2039-53.jpg` },
	{ name: "Taupe Prism", detail: "210 GSM", image: `${UPLOADS}/material-swatch-2039-88.jpg` },
];

/** Plain, textured and linen-look weaves */
export const weaves: Swatch[] = [
	{ name: "Linen-Look Weave – Snow", detail: "Polyester, rayon, natural fibre · 235 GSM", image: `${UPLOADS}/material-swatch-2038-15.jpg` },
	{ name: "Plain Weave – Ivory", detail: "37% polyester, 23% cationic polyester, 40% cotton · 240 GSM", image: `${UPLOADS}/material-swatch-2038-29.jpg` },
	{ name: "Plain Weave – Oatmeal", detail: "Polyester, rayon, natural fibre · 235 GSM", image: `${UPLOADS}/material-swatch-2039-44.jpg` },
	{ name: "Textured Weave – Ash Grey", detail: "Polyester, rayon, natural fibre · 235 GSM", image: `${UPLOADS}/ultrafabrics-swatch-2039-81-1.jpg` },
];
