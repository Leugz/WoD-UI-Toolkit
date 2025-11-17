import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

export class WillpowerView extends BaseView {
	codeblock = 'vtm-willpower';
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private containerEl: HTMLElement | null = null;

	constructor(
		app: App,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
	) {
		super(app);
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;

		// Listen for Composure or Resolve changes
		this.eventBus.on(`${this.filePath}:composure-changed`, () => {
			if (this.containerEl) {
				this.containerEl.empty();
				this.register('', this.containerEl, {});
			}
		});
		this.eventBus.on(`${this.filePath}:resolve-changed`, () => {
			if (this.containerEl) {
				this.containerEl.empty();
				this.register('', this.containerEl, {});
			}
		});
	}

	register(source: string, el: HTMLElement, ctx: any): void {
		el.empty();
		this.containerEl = el;

		const container = el.createDiv({ cls: 'vtm-willpower-container' });

		// Calculate max willpower (Composure + Resolve)
		const composureKey = `${this.filePath}|attribute.Composure`;
		const resolveKey = `${this.filePath}|attribute.Resolve`;
		const composure = this.store.get(composureKey) ?? 1;
		const resolve = this.store.get(resolveKey) ?? 1;
		const maxWillpower = composure + resolve;

		// Get current willpower
		const currentKey = `${this.filePath}|willpower.current`;
		let currentWillpower = this.store.get(currentKey);

		// If never set, default to max
		if (currentWillpower === undefined) {
			currentWillpower = maxWillpower;
			this.store.set(currentKey, maxWillpower);
		}

		// Header with inline reset button
		const header = container.createDiv({ cls: 'vtm-willpower-header' });
		header.createEl('h3', {
			text: 'Willpower',
			cls: 'vtm-willpower-title',
		});

		const rightSide = header.createDiv({
			cls: 'vtm-willpower-header-right',
		});

		// Reset button first
		const resetBtn = rightSide.createEl('button', {
			text: '↻',
			cls: 'vtm-willpower-reset-btn',
			attr: { 'aria-label': 'Reset to max' },
		});
		resetBtn.addEventListener('click', () => {
			this.setWillpower(maxWillpower, container);
		});

		// Counter second
		const counter = rightSide.createDiv({ cls: 'vtm-willpower-counter' });
		counter.setText(`${currentWillpower} / ${maxWillpower}`);

		// Willpower boxes
		const boxesContainer = container.createDiv({
			cls: 'vtm-willpower-boxes',
		});

		for (let i = 0; i < maxWillpower; i++) {
			this.renderWillpowerBox(boxesContainer, i, currentWillpower);
		}
	}

	private renderWillpowerBox(
		container: HTMLElement,
		index: number,
		currentWillpower: number,
	): void {
		const box = container.createDiv({ cls: 'vtm-willpower-box' });

		if (index < currentWillpower) {
			box.setText('●');
			box.addClass('filled');
		} else {
			box.setText('○');
		}

		// Click to set willpower to this level
		// Special case: clicking the first filled box when willpower=1 sets to 0
		box.addEventListener('click', () => {
			if (currentWillpower === 1 && index === 0) {
				this.setWillpower(0, container);
			} else {
				this.setWillpower(index + 1, container);
			}
		});
	}

	private async setWillpower(
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const currentKey = `${this.filePath}|willpower.current`;
		await this.store.set(currentKey, value);

		// Re-render using the same pattern as other views
		let rootContainer = container;
		while (
			rootContainer &&
			!rootContainer.classList.contains('vtm-willpower-container')
		) {
			rootContainer = rootContainer.parentElement!;
		}

		const parentEl = rootContainer.parentElement!;
		parentEl.empty();
		this.register('', parentEl, {});
	}
}
