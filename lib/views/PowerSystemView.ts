import { App, Plugin } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';
import { PowerSystemConfig } from '../config/GameConfig';
import { IWodPlugin } from 'lib/interfaces/IWodPlugin';
import { EMBEDDED_ASSETS } from 'lib/data/EmbeddedAssets';

export class PowerSystemView extends BaseView {
	codeblock: string;
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private config: PowerSystemConfig;
	private containerEl: HTMLElement | null = null;
	private plugin: IWodPlugin;

	constructor(
		app: App,
		plugin: IWodPlugin,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
		config: PowerSystemConfig,
	) {
		super(app);
		this.plugin = plugin;
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
		this.config = config;
		this.codeblock = config.codeblock;
	}

	register(source: string, element: HTMLElement, ctx: any): void {
		element.empty();
		this.containerEl = element;

		let disciplines: any[] = [];
		try {
			disciplines = source
				.split('\n')
				.map((line) => line.trim())
				.filter((line) => line && line !== '-');
		} catch {
			element.createDiv({
				text: '⚠️ Invalid format',
				cls: 'wod-powers-error',
			});
			return;
		}

		if (disciplines.length === 0) {
			element.createDiv({
				text: `No ${this.config.name.toLowerCase()} defined.`,
				cls: 'wod-powers-empty',
			});
			return;
		}

		const container = element.createDiv({ cls: 'wod-powers-container' });

		const header = container.createDiv({ cls: 'wod-powers-header' });
		header.createEl('h3', {
			text: this.config.name,
			cls: 'wod-powers-title',
		});

		const grid = container.createDiv({ cls: 'wod-powers-grid' });

		disciplines.forEach((disciplineName) => {
			this.renderDisciplineCard(grid, disciplineName, source);
		});
	}

	private renderDisciplineCard(
		container: HTMLElement,
		disciplineName: string,
		originalSource: string,
	): void {
		const card = container.createDiv({ cls: 'wod-power-card' });

		const ratingKey = `${this.filePath}|${this.config.codeblock}.${disciplineName}`;
		let rating = this.store.get(ratingKey) ?? 0;

		const iconEl = card.createDiv({ cls: 'wod-power-icon' });

		this.loadDisciplineIcon(iconEl, disciplineName);

		const nameEl = card.createDiv({ cls: 'wod-power-name' });
		nameEl.setText(disciplineName);

		const dotsContainer = card.createDiv({ cls: 'wod-power-dots' });

		for (let i = 1; i <= 5; i++) {
			const dot = dotsContainer.createDiv({ cls: 'wod-power-dot wod-dot' });

			if (i <= rating) {
				dot.addClass('filled');
			}

			dot.addEventListener('click', async () => {
				if (rating === 1 && i === 1) {
					await this.store.set(ratingKey, 0);
				} else {
					await this.store.set(ratingKey, i);
				}

				this.refresh(originalSource);
			});
		}
	}

	private loadDisciplineIcon(
		element: HTMLElement,
		disciplineName: string,
	): void {
		let fileName = disciplineName;

		if (this.config.iconMap && this.config.iconMap[disciplineName]) {
			fileName = this.config.iconMap[fileName];
		} else if (disciplineName === 'Blood Sorcery') {
			fileName = 'Thaumaturgy';
		}

		const disciplineSlug = fileName.replace(/ /g, '_');
		const pluginId = this.plugin.manifest.id;
		const gameId = this.config.codeblock.startsWith('vtm') ? 'vtm' : 'wta';
		const folderName = gameId === 'vtm' ? 'disciplines/' : '';
		const cleanFolder = folderName.replace(/\/$/, '');

		const embedKey = `${gameId}/${folderName}${disciplineSlug}.png`.replace(
			/\/+/g,
			'/',
		);

		if (EMBEDDED_ASSETS[embedKey]) {
			element.createEl('img', {
				attr: {
					src: EMBEDDED_ASSETS[embedKey],
					alt: disciplineName,
					title: disciplineName,
				},
				cls: 'wod-power-icon-img',
			});
			return;
		}

		const relativePath = `${this.app.vault.configDir}/plugins/${pluginId}/assets/${gameId}/${folderName}/${disciplineSlug}.png`;
		const resourceUrl =
			this.app.vault.adapter.getResourcePath(relativePath);

		const img = element.createEl('img', {
			attr: {
				src: resourceUrl,
				alt: disciplineName,
				title: disciplineName,
			},
			cls: 'wod-power-icon-img',
		});

		img.onerror = () => {
			img.remove();
			element.setText('◆');
		};
	}

	private refresh(source: string): void {
		if (this.containerEl) {
			this.containerEl.empty();
			this.register(source, this.containerEl, {});
		}
	}
}
