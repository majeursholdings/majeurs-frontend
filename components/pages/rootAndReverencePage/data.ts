// Roots and Reverence copy, from the live WP page and its "Read more" popups (28 Oct 2026)

const UPLOADS = "https://majeurs.com/wp-content/uploads";

export const HERO_IMAGE = `${UPLOADS}/mama-rainbow-on-a-bke-holding-the-dundun-chair-from-Majeurs-Root-and-Reverence-collection-scaled-1.webp`;
export const KEEPER_IMAGE = `${UPLOADS}/Mama-Rainbow-is-not-an-endorser.-She-is-the-soul-of-this-collection-scaled-1.webp`;
export const EXPLAINER_VIDEO = { id: "lCQzouZV7-E", title: "Root and Reverence Explainer Video" };

export type Piece = {
	name: string;
	/** one line under the card */
	meaning: string;
	image: string;
	/** "Read more" story, from the live popup */
	headline: string;
	story: string[];
	quote: string;
	gallery: string[];
	details: { label: string; value: string }[];
};

export const pieces: Piece[] = [
	{
		name: "Abobaku",
		meaning: "A Yoruba word meaning 'the king's companion'. The connection lasts forever.",
		image: `${UPLOADS}/5-8.webp`,
		headline: "The king needed someone who would not leave.",
		story: [
			"In Yoruba tradition, the Abobaku was the king's companion, one bound by devotion so complete and so unwavering that they would journey alongside the king even into the final unknown. Not by force. By loyalty.",
			"I thought about that for a long time when I designed this piece.",
			"In the context of the chair design, this idea encapsulates the unyielding devotion we must have toward our craft.",
			"What does it mean to be truly committed to something? Not committed when it is easy. Not committed when people are watching. Committed through every difficulty, every doubt, every quiet moment when no one would know if you walked away.",
			"That is what this chaise lounge is asking of you. And it is what I ask of myself, every day, as a maker.",
			"The Abobaku Chair is not designed to be sat in briefly. It is shaped to hold you, the long curve of it, the depth of it. It is the kind of presence in a room that you return to. A companion. An anchor.",
		],
		quote:
			"Just as the Abobaku would willingly offer their life to accompany the king in death, this chair represents the loyalty we must embrace as artisans. The promise to remain true through every challenge, every triumph, and until the very end.",
		gallery: [`${UPLOADS}/5-1-1.webp`, `${UPLOADS}/4-1-1.webp`, `${UPLOADS}/3-1-1.webp`],
		details: [
			{ label: "Piece", value: "Abobaku Chaise Lounge" },
			{ label: "Meaning", value: "The king's companion" },
			{ label: "Origin", value: "Yoruba / African tradition" },
			{ label: "Dimensions (cm)", value: "W 80 × L 85 × H 95" },
			{ label: "Materials", value: "Top-grain leather or full velvet" },
		],
	},
	{
		name: "Dandan",
		meaning: "A Yoruba word meaning 'resilience/survival' against adversity. The Nigerian spirit of perseverance.",
		image: `${UPLOADS}/4-2-1.webp`,
		headline: "Three legs. None of which is even. But all is standing.",
		story: [
			"The Dandan Chair is the piece that people look at twice.",
			"Three legs and not one of them perfectly straight. The form tilts. The structure feels, at first glance, like it should not hold. And then you sit in it. And you understand.",
			"I grew up watching Nigeria bend under pressure that should have broken it. I watched individuals, makers, mothers, builders absorb instability and keep moving. Not because the ground was level. Because they had learned to stand anyway.",
			"I did not straighten the legs of this chair because I did not want to lie. Conditions are rarely perfect. Structures are rarely even. That does not mean they cannot hold you.",
			"The Dandan Chair is not about perfect form. It is about what stands in spite of imperfect form. It is the Nigerian spirit made physical, visible, sittable, real.",
		],
		quote:
			"Despite the uneven and imperfect structure symbolized by the three distorted legs, the chair stands, highlighting the inevitability of progress and the unwavering spirit of the Nigerian people.",
		gallery: [`${UPLOADS}/0-1.webp`, `${UPLOADS}/1-3-1.webp`, `${UPLOADS}/2-4-1.webp`],
		details: [
			{ label: "Piece", value: "Dandan Chair" },
			{ label: "Meaning", value: "Resilience/survival against adversity" },
			{ label: "Origin", value: "The Nigerian spirit of perseverance" },
			{ label: "Dimensions (cm)", value: "W 53 × L 54 × H 69" },
			{ label: "Materials", value: "Metal alloy brass, timber, and velvet." },
		],
	},
	{
		name: "Erelu",
		meaning: "A Yoruba word meaning 'custodian', is a revered Yoruba title for women of high social standing.",
		image: `${UPLOADS}/Erelu-The-Glass-Top-Executive-Desk-3.webp`,
		headline: "Some women do not just occupy a room. They hold it.",
		story: [
			"The Erelu Table began with my grandmother.",
			"She knew things that were never written down. She held them in the way she moved through a room, in the way she organised a meal, in the way she listened when people spoke and remembered everything they said. She did not call herself a custodian of culture. She simply was one.",
			"In Yoruba tradition, the Erelu is a title given to women of extraordinary social standing, women who serve as the bridge between the past and the future, who carry the culture forward not just by remembering it, but by living it.",
			"I made a table because tables are where we gather. Where we eat and argue and celebrate and make decisions that shape everything that comes after. The table is the most communal object in any home. It belongs to everyone who sits around it and to all the people who have sat there before.",
			"The circular form at the core of the Erelu Table is not decorative. Circles have no beginnings and no endings. They are continuous just like heritage, just like the women who carry it.",
		],
		quote: "Power tempered with grace. The Erelu Table speaks of dignity, continuity, and the integral role of women as custodians of tradition and heritage.",
		gallery: [`${UPLOADS}/0.webp`, `${UPLOADS}/1-2-1.webp`, `${UPLOADS}/2-3-1.webp`],
		details: [
			{ label: "Piece", value: "Erelu Table" },
			{ label: "Meaning", value: "Custodian, revered Yoruba title for women of high social standing" },
			{ label: "Origin", value: "Yoruba culture, women as keepers of tradition" },
			{ label: "Dimensions (cm)", value: "W 230 × L 120 × H 75" },
			{ label: "Materials", value: "Rear timber and tempered glass." },
		],
	},
];
