import { App, Plugin, parseYaml } from 'obsidian';
import { BaseView } from './BaseView';
import { CardView, CardEntry } from './CardView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

export class PowerListView extends BaseView {
	codeblock = 'wod-powers-list';
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private plugin: Plugin;

	constructor(
		app: App,
		plugin: Plugin,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
	) {
		super(app);
		this.plugin = plugin;
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
	}

	register(source: string, el: HTMLElement, ctx: any): void {
		el.empty();

		let powers: any[] = [];
		try {
			powers = parseYaml(source) || [];
		} catch {
			el.createDiv({ text: '⚠️ Invalid YAML format', cls: 'wod-error' });
			return;
		}

		const entries: CardEntry[] = powers.map((power) => {
			const tags = [];
			if (power.discipline) tags.push(power.discipline);
			if (power.level) tags.push(`Level ${power.level}`);

			return {
				name: power.name || 'Unnamed',
				description: power.description,
				rating: undefined,
				tags,
				icon: this.getPowerIconUrl(power.discipline),
			};
		});

		const cardView = new CardView(this.app, {
			title: 'Powers / Gifts',
			entries,
			maxRatingDefault: 5,
			dotColor: 'rgb(147, 51, 234)',
		});

		cardView.register('', el, ctx);
	}

	private getPowerIconUrl(powerName?: string): string {
		if (!powerName) return '◆';

		let fileName = powerName;
		if (powerName === 'Blood Sorcery') fileName = 'Thaumaturgy';
		if (powerName === 'Thin-Blood Alchemy') fileName = 'Thinblood_alchemy';

		const slug = fileName.replace(/ /g, '_');
		const pluginId = this.plugin.manifest.id;
		const relativePath = `${this.app.vault.configDir}/plugins/${pluginId}/assets/disciplines/${slug}.png`;

		return this.app.vault.adapter.getResourcePath(relativePath);
	}
}
