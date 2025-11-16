import { Plugin } from 'obsidian';
import { SkillsView } from './lib/views/SkillsView';
import { AttributesView } from './lib/views/AttributesView';
import { KeyValueStore } from './lib/services/KeyValueStore';
import { HealthView } from 'lib/views/HealthView';
import { EventBus } from 'lib/services/EventBus';

export default class VtmUIToolkitPlugin extends Plugin {
	store: KeyValueStore;
	eventBus: EventBus;

	async onload() {
		console.log('VtM Plugin loading...');

		// Initialize store with plugin instance
		this.store = new KeyValueStore(this);
		this.eventBus = new EventBus();
		await this.store.load();

		const allData = this.store.getAll();
		const keys = Object.keys(allData);
		console.log('Store loaded with', keys.length, 'entries');

		// Skills
		this.registerMarkdownCodeBlockProcessor(
			'vtm-skills',
			(source, el, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const skillsView = new SkillsView(
					this.app,
					this.store,
					filePath,
				);
				skillsView.register(source, el, ctx);
			},
		);

		// Attributes
		this.registerMarkdownCodeBlockProcessor(
			'vtm-attributes',
			(source, el, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const attributesView = new AttributesView(
					this.app,
					this.store,
					filePath,
					this.eventBus,
				);
				attributesView.register(source, el, ctx);
			},
		);

		// Health
		this.registerMarkdownCodeBlockProcessor(
			'vtm-health',
			(source, element, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const healthView = new HealthView(
					this.app,
					this.store,
					filePath,
					this.eventBus,
				);

				healthView.register(source, element, ctx);
			},
		);

		console.log('VtM Plugin loaded!');
	}

	onunload() {
		console.log('VtM Plugin unloaded!');
	}
}
