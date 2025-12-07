import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';
import { ResourceConfig } from '../config/GameConfig';

export class ResourceTrackerView extends BaseView {
	codeblock: string;
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private config: ResourceConfig;
	private containerEl: HTMLElement | null = null;

	constructor(
		app: App,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
		config: ResourceConfig,
	) {
		super(app);
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
		this.config = config;
		this.codeblock = config.codeblock;
	}

	register(source: string, el: HTMLElement, ctx: any): void {
		el.empty();
		this.containerEl = el;

		const container = el.createDiv({ cls: 'vtm-resource-container' });

		const resourceKey = `${this.filePath}|${this.config.codeblock}`;
		let currentValue = this.store.get(resourceKey) ?? 0;

		const header = container.createDiv({ cls: 'vtm-resource-header' });
		const titleDiv = header.createDiv({ cls: 'vtm-resource-title-group' });

		const icon = titleDiv.createSpan({ cls: 'vtm-resource-icon' });
		icon.setText(this.config.icon);

		titleDiv.createEl('h3', {
			text: this.config.name,
			cls: 'vtm-resource-title',
		});

		const rightSide = header.createDiv({
			cls: 'vtm-resource-header-right',
		});

		const resetBtn = rightSide.createEl('button', {
			text: '↻',
			cls: 'vtm-resource-reset-btn',
			attr: { 'aria-label': 'Reset to 0' },
		});
		resetBtn.addEventListener('click', () => {
			this.setValue(0, container);
		});

		const level = this.config.levels.find((l) => l.value === currentValue);
		const levelLabel = rightSide.createDiv({ cls: 'vtm-resource-level' });
		levelLabel.setText(level?.label || '');

		if (currentValue >= this.config.max - 1) {
			levelLabel.addClass('danger');
		} else if (currentValue >= Math.floor(this.config.max / 2)) {
			levelLabel.addClass('warning');
		}

		const iconsContainer = container.createDiv({
			cls: 'vtm-resource-icons',
		});

		for (let i = 0; i < this.config.max; i++) {
			this.renderIcon(iconsContainer, i, currentValue, container);
		}

		// Description
		const currentLevel = this.config.levels.find(
			(l) => l.value === currentValue,
		);
		if (currentLevel) {
			const desc = container.createDiv({
				cls: 'vtm-resource-description',
			});
			desc.setText(currentLevel.description);
		}
	}

	private renderIcon(
		container: HTMLElement,
		index: number,
		currentValue: number,
		rootContainer: HTMLElement,
	): void {
		const icon = container.createDiv({ cls: 'vtm-resource-icon-dot' });

		if (index < currentValue) {
			icon.setText('⬢');
			icon.addClass('filled');
		} else {
			icon.setText('⬡');
		}

		icon.addEventListener('click', () => {
			if (currentValue === 1 && index === 0) {
				this.setValue(0, rootContainer);
			} else {
				this.setValue(index + 1, rootContainer);
			}
		});
	}

	private async setValue(
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const resourceKey = `${this.filePath}|${this.config.codeblock}`;
		await this.store.set(resourceKey, value);
		this.refresh(container);
	}

	private refresh(container: HTMLElement): void {
		let rootContainer = container;
		while (
			rootContainer &&
			!rootContainer.classList.contains('vtm-resource-container')
		) {
			rootContainer = rootContainer.parentElement!;
		}

		const parentEl = rootContainer.parentElement!;
		parentEl.empty();
		this.register('', parentEl, {});
	}
}

// VTM-specific wrapper
export class HungerView extends ResourceTrackerView {
	constructor(
		app: App,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
		config: ResourceConfig,
	) {
		super(app, store, filePath, eventBus, config);
	}
}
