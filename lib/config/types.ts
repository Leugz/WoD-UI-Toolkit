import { GAME_CONFIGS } from './GameConfig';

export type GameSystemId = keyof typeof GAME_CONFIGS;

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
