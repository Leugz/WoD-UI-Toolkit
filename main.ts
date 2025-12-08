import { Plugin } from 'obsidian';
import { KeyValueStore } from './lib/services/KeyValueStore';
import { EventBus } from 'lib/services/EventBus';
import { VTM_CONFIG } from 'lib/config/GameConfig';

// views
import { SkillsView } from './lib/views/SkillsView';
import { AttributesView } from './lib/views/AttributesView';
import { HealthView } from 'lib/views/HealthView';
import { WillpowerView } from 'lib/views/WillpowerView';
import { ResourceTrackerView } from 'lib/views/HungerView';
import { MoralityTrackerView } from 'lib/views/MoralityTrackerView';
import { PowerSystemView } from 'lib/views/PowerSystemView';
import { PowerListView } from 'lib/views/PowerView';
import { BloodPotencyView } from 'lib/views/BloodPotencyView';
import { ExperienceTrackerView } from 'lib/views/ExperienceTrackerView';
import { MeritsFlawsListView } from 'lib/views/MeritsFlawsView';

export default class WodUIToolkitPlugin extends Plugin {
	store: KeyValueStore;
	eventBus: EventBus;

	async onload() {
		console.log('WoD UI Toolkit loading...');

		this.store = new KeyValueStore(this);
		this.eventBus = new EventBus();
		await this.store.load();

		// CORE WOD TRACKERS

		const registerResource = (codeblockId: string) => {
			this.registerMarkdownCodeBlockProcessor(
				codeblockId,
				(source, el, ctx) => {
					const view = new ResourceTrackerView(
						this.app,
						this.store,
						ctx.sourcePath || 'unknown',
						this.eventBus,
						VTM_CONFIG.resource,
					);
					view.register(source, el, ctx);
				},
			);
		};
		registerResource('wod-resource');
		registerResource('vtm-hunger');

		const registerMorality = (codeblockId: string) => {
			this.registerMarkdownCodeBlockProcessor(
				codeblockId,
				(source, el, ctx) => {
					const view = new MoralityTrackerView(
						this.app,
						this.store,
						ctx.sourcePath || 'unknown',
						this.eventBus,
						VTM_CONFIG.morality,
					);
					view.register(source, el, ctx);
				},
			);
		};
		registerMorality('wod-morality');
		registerMorality('vtm-humanity');

		// Disciplines
		const registerPowerSystem = (codeblockId: string) => {
			this.registerMarkdownCodeBlockProcessor(
				codeblockId,
				(source, el, ctx) => {
					const view = new PowerSystemView(
						this.app,
						this,
						this.store,
						ctx.sourcePath || 'unknown',
						this.eventBus,
						VTM_CONFIG.powerSystem,
					);
					view.register(source, el, ctx);
				},
			);
		};
		registerPowerSystem('wod-powers');
		registerPowerSystem('vtm-disciplines');

		const registerPowerList = (codeblockId: string) => {
			this.registerMarkdownCodeBlockProcessor(
				codeblockId,
				(source, el, ctx) => {
					const view = new PowerListView(
						this.app,
						this,
						this.store,
						ctx.sourcePath || 'unknown',
						this.eventBus,
					);
					view.register(source, el, ctx);
				},
			);
		};
		registerPowerList('wod-power-list');
		registerPowerList('vtm-power-list');

		// CHARACTER SHEET FUNDAMENTALS

		const registerHealth = (codeblockId: string) => {
			this.registerMarkdownCodeBlockProcessor(
				codeblockId,
				(source, el, ctx) => {
					const view = new HealthView(
						this.app,
						this.store,
						ctx.sourcePath,
						this.eventBus,
					);
					view.register(source, el, ctx);
				},
			);
		};
		registerHealth('wod-health');
		registerHealth('vtm-health');

		const registerWillpower = (codeblockId: string) => {
			this.registerMarkdownCodeBlockProcessor(
				codeblockId,
				(source, el, ctx) => {
					const view = new WillpowerView(
						this.app,
						this.store,
						ctx.sourcePath,
						this.eventBus,
					);
					view.register(source, el, ctx);
				},
			);
		};
		registerWillpower('wod-willpower');
		registerWillpower('vtm-willpower');

		const registerXp = (codeblockId: string) => {
			this.registerMarkdownCodeBlockProcessor(
				codeblockId,
				(source, el, ctx) => {
					const view = new ExperienceTrackerView(
						this.app,
						this.store,
						ctx.sourcePath,
						this.eventBus,
					);
					view.register(source, el, ctx);
				},
			);
		};
		registerXp('wod-xp');
		registerXp('vtm-experience');

		// Merits & Flaws
		const registerMerits = (codeblockId: string) => {
			this.registerMarkdownCodeBlockProcessor(
				codeblockId,
				(source, el, ctx) => {
					const view = new MeritsFlawsListView(
						this.app,
						this.store,
						ctx.sourcePath,
						this.eventBus,
					);
					view.register(source, el, ctx);
				},
			);
		};
		registerMerits('wod-merits');
		registerMerits('vtm-merits-flaws-list');

		// LEGACY / SPECIFIC COMPONENTS (These might need refactoring)

		// Attributes
		this.registerMarkdownCodeBlockProcessor(
			'vtm-attributes',
			(source, el, ctx) => {
				const view = new AttributesView(
					this.app,
					this.store,
					ctx.sourcePath,
					this.eventBus,
				);
				view.register(source, el, ctx);
			},
		);

		// Skills
		this.registerMarkdownCodeBlockProcessor(
			'vtm-skills',
			(source, el, ctx) => {
				const view = new SkillsView(
					this.app,
					this.store,
					ctx.sourcePath,
				);
				view.register(source, el, ctx);
			},
		);

		// Blood Potency (Very specific to VtM/Requiem)
		this.registerMarkdownCodeBlockProcessor(
			'vtm-blood-potency',
			(source, el, ctx) => {
				const view = new BloodPotencyView(
					this.app,
					this.store,
					ctx.sourcePath,
					this.eventBus,
				);
				view.register(source, el, ctx);
			},
		);

		console.log('WoD UI Toolkit loaded!');
	}

	onunload() {
		console.log('WoD UI Toolkit unloaded!');
	}
}
