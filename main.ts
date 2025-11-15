import { Plugin } from 'obsidian';
import { SkillsView } from './lib/views/SkillsView';
import { AttributesView } from './lib/views/AttributesView';
import { KeyValueStore } from './lib/services/KeyValueStore';

export default class VtmUIToolkitPlugin extends Plugin {
	store: KeyValueStore;

	async onload() {
		console.log('VtM Plugin loading...');

		// Initialize store with plugin instance
		this.store = new KeyValueStore(this);
		await this.store.load();

		const allData = this.store.getAll();
		const keys = Object.keys(allData);
		console.log('Store loaded with', keys.length, 'entries');
		console.log('Keys:', keys);

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

		this.registerMarkdownCodeBlockProcessor(
			'vtm-attributes',
			(source, el, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const attributesView = new AttributesView(
					this.app,
					this.store,
					filePath,
				);
				attributesView.register(source, el, ctx);
			},
		);

		console.log('VtM Plugin loaded!');
	}

	onunload() {
		console.log('VtM Plugin unloaded!');
	}
}
