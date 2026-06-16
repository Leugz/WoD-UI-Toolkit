import { GameConfig } from "./types";

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
