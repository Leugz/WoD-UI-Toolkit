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
}

export const VTM_CONFIG: GameConfig = {
	id: 'vtm',
	name: 'Vampire: The Masquerade',

	resource: {
		name: 'Hunger',
		codeblock: 'vtm-hunger',
		max: 5,
		icon: '🩸',
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
};

// WIP
export const WTA_CONFIG: Partial<GameConfig> = {
	id: 'wta',
	name: 'Werewolf: The Apocalypse',
	resource: {
		name: 'Rage',
		codeblock: 'wta-rage',
		max: 5,
		icon: '🐺',
		levels: [], // To be defined
	},
	// ... other configs
};

// Config registry
export const GAME_CONFIGS: Record<string, GameConfig> = {
	vtm: VTM_CONFIG,
	// wta: WTA_CONFIG as GameConfig, // When ready
};
