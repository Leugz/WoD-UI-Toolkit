export interface ResourceConfig {
	name: string;
	codeblock: string;
	max: number;
	icon: string;
	levels: {
		value: number;
		label: string;
		description: string;
	}[];
}

export interface MoralityConfig {
	name: string;
	codeblock: string;
	stainName: string;
	defaultValue: number;
	labels: string[];
	descriptions: string[];
	hasStains: boolean;
	stainFormula: (morality: number) => number;
}

export interface PowerSystemConfig {
	name: string;
	singularName: string;
	codeblock: string;
	iconMap?: Record<string, string>;
}

export interface BaseTrackerConfig {
	name: string;
	codeblock: string;
}

export interface AdvantageConfig {
	name: string;
	codeblock: string;
	mode: 'blood-potency' | 'renown';
}

export interface GameConfig {
	id: string;
	name: string;
	resource: ResourceConfig;
	morality: MoralityConfig;
	powerSystem: PowerSystemConfig;
	attributes: Record<string, string[]>;
	skills: Record<string, string[]>;
	health: BaseTrackerConfig;
	willpower: BaseTrackerConfig;
	exp: BaseTrackerConfig;
	merits: BaseTrackerConfig;
	powerList: BaseTrackerConfig;
	advantage: AdvantageConfig;
}

export const VTM_CONFIG: GameConfig = {
	id: 'vtm',
	name: 'Vampire: The Masquerade',

	resource: {
		name: 'Hunger',
		codeblock: 'vtm-hunger',
		max: 5,
		icon: 'assets/vtm/misc/BestialFail.png',
		levels: [
			{
				value: 0,
				label: 'Sated',
				description: 'No penalty. Blood Potency minimum applies.',
			},
			{
				value: 1,
				label: 'Hungry',
				description: 'No penalty yet, but the Beast stirs.',
			},
			{
				value: 2,
				label: 'Famished',
				description: 'Subtle signs of vampiric nature emerge.',
			},
			{
				value: 3,
				label: 'Starving',
				description:
					'Penalty to resist frenzy. Feeding becomes urgent.',
			},
			{
				value: 4,
				label: 'Ravenous',
				description: 'Severe penalties. Risk of uncontrolled feeding.',
			},
			{
				value: 5,
				label: 'The Beast',
				description: 'Imminent frenzy. The Beast is in control.',
			},
		],
	},

	morality: {
		name: 'Humanity',
		codeblock: 'vtm-humanity',
		stainName: 'Stains',
		defaultValue: 7,
		labels: [
			'Lost',
			'Monstrous',
			'Monstrous',
			'Callous',
			'Callous',
			'Conflicted',
			'Conflicted',
			'Human',
			'Virtuous',
			'Virtuous',
			'Saint',
		],
		descriptions: [
			'Humanity lost. Wassail imminent.',
			'Barely human. The Beast is in control.',
			'Barely human. The Beast is in control.',
			'Cruel and callous. Frenzy becomes more common.',
			'Cruel and callous. Frenzy becomes more common.',
			'Slipping morals. The Beast grows stronger.',
			'Slipping morals. The Beast grows stronger.',
			'Average morality. Can distinguish right from wrong.',
			'Moral and empathetic. Struggles against the Beast.',
			'Moral and empathetic. Struggles against the Beast.',
			'Paragons of virtue. Extremely rare among Kindred.',
		],
		hasStains: true,
		stainFormula: (morality: number) => 10 - morality + 1,
	},

	powerSystem: {
		name: 'Disciplines',
		singularName: 'Discipline',
		codeblock: 'vtm-disciplines',
		// hasDots: true,
		iconMap: {
			'Blood Sorcery': 'Thaumaturgy',
			'Thin-Blood Alchemy': 'Thinblood_alchemy',
		},
	},

	attributes: {
		Physical: ['Strength', 'Dexterity', 'Stamina'],
		Social: ['Charisma', 'Manipulation', 'Composure'],
		Mental: ['Intelligence', 'Wits', 'Resolve'],
	},
	skills: {
		Physical: [
			'Athletics',
			'Brawl',
			'Craft',
			'Drive',
			'Firearms',
			'Melee',
			'Larceny',
			'Stealth',
			'Survival',
		],
		Social: [
			'Animal Ken',
			'Etiquette',
			'Insight',
			'Intimidation',
			'Leadership',
			'Performance',
			'Persuasion',
			'Streetwise',
			'Subterfuge',
		],
		Mental: [
			'Academics',
			'Awareness',
			'Finance',
			'Investigation',
			'Medicine',
			'Occult',
			'Politics',
			'Science',
			'Technology',
		],
	},
	advantage: {
		name: 'Blood Potency',
		codeblock: 'vtm-blood-potency',
		mode: 'blood-potency',
	},

	health: { name: 'Health', codeblock: 'vtm-health' },
	willpower: { name: 'Willpower', codeblock: 'vtm-willpower' },
	exp: { name: 'Experience', codeblock: 'vtm-exp' },
	merits: { name: 'Merits & Flaws', codeblock: 'vtm-merits' },
	powerList: { name: 'Powers', codeblock: 'vtm-power-list' },
};

