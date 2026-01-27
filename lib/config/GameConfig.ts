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

export interface GameConfig {
	id: string;
	name: string;
	resource: ResourceConfig;
	morality: MoralityConfig;
	powerSystem: PowerSystemConfig;
	attributes: Record<string, string[]>;
	skills: Record<string, string[]>;
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
};

// WIP
export const WTA_CONFIG: GameConfig = {
	id: 'wta',
	name: 'Werewolf: The Apocalypse',
	resource: {
		name: 'Rage',
		codeblock: 'wta-rage',
		max: 5,
		icon: '🐺',
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
};

// Config registry
export const GAME_CONFIGS: Record<string, GameConfig> = {
	vtm: VTM_CONFIG,
	wta: WTA_CONFIG,
};
