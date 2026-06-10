import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';
import { GAME_CONFIGS, PowerSystemConfig } from '../config/GameConfig';
import { IWodPlugin } from 'lib/interfaces/IWodPlugin';
import { IconResolver } from 'lib/services/IconResolver';

export class PowerSystemView extends BaseView {
	codeblock: string;
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private config: PowerSystemConfig;
	private plugin: IWodPlugin;
	private iconResolver: IconResolver;

	constructor(
		app: App,
		containerEl: HTMLElement,
		plugin: IWodPlugin,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
		config: PowerSystemConfig,
	) {
		super(app, containerEl);
		this.plugin = plugin;
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
		this.config = config;
		this.codeblock = config.codeblock;
		this.iconResolver = new IconResolver(app, plugin);
	}

	async render(source: string): Promise<void> {
		this.source = source;
		this.containerEl.empty();

		let disciplines: any[] = [];
		try {
			disciplines = source
				.split('\n')
				.map((line) => line.trim())
				.filter((line) => line && line !== '-');
		} catch {
			this.containerEl.createDiv({
				text: 'Invalid format',
				cls: 'wod-powers-error',
			});
			return;
		}

		if (disciplines.length === 0) {
			this.containerEl.createDiv({
				text: `No ${this.config.name.toLowerCase()} defined.`,
				cls: 'wod-powers-empty',
			});
			return;
		}

		const container = this.containerEl.createDiv({
			cls: 'wod-powers-container',
		});

		const header = container.createDiv({ cls: 'wod-powers-header' });
		header.createEl('h3', {
			text: this.config.name,
			cls: 'wod-powers-title',
		});

		const grid = container.createDiv({ cls: 'wod-powers-grid' });

		await Promise.all(
			disciplines.map((name) =>
				this.renderDisciplineCard(grid, name, source),
			),
		);
	}

	private async renderDisciplineCard(
		container: HTMLElement,
		disciplineName: string,
		originalSource: string,
	): Promise<void> {
		const card = container.createDiv({ cls: 'wod-power-card' });

		const ratingKey = `${this.filePath}|${this.config.codeblock}.${disciplineName}`;
		let rating = this.store.get(ratingKey) ?? 0;

		const iconEl = card.createDiv({ cls: 'wod-power-icon' });

		const gameId = this.config.codeblock.startsWith('vtm') ? 'vtm' : 'wta';
		const gameConfig = GAME_CONFIGS[gameId];
		const src = await this.iconResolver.resolve(disciplineName, gameConfig);

		if (src) {
			iconEl.createEl('img', {
				attr: { src, alt: disciplineName, title: disciplineName },
				cls: 'wod-power-icon-img',
			});
		} else {
			iconEl.setText('◆');
		}

		card.createDiv({ cls: 'wod-power-name' }).setText(disciplineName);

		const dotsContainer = card.createDiv({ cls: 'wod-power-dots' });

		for (let i = 1; i <= 5; i++) {
			const dot = dotsContainer.createDiv({
				cls: 'wod-power-dot wod-dot',
			});

			if (i <= rating) dot.addClass('filled');

			dot.addEventListener('click', async () => {
				await this.store.set(
					ratingKey,
					rating === 1 && i === 1 ? 0 : i,
				);
				this.refresh();
			});
		}
	}
}
