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
	BaseTrackerConfig,
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

		record.register<BaseTrackerConfig>(
			'health',
			'health',
			(config, ctx) =>
				new HealthView(
					this.app,
					this.store,
					ctx.sourcePath,
					this.eventBus,
				),
		);

		record.register<BaseTrackerConfig>(
			'willpower',
			'willpower',
			(config, ctx) =>
				new WillpowerView(
					this.app,
					this.store,
					ctx.sourcePath,
					this.eventBus,
				),
		);

		record.register<BaseTrackerConfig>(
			'xp',
			'experience',
			(config, ctx) =>
				new ExperienceTrackerView(
					this.app,
					this.store,
					ctx.sourcePath,
					this.eventBus,
				),
		);

		// merits & flaws
		record.register<BaseTrackerConfig>(
			'merits',
			'merits',
			(config, ctx) =>
				new MeritsFlawsListView(
					this.app,
					this.store,
					ctx.sourcePath,
					this.eventBus,
				),
		);

		record.register<BaseTrackerConfig>(
			'power-list',
			'powerList',
			(config, ctx) =>
				new PowerListView(
					this.app,
					this,
					this.store,
					ctx.sourcePath,
					this.eventBus,
				),
		);

		// LEGACY / SPECIFIC COMPONENTS (These might need refactoring)

		// Blood Potency
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
