import { Plugin } from 'obsidian';
import { KeyValueStore } from './lib/services/KeyValueStore';
import { EventBus } from 'lib/services/EventBus';
import {
	VTM_CONFIG,
	GameConfig,
	ResourceConfig,
	MoralityConfig,
	PowerSystemConfig,
	BaseTrackerConfig,
	AdvantageConfig,
	GAME_CONFIGS,
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
	store!: KeyValueStore;
	eventBus!: EventBus;
	settings!: WodSettings;
	activeConfig!: GameConfig;

	async onload() {
		console.log('WoD UI Toolkit loading...');
		await this.loadSettings();

		this.activeConfig =
			GAME_CONFIGS[this.settings.gameSystem] ?? VTM_CONFIG;

		this.store = new KeyValueStore(this);
		this.eventBus = new EventBus();
		await this.store.load();
		await this.purgeOrphanedData();

		this.registerEvent(
			this.app.vault.on('delete', (file) => {
				this.store.deleteByPrefix(file.path);
			}),
		);

		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				this.store.renamePrefix(oldPath, file.path);
			}),
		);

		this.addSettingTab(new WodSettingsTab(this.app, this));

		const record = new ViewRegister(this);

		// hunger | rage
		record.register<ResourceConfig>(
			'resource',
			'resource',
			(config, el, ctx) =>
				new ResourceTrackerView(
					this.app,
					el,
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
			(config, el, ctx) =>
				new MoralityTrackerView(
					this.app,
					el,
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
			(config, el, ctx) =>
				new PowerSystemView(
					this.app,
					el,
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
			(config, el, ctx) =>
				new AttributesView(
					this.app,
					el,
					this.store,
					ctx.sourcePath,
					this.eventBus,
					config,
				),
		);

		record.register<Record<string, string[]>>(
			'skills',
			'skills',
			(config, el, ctx) =>
				new SkillsView(
					this.app,
					el,
					this.store,
					ctx.sourcePath,
					config,
				),
		);

		// blood potency & renown
		record.register<AdvantageConfig>(
			'advantage',
			'advantage',
			(config, el, ctx) => {
				if (config.mode === 'renown') {
					return new RenownView(
						this.app,
						el,
						this.store,
						ctx.sourcePath,
						this.eventBus,
						config,
					);
				} else {
					return new BloodPotencyView(
						this.app,
						el,
						this.store,
						ctx.sourcePath,
						this.eventBus,
					);
				}
			},
		);

		record.register<BaseTrackerConfig>(
			'health',
			'health',
			(_, el, ctx) =>
				new HealthView(
					this.app,
					el,
					this.store,
					ctx.sourcePath,
					this.eventBus,
				),
		);

		record.register<BaseTrackerConfig>(
			'willpower',
			'willpower',
			(_, el, ctx) =>
				new WillpowerView(
					this.app,
					el,
					this.store,
					ctx.sourcePath,
					this.eventBus,
				),
		);

		record.register<BaseTrackerConfig>(
			'exp',
			'exp',
			(_, el, ctx) =>
				new ExperienceTrackerView(
					this.app,
					el,
					this.store,
					ctx.sourcePath,
					this.eventBus,
				),
		);

		record.register<BaseTrackerConfig>(
			'merits',
			'merits',
			(_, el, ctx) =>
				new MeritsFlawsListView(
					this.app,
					el,
					this.store,
					ctx.sourcePath,
					this.eventBus,
				),
		);

		record.register<BaseTrackerConfig>(
			'powerList',
			'powerList',
			(_, el, ctx) =>
				new PowerListView(
					this.app,
					el,
					this,
					this.store,
					ctx.sourcePath,
					this.eventBus,
				),
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

	private async purgeOrphanedData(): Promise<void> {
		const paths = new Set(
			this.store.getKeys().map((key) => key.split('|')[0]),
		);

		for (const path of paths) {
			const exists = await this.app.vault.adapter.exists(path);

			if (!exists) {
				this.store.deleteByPrefix(path);
			}
		}
	}
}
