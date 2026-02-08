import { KeyValueStore } from 'lib/services/KeyValueStore';
import { BaseView } from './BaseView';
import { EventBus } from 'lib/services/EventBus';
import { AdvantageConfig } from 'lib/config/GameConfig';
import { App } from 'obsidian';

export class RenownView extends BaseView {
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private config: AdvantageConfig;
	private containerEl: HTMLElement | null = null;

	constructor(
		app: App,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
		config: AdvantageConfig,
	) {
		super(app);
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
		this.config = config;
	}

	register(source: string, element: HTMLElement, ctx: any): void {
		this.containerEl = element;
		element.empty();

		const container = element.createDiv({ cls: 'wod-renown-container' });

		const header = container.createDiv({ cls: 'wod-renown-header' });
		header.createEl('h3', {
			text: this.config.name,
			cls: 'wod-renown-title',
		});

		const categories = ['Glory', 'Honor', 'Wisdom'];
		const grid = container.createDiv({ cls: 'wod-renown-grid' });

		categories.forEach((cat) => {
			this.renderRenownColumn(grid, cat);
		});
	}

	private renderRenownColumn(container: HTMLElement, name: string) {
		const col = container.createDiv({ cls: 'wod-renown-column' });

		col.createDiv({ text: name, cls: 'wod-renown-label' });

		const key = `${this.filePath}|renown-${name.toLowerCase()}`;
		const value = this.store.get(key) ?? 0;

		const dots = col.createDiv({ cls: 'wod-renown-dots' });

		for (let i = 1; i <= 5; i++) {
			const dot = dots.createSpan({
				cls: 'wod-renown-dot',
			});

			if (i <= value) {
				dot.addClass('filled');
			}

			dot.addEventListener('click', async () => {
				const newValue = value === 1 && i === 1 ? 0 : i;
				await this.store.set(key, newValue);
				this.refresh();
			});
		}
	}

	private refresh(): void {
		if (this.containerEl) {
			this.register('', this.containerEl, {});
		}
	}
}
