import { App, Plugin, parseYaml } from 'obsidian';
import { BaseView } from './BaseView';
import { CardView, CardEntry } from './CardView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';
import { IWodPlugin } from 'lib/interfaces/IWodPlugin';
import { VTM_CONFIG, WTA_CONFIG } from 'lib/config/GameConfig';
import { EMBEDDED_ASSETS } from '../data/EmbeddedAssets';
import { IconResolver } from 'lib/services/IconResolver';

export class PowerListView extends BaseView {
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private plugin: IWodPlugin;
	private iconResolver: IconResolver;

	constructor(
		app: App,
		containerEl: HTMLElement,
		plugin: IWodPlugin,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
	) {
		super(app, containerEl);
		this.plugin = plugin;
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
		this.iconResolver = new IconResolver(app, plugin);
	}

	async render(source: string): Promise<void> {
		this.source = source;
		this.containerEl.empty();

		let entries: CardEntry[] = [];
		let isYaml = false;

		try {
			const parsed = parseYaml(source);
			if (Array.isArray(parsed) && typeof parsed[0] === 'object') {
				isYaml = true;

				entries = await Promise.all(
					parsed.map(async (e: any) => {
						const generatedTags = [...(e.tags || [])];

						if (!e.tags && e.discipline)
							generatedTags.push(e.discipline);
						if (e.level) generatedTags.push(`Level ${e.level}`);

						const lookupName = e.icon || e.discipline || e.name;
						const iconSrc = await this.iconResolver.resolve(
							lookupName,
							this.plugin.activeConfig,
						);

						return {
							name: e.name || 'Unnamed',
							description: e.description,
							tags: generatedTags,
							pool: e.pool,
							icon: iconSrc,
							rating: undefined,
						};
					}),
				);
			}
		} catch (error) {
			console.log(error);
		}

		if (!isYaml) {
			const lines = source
				.split('\n')
				.map((line) => line.trim())
				.filter((line) => line && line !== '-');

			entries = await Promise.all(
				lines.map(async (line) => {
					const showDots = this.plugin.activeConfig.id === 'vtm';
					const ratingKey = `${this.filePath}|${this.plugin.activeConfig.powerSystem.codeblock}.${line}`;
					const iconSrc = await this.iconResolver.resolve(
						line,
						this.plugin.activeConfig,
					);

					return {
						name: line,
						rating: showDots
							? (this.store.get(ratingKey) ?? 0)
							: undefined,
						icon: iconSrc,
					};
				}),
			);
		}

		if (entries.length === 0) {
			this.containerEl.createDiv({
				text: 'No entries defined',
				cls: 'wod-empty',
			});
			return;
		}

		const cardView = new CardView(this.app, {
			title: '',
			entries: entries,
			dotColor: 'var(--wod-dot-active)',
		});

		cardView.render(this.containerEl);
	}
}
