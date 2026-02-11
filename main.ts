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
	AdvantageConfig,
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
import { RenownView } from 'lib/views/RenownView';

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

		// disciplines
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

		// blood potency & renown
		record.register<AdvantageConfig>(
			'advantage',
			'advantage',
			(config, ctx) => {
				if (config.mode === 'renown') {
					return new RenownView(
						this.app,
						this.store,
						ctx.sourcePath,
						this.eventBus,
						config,
					);
				} else {
					return new BloodPotencyView(
						this.app,
						this.store,
						ctx.sourcePath,
						this.eventBus,
					);
				}
			},
		);

		const simpleTrackers = [
			'health',
			'willpower',
			'experience',
			'merits',
			'powerList',
		] as const;

		simpleTrackers.forEach((key) => {
			if (this.activeConfig[key]) {
				record.register<BaseTrackerConfig>(key, key, (config, ctx) => {
					switch (key) {
						case 'health':
							return new HealthView(
								this.app,
								this.store,
								ctx.sourcePath,
								this.eventBus,
							);
						case 'willpower':
							return new WillpowerView(
								this.app,
								this.store,
								ctx.sourcePath,
								this.eventBus,
							);
						case 'experience':
							return new ExperienceTrackerView(
								this.app,
								this.store,
								ctx.sourcePath,
								this.eventBus,
							);
						case 'merits':
							return new MeritsFlawsListView(
								this.app,
								this.store,
								ctx.sourcePath,
								this.eventBus,
							);
						case 'powerList':
							return new PowerListView(
								this.app,
								this,
								this.store,
								ctx.sourcePath,
								this.eventBus,
							);
						default:
							throw new Error(`Unknown tracker: ${key}`);
					}
				});
			}
		});

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
