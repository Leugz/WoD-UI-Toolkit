import { App, Plugin, parseYaml } from 'obsidian';
import { BaseView } from './BaseView';
import { CardView, CardEntry } from './CardView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';
import { IWodPlugin } from 'lib/interfaces/IWodPlugin';
import { VTM_CONFIG, WTA_CONFIG } from 'lib/config/GameConfig';

export class PowerListView extends BaseView {
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private plugin: IWodPlugin;

	constructor(
		app: App,
		plugin: IWodPlugin,
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

	async register(
		source: string,
		element: HTMLElement,
		ctx: any,
	): Promise<void> {
		element.empty();

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
						const iconPath =
							await this.getSmartIconPath(lookupName);

						return {
							name: e.name || 'Unnamed',
							description: e.description,
							tags: generatedTags,
							pool: e.pool,
							icon: iconPath,
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
					const iconPath = await this.getSmartIconPath(line);

					return {
						name: line,
						rating: showDots
							? (this.store.get(ratingKey) ?? 0)
							: undefined,
						icon: iconPath,
					};
				}),
			);
		}

		if (entries.length === 0) {
			element.createDiv({ text: 'No entries defined', cls: 'wod-empty' });
			return;
		}

		const cardView = new CardView(this.app, {
			title: '',
			entries: entries,
			dotColor: 'var(--wod-dot-active)',
		});

		cardView.register('', element, ctx);
	}

	private async getSmartIconPath(name: string): Promise<string | undefined> {
		if (!name) return undefined;

		const configDir = this.app.vault.configDir;
		const pluginId = this.plugin.manifest.id;
		const activeId = this.plugin.activeConfig.id;

		let fileName = name;
		const activeMap = this.plugin.activeConfig.powerSystem?.iconMap;
		if (activeMap && activeMap[name]) fileName = activeMap[name];

		const activeFolder = activeId === 'vtm' ? '/disciplines' : '';
		const activeSlug = fileName.replace(/ /g, '_');
		const activePath = `.obsidian/plugins/${pluginId}/assets/${activeId}${activeFolder}/${activeSlug}.png`;

		if (await this.app.vault.adapter.exists(activePath)) {
			return this.plugin.app.vault.adapter.getResourcePath(activePath);
		}

		const otherId = activeId === 'vtm' ? 'wta' : 'vtm';
		const otherFolder = otherId === 'vtm' ? '/disciplines' : '';

		let otherFileName = name;
		const otherConfig = otherId === 'vtm' ? VTM_CONFIG : WTA_CONFIG;
		const otherMap = otherConfig.powerSystem?.iconMap;

		if (otherMap && otherMap[name]) {
			otherFileName = otherMap[name];
		}

		const otherSlug = otherFileName.replace(/ /g, '_');
		const otherPath = `.obsidian/plugins/${pluginId}/assets/${otherId}${otherFolder}/${otherSlug}.png`;

		if (await this.app.vault.adapter.exists(otherPath)) {
			return this.plugin.app.vault.adapter.getResourcePath(otherPath);
		}

		return undefined;
	}
}