export const WTA_CONFIG: GameConfig = {
	id: 'wta',
	name: 'Werewolf: The Apocalypse',
	resource: {
		name: 'Rage',
		codeblock: 'wta-rage',
		max: 5,
		icon: 'assets/wta/misc/Rage.png',
		levels: [
			{ value: 0, label: 'Calm', description: 'No Rage.' },
			{ value: 1, label: 'Simmering', description: '1 Rage die.' },
			{ value: 2, label: 'Angered', description: '2 Rage dice.' },
			{ value: 3, label: 'Furious', description: '3 Rage dice.' },
			{ value: 4, label: 'Enraged', description: '4 Rage dice.' },
			{
				value: 5,
				label: 'Frenzied',
				description: '5 Rage dice. Brutal outcome likely.',
			},
		],
	},
	morality: {
		name: 'Harmony',
		codeblock: 'wta-harmony',
		stainName: 'Touchstones',
		defaultValue: 7,
		labels: [
			'Dysphoria',
			'Dysphoria',
			'Dysphoria',
			'Discordant',
			'Discordant',
			'Balanced',
			'Balanced',
			'Harmonious',
			'Harmonious',
			'Ascendant',
			'Ascendant',
		],
		descriptions: [
			'Total disconnection from Gaia.',
			'Spiritually lost.',
			'Spiritually lost.',
			'Out of balance.',
			'Out of balance.',
			'Balanced.',
			'Balanced.',
			'Attuned.',
			'Attuned.',
			'Ascendant.',
			'Ascendant.',
		],
		hasStains: false,
		stainFormula: (m) => 0,
	},
	powerSystem: {
		name: 'Gifts',
		singularName: 'Gift',
		codeblock: 'wta-gifts',
		iconMap: {
			// Tribes
			'Black Furies': 'tribes/Black_Furies',
			'Bone Gnawers': 'tribes/Bone_Gnawers',
			'Children of Gaia': 'tribes/Children_of_Gaia',
			Galestalkers: 'tribes/Galestalkers',
			'Ghost Council': 'tribes/Ghost_Council',
			'Glass Walkers': 'tribes/Glass_Walkers',
			'Hart Wardens': 'tribes/Hart_Wardens',
			'Red Talons': 'tribes/Red_Talons',
			'Shadow Lords': 'tribes/Shadow_Lords',
			'Silent Striders': 'tribes/Silent_Striders',
			'Silver Fangs': 'tribes/Silver_Fangs',

			// Auspices
			Ahroun: 'auspices/Ahroun',
			Galliard: 'auspices/Galliard',
			Philodox: 'auspices/Philodox',
			Ragabash: 'auspices/Ragabash',
			Theurge: 'auspices/Theurge',

			// Native
			Native: 'misc/Garou_Nation',
			Garou: 'misc/Garou_Nation',

			// Native Gifts
			Catfeet: 'misc/Garou_Nation',
			'An Exchange with Luna': 'misc/Garou_Nation',
			'Eyes of the Owl': 'misc/Garou_Nation',
			"Hare's Leap": 'misc/Garou_Nation',
			'The Howl Carries': 'misc/Garou_Nation',
			'Penumbral Senses': 'misc/Garou_Nation',
			'Raging Strike': 'misc/Garou_Nation',
			'Resist Toxin': 'misc/Garou_Nation',
			'Shredding Skin': 'misc/Garou_Nation',
			Staredown: 'misc/Garou_Nation',
			'Bestial Regression': 'misc/Garou_Nation',
			'Bite of the Lycan': 'misc/Garou_Nation',
			Gnaw: 'misc/Garou_Nation',
			'Sharpened Senses': 'misc/Garou_Nation',
			'Spirit of the Fray': 'misc/Garou_Nation',
			'Thwarting the Arrow': 'misc/Garou_Nation',
			'Urban Hunter': 'misc/Garou_Nation',
			'Body Shift': 'misc/Garou_Nation',
			'Jam Technology': 'misc/Garou_Nation',
			'Tongue of the Beasts': 'misc/Garou_Nation',

			// Auspice Gifts
			'Blissful Ignorance': 'auspices/Ragabash',
			"Crow's Laughter": 'auspices/Ragabash',
			Gremlins: 'auspices/Ragabash',
			"Spider's Song": 'auspices/Ragabash',
			'Corrupted Memories': 'auspices/Ragabash',
			'Umbral Pocket': 'auspices/Ragabash',
			'Blur of the Milky Eye': 'auspices/Ragabash',
			'Open Seal': 'auspices/Ragabash',
			'Pulse of the Prey': 'auspices/Ragabash',
			'Scent of Running Water': 'auspices/Ragabash',
			'Jump Scare': 'auspices/Ragabash',
			"Luna's Blessing": 'auspices/Ragabash',
			'Thieving Talons of the Magpie': 'auspices/Ragabash',
			'The Thousand Forms': 'auspices/Ragabash',
			'Whelp Body': 'auspices/Ragabash',

			'Ensnare Spirit': 'auspices/Theurge',
			"Mother's Touch": 'auspices/Theurge',
			'Shadow Sense': 'auspices/Theurge',
			'Sight from Beyond': 'auspices/Theurge',
			'Hungry Teeth': 'auspices/Theurge',
			Entreat: 'auspices/Theurge',
			'Summon Implement': 'auspices/Theurge',
			'Banish Spirit': 'auspices/Theurge',
			'Grasp from Beyond': 'auspices/Theurge',
			Mindspeak: 'auspices/Theurge',
			'Umbral Tether': 'auspices/Theurge',
			'Bolt Hole': 'auspices/Theurge',
			'Command Spirit': 'auspices/Theurge',
			'Drain Spirit': 'auspices/Theurge',
			'Feral Regression': 'auspices/Theurge',
			'Living Ward': 'auspices/Theurge',
			'Ghost Walk': 'auspices/Theurge',

			'Ancestral Conviction': 'auspices/Philodox',
			"Gaia's Candor": 'auspices/Philodox',
			"Porcupine's Reprisal": 'auspices/Philodox',
			'Sense the True Form': 'auspices/Philodox',
			'Wyrm-Speech': 'auspices/Philodox',
			'Indomitable Spirit': 'auspices/Philodox',
			"Beast's Fealty": 'auspices/Philodox',
			'Command the Gathering': 'auspices/Philodox',
			'Fangs of Judgement': 'auspices/Philodox',
			'Scent of the Past': 'auspices/Philodox',
			Calcify: 'auspices/Philodox',
			Geas: 'auspices/Philodox',
			"Oathbreaker's Bane": 'auspices/Philodox',
			'Strength of Purpose': 'auspices/Philodox',
			'Take the True Form': 'auspices/Philodox',

			'Animal Magnetism': 'auspices/Galliard',
			'Howl of Assembly': 'auspices/Galliard',
			'Song of Rage': 'auspices/Galliard',
			'Song of Serenity': 'auspices/Galliard',
			'Cutting Words': 'auspices/Galliard',
			'Howl of Despair': 'auspices/Galliard',
			Lullaby: 'auspices/Galliard',
			'Call the Ridden': 'auspices/Galliard',
			'Eyes of the Cobra': 'auspices/Galliard',
			'Song of Valor': 'auspices/Galliard',
			'Song of Inspiration': 'auspices/Galliard',
			'Against the Odds': 'auspices/Galliard',
			'Break the Shackles': 'auspices/Galliard',
			'Defy Death': 'auspices/Galliard',
			Dreamwalk: 'auspices/Galliard',

			"Halt the Coward's Flight": 'auspices/Ahroun',
			'Rapid Shift': 'auspices/Ahroun',
			'Razor Claws': 'auspices/Ahroun',
			'Sense Danger': 'auspices/Ahroun',
			'Mouth Full of Teeth': 'auspices/Ahroun',
			'Tug the Leash': 'auspices/Ahroun',
			'Primal Anger': 'auspices/Ahroun',
			'Snarl of Challenge': 'auspices/Ahroun',
			'True Fear': 'auspices/Ahroun',
			'Wind Claws': 'auspices/Ahroun',
			'Light of the Moon': 'auspices/Ahroun',
			'Closing the Gap': 'auspices/Ahroun',
			'Kiss of Helios': 'auspices/Ahroun',
			"Luna's Armor": 'auspices/Ahroun',
			'Silver Claws': 'auspices/Ahroun',

			//Tribe Gifts
			'Curse of Aeolus': 'tribes/Black_Furies',
			'Coup de Grâce': 'tribes/Black_Furies',
			"Kali's Scar": 'tribes/Black_Furies',
			'Wasp Talons': 'tribes/Black_Furies',
			"Gorgon's Visage": 'tribes/Black_Furies',

			'Odious Aroma': 'tribes/Bone_Gnawers',
			'Face in the Crowd': 'tribes/Bone_Gnawers',
			'Streets Tell Stories': 'tribes/Bone_Gnawers',
			'A Thousand Eyes': 'tribes/Bone_Gnawers',
			'Between the Cracks': 'tribes/Bone_Gnawers',

			"Brother's Scent": 'tribes/Children_of_Gaia',
			'Calm the Furious Beast': 'tribes/Children_of_Gaia',
			'Reveal Trauma': 'tribes/Children_of_Gaia',
			"Life's Presence": 'tribes/Children_of_Gaia',
			'Share the Pain': 'tribes/Children_of_Gaia',

			Camouflage: 'tribes/Galestalkers',
			'Lacerating Wind': 'tribes/Galestalkers',
			'Chill Cloak': 'tribes/Galestalkers',
			'Blood of the Wastes': 'tribes/Galestalkers',
			'Claws of Frozen Death': 'tribes/Galestalkers',

			Augur: 'tribes/Ghost_Council',
			Blackout: 'tribes/Ghost_Council',
			"Serpent's Coil": 'tribes/Ghost_Council',
			'Hands of the Earth': 'tribes/Ghost_Council',
			'Shrouded Aspect': 'tribes/Ghost_Council',

			Skinbind: 'tribes/Glass_Walkers',
			Energize: 'tribes/Glass_Walkers',
			'Control Machine': 'tribes/Glass_Walkers',
			Doppelgänger: 'tribes/Glass_Walkers',
			'Recover Memory': 'tribes/Glass_Walkers',

			'Sacred Boundary': 'tribes/Hart_Wardens',
			'Blessed Brew': 'tribes/Hart_Wardens',
			'Territorial Dominance': 'tribes/Hart_Wardens',
			"Balor's Gaze": 'tribes/Hart_Wardens',
			'The Living Wood': 'tribes/Hart_Wardens',

			'Hidden Killer': 'tribes/Red_Talons',
			'Render Down': 'tribes/Red_Talons',
			"Gaia's Embrace": 'tribes/Red_Talons',
			Quicksand: 'tribes/Red_Talons',
			'Shield of the Wyld': 'tribes/Red_Talons',

			'Fatal Flaw': 'tribes/Shadow_Lords',
			'Icy Chill of Despair': 'tribes/Shadow_Lords',
			'Dire Distraction': 'tribes/Shadow_Lords',
			Thunderclap: 'tribes/Shadow_Lords',
			'Under the Gun': 'tribes/Shadow_Lords',

			'Fetch Bounty': 'tribes/Silent_Striders',
			'Speech of the World': 'tribes/Silent_Striders',
			'Whispered Passage': 'tribes/Silent_Striders',
			Burrow: 'tribes/Silent_Striders',
			'The Golden Path': 'tribes/Silent_Striders',

			'Pack Instinct': 'tribes/Silver_Fangs',
			'The Silver Compact': 'tribes/Silver_Fangs',
			'Blood of the Pack': 'tribes/Silver_Fangs',
			'Unity of the Pack': 'tribes/Silver_Fangs',
			"Luna's Avenger": 'tribes/Silver_Fangs',
		},
	},
	attributes: {
		Physical: ['Strength', 'Dexterity', 'Stamina'],
		Social: ['Charisma', 'Manipulation', 'Composure'],
		Mental: ['Intelligence', 'Wits', 'Resolve'],
	},
	skills: {
		Physical: [
			'Athletics',
			'Brawl',
			'Craft',
			'Drive',
			'Firearms',
			'Larceny',
			'Melee',
			'Stealth',
			'Survival',
		],
		Social: [
			'Animal Ken',
			'Etiquette',
			'Insight',
			'Intimidation',
			'Leadership',
			'Performance',
			'Persuasion',
			'Streetwise',
			'Subterfuge',
		],
		Mental: [
			'Academics',
			'Awareness',
			'Finance',
			'Investigation',
			'Medicine',
			'Occult',
			'Politics',
			'Science',
			'Technology',
		],
	},
	advantage: {
		name: 'Renown',
		codeblock: 'wta-renown',
		mode: 'renown',
	},

	health: { name: 'Health', codeblock: 'wta-health' },
	willpower: { name: 'Willpower', codeblock: 'wta-willpower' },
	exp: { name: 'Experience', codeblock: 'wta-exp' },
	merits: { name: 'Merits & Flaws', codeblock: 'wta-merits' },
	powerList: { name: 'Gifts', codeblock: 'wta-gift-list' },
};

// Config registry
export const GAME_CONFIGS: Record<string, GameConfig> = {
	vtm: VTM_CONFIG,
	wta: WTA_CONFIG,
};
