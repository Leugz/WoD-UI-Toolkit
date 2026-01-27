import { Plugin } from 'obsidian';
import { KeyValueStore } from './lib/services/KeyValueStore';
import { EventBus } from 'lib/services/EventBus';
import {
	VTM_CONFIG,
	WTA_CONFIG,
	GameConfig,
	ResourceConfig,
	MoralityConfig,
	PowerSystemConfig,
} from 'lib/config/GameConfig';
import {
	WodSettings,
	DEFAULT_SETTINGS,
	WodSettingsTab,
} from 'lib/settings/Settings';

// views
import { SkillsView } from './lib/views/SkillsView';
import { AttributesView } from './lib/views/AttributesView';
import { HealthView } from 'lib/views/HealthView';
import { WillpowerView } from 'lib/views/WillpowerView';
import { ResourceTrackerView } from 'lib/views/ResourceTrackerView';
import { MoralityTrackerView } from 'lib/views/MoralityTrackerView';
import { PowerSystemView } from 'lib/views/PowerSystemView';
import { PowerListView } from 'lib/views/PowerView';
import { BloodPotencyView } from 'lib/views/BloodPotencyView';
import { ExperienceTrackerView } from 'lib/views/ExperienceTrackerView';
import { MeritsFlawsListView } from 'lib/views/MeritsFlawsView';
import { ViewRegister } from 'lib/utils/ViewRegister';

export default class WodUIToolkitPlugin extends Plugin {
	store: KeyValueStore;
	eventBus: EventBus;
	settings: WodSettings;
	activeConfig: GameConfig;

	async onload() {
		console.log('WoD UI Toolkit loading...');
		await this.loadSettings();

		if (this.settings.gameSystem == 'wta') {
			this.activeConfig = WTA_CONFIG;
		} else {
			this.activeConfig = VTM_CONFIG;
		}

		this.store = new KeyValueStore(this);
		this.eventBus = new EventBus();
		await this.store.load();

		this.addSettingTab(new WodSettingsTab(this.app, this));

		const record = new ViewRegister(this);

		// hunger | rage
		record.register<ResourceConfig>(
			'resource',
			'resource',
			(config, ctx) =>
				new ResourceTrackerView(
					this.app,
					this,
					this.store,
					ctx.sourcePath,
					this.eventBus,
					config,
				),
		);

		// humanity | harmony
		record.register<MoralityConfig>(
			'morality',
			'morality',
			(config, ctx) =>
				new MoralityTrackerView(
					this.app,
					this.store,
					ctx.sourcePath,
					this.eventBus,
					config,
				),
		);

		// disciplines / gifts
		record.register<PowerSystemConfig>(
			'powers',
			'powerSystem',
			(config, ctx) =>
				new PowerSystemView(
					this.app,
					this,
					this.store,
					ctx.sourcePath,
					this.eventBus,
					config,
				),
		);

		record.register<Record<string, string[]>>(
			'attributes',
			'attributes',
			(config, ctx) =>
				new AttributesView(
					this.app,
					this.store,
					ctx.sourcePath,
					this.eventBus,
					config,
				),
		);

		record.register<Record<string, string[]>>(
			'skills',
			'skills',
			(config, ctx) =>
				new SkillsView(this.app, this.store, ctx.sourcePath, config),
		);

		// old \/

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
		registerHealth('vtm-health');
		registerHealth('wod-health');

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
		registerWillpower('vtm-willpower');
		registerWillpower('wod-willpower');

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

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
