import { definePage, image, list, text, textarea, upload } from "../model.ts";

const gallery = (...files: string[]) => files.map((file) => ({ image: upload(file) }));

export const rootAndReverence = definePage({
	id: "rootAndReverence",
	wpId: 5807,
	path: "/root-and-reverence-collection/",
	title: "Root and Reverence Collection page content",
	fields: {
		heroEyebrow: text("Hero: label", "A debut collection by Majeurs Holdings"),
		heroTitle: text("Hero: title", "Roots and Reverence"),
		heroText: textarea("Hero: text", "A three-piece limited-edition furniture collection. Each collection tells a unique story deeply rooted in African heritage."),
		heroImage: image(
			"Hero: image",
			upload("mama-rainbow-on-a-bke-holding-the-dundun-chair-from-Majeurs-Root-and-Reverence-collection-scaled-1.webp"),
		),
		heroImageAlt: text("Hero: image description", "Mama Rainbow riding a bike, holding the Dandan chair", "Read aloud by screen readers."),

		waitlistButton: text("Waitlist: button", "Join Waitlist"),
		waitlistEyebrow: text("Waitlist form: label", "Roots and Reverence"),
		waitlistTitle: text("Waitlist form: title", "Join the waitlist"),
		waitlistText: textarea("Waitlist form: text", "Three pieces, 50 units each. Your place is held the moment you join; we'll email you when it's your turn."),

		makerTitle: text("From maker to designer: title", "From Maker to Designer"),
		makerVideoId: text("From maker to designer: YouTube video ID", "lCQzouZV7-E", "The part after watch?v= in the YouTube link."),
		makerVideoTitle: text("From maker to designer: video title", "Root and Reverence Explainer Video"),
		makerText: textarea(
			"From maker to designer: text",
			"For over a decade, Majeurs Holdings has been the maker behind other people's visions. Furniture built with precision. Designs executed with integrity. Craft that never asked for credit.\n\nRoots & Reverence is the first time we have asked a different question.\n\nThis debut collection, three pieces, each rooted in the depth of African heritage, marks the moment that manufacturing and design fully merge. It is not a departure from what Majeurs does. It is the fullest expression of it.\n\nDesigned by Demi Samande. Made in Nigeria. Limited to 50 units per piece.",
		),
		makerQuote: text("From maker to designer: quote", "Design is not only about shaping materials. It is about shaping new possibilities."),
		makerQuoteBy: text("From maker to designer: quote by", "Demi Samande, Founder, Majeurs Holdings"),

		keeperImage: image("Keeper of the stories: image", upload("Mama-Rainbow-is-not-an-endorser.-She-is-the-soul-of-this-collection-scaled-1.webp")),
		keeperImageAlt: text("Keeper of the stories: image description", "Mama Rainbow seated in the Abobaku chair", "Read aloud by screen readers."),
		keeperTitle: text("Keeper of the stories: title", "The Keeper of the Stories"),
		keeperText: textarea(
			"Keeper of the stories: text",
			"Mama Rainbow is not an endorser. She is the soul of this collection.\n\nAs a cultural anchor, beloved by generations, rooted in the living traditions of African storytelling, her presence in Roots & Reverence transforms these furniture pieces from objects into inheritance.\n\nShe carries what the furniture is trying to say. When a story is told by its keeper, it becomes sacred.",
		),

		piecesTitle: text("Pieces: title", "Created for Heritage Collectors, Not just Buyers"),
		piecesText: textarea("Pieces: text", "Explore the thoughtful inspiration behind our collections."),
		storyButton: text("Pieces: read more button", "Read more"),
		storyWaitlistButton: text("Piece story: waitlist button", "Join waitlist"),
		storyStock: text("Piece story: units note", "50 units left"),
		pieces: list(
			"Pieces",
			{
				name: text("Name", "", "Abobaku, Dandan or Erelu pre-select the piece in the waitlist form."),
				meaning: textarea("Meaning (under the card)"),
				image: image("Card image"),
				headline: text("Story: headline"),
				story: textarea("Story: text"),
				quote: textarea("Story: quote"),
				gallery: list("Story: gallery", { image: image("Image") }, [], { itemLabel: "image" }),
				details: list("Story: details", { label: text("Label"), value: text("Value") }, [], { itemLabel: "detail" }),
			},
			[
				{
					name: "Abobaku",
					meaning: "A Yoruba word meaning 'the king's companion'. The connection lasts forever.",
					image: upload("5-8.webp"),
					headline: "The king needed someone who would not leave.",
					story: [
						"In Yoruba tradition, the Abobaku was the king's companion, one bound by devotion so complete and so unwavering that they would journey alongside the king even into the final unknown. Not by force. By loyalty.",
						"I thought about that for a long time when I designed this piece.",
						"In the context of the chair design, this idea encapsulates the unyielding devotion we must have toward our craft.",
						"What does it mean to be truly committed to something? Not committed when it is easy. Not committed when people are watching. Committed through every difficulty, every doubt, every quiet moment when no one would know if you walked away.",
						"That is what this chaise lounge is asking of you. And it is what I ask of myself, every day, as a maker.",
						"The Abobaku Chair is not designed to be sat in briefly. It is shaped to hold you, the long curve of it, the depth of it. It is the kind of presence in a room that you return to. A companion. An anchor.",
					].join("\n\n"),
					quote:
						"Just as the Abobaku would willingly offer their life to accompany the king in death, this chair represents the loyalty we must embrace as artisans. The promise to remain true through every challenge, every triumph, and until the very end.",
					gallery: gallery("5-1-1.webp", "4-1-1.webp", "3-1-1.webp"),
					details: [
						{ label: "Piece", value: "Abobaku Chaise Lounge" },
						{ label: "Meaning", value: "The king's companion" },
						{ label: "Origin", value: "Yoruba / African tradition" },
						{ label: "Dimensions (cm)", value: "W 80 x L 85 x H 95" },
						{ label: "Materials", value: "Top-grain leather or full velvet" },
					],
				},
				{
					name: "Dandan",
					meaning: "A Yoruba word meaning 'resilience/survival' against adversity. The Nigerian spirit of perseverance.",
					image: upload("4-2-1.webp"),
					headline: "Three legs. None of which is even. But all is standing.",
					story: [
						"The Dandan Chair is the piece that people look at twice.",
						"Three legs and not one of them perfectly straight. The form tilts. The structure feels, at first glance, like it should not hold. And then you sit in it. And you understand.",
						"I grew up watching Nigeria bend under pressure that should have broken it. I watched individuals, makers, mothers, builders absorb instability and keep moving. Not because the ground was level. Because they had learned to stand anyway.",
						"I did not straighten the legs of this chair because I did not want to lie. Conditions are rarely perfect. Structures are rarely even. That does not mean they cannot hold you.",
						"The Dandan Chair is not about perfect form. It is about what stands in spite of imperfect form. It is the Nigerian spirit made physical, visible, sittable, real.",
					].join("\n\n"),
					quote:
						"Despite the uneven and imperfect structure symbolized by the three distorted legs, the chair stands, highlighting the inevitability of progress and the unwavering spirit of the Nigerian people.",
					gallery: gallery("0-1.webp", "1-3-1.webp", "2-4-1.webp"),
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
					image: upload("Erelu-The-Glass-Top-Executive-Desk-3.webp"),
					headline: "Some women do not just occupy a room. They hold it.",
					story: [
						"The Erelu Table began with my grandmother.",
						"She knew things that were never written down. She held them in the way she moved through a room, in the way she organised a meal, in the way she listened when people spoke and remembered everything they said. She did not call herself a custodian of culture. She simply was one.",
						"In Yoruba tradition, the Erelu is a title given to women of extraordinary social standing, women who serve as the bridge between the past and the future, who carry the culture forward not just by remembering it, but by living it.",
						"I made a table because tables are where we gather. Where we eat and argue and celebrate and make decisions that shape everything that comes after. The table is the most communal object in any home. It belongs to everyone who sits around it and to all the people who have sat there before.",
						"The circular form at the core of the Erelu Table is not decorative. Circles have no beginnings and no endings. They are continuous just like heritage, just like the women who carry it.",
					].join("\n\n"),
					quote: "Power tempered with grace. The Erelu Table speaks of dignity, continuity, and the integral role of women as custodians of tradition and heritage.",
					gallery: gallery("0.webp", "1-2-1.webp", "2-3-1.webp"),
					details: [
						{ label: "Piece", value: "Erelu Table" },
						{ label: "Meaning", value: "Custodian, revered Yoruba title for women of high social standing" },
						{ label: "Origin", value: "Yoruba culture, women as keepers of tradition" },
						{ label: "Dimensions (cm)", value: "W 230 × L 120 × H 75" },
						{ label: "Materials", value: "Rear timber and tempered glass." },
					],
				},
			],
			{ itemLabel: "piece" },
		),

		stepsTitle: text("How to become a collector: title", "How To Become A Collector"),
		stepsText: textarea("How to become a collector: text", "Remember, it is three pieces. 50 units each."),
		steps: list(
			"How to become a collector: steps",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "Join Waitlist", text: "Fill out the waitlist form to reserve your place." },
				{ title: "Hold Your Place", text: "Your position is locked the moment you join; first come, first served." },
				{ title: "Get Notified", text: "An email and a purchase invite will be sent when it's your turn." },
				{ title: "Make The Purchase.", text: "Make a payment and get the product delivered to your location." },
			],
			{ itemLabel: "step", instructions: "Each step's icon is set by its position (join, hold, notify, buy)." },
		),
	},
});
