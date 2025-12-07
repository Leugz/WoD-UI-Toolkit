import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

export class ExperienceTrackerView extends BaseView {
	codeblock = 'vtm-experience';
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
	}

	register(source: string, el: HTMLElement, ctx: any): void {
		el.empty();
		this.containerEl = el;

		const container = el.createDiv({ cls: 'vtm-experience-container' });

		// Get values
		const totalKey = `${this.filePath}|experience.total`;
		const spentKey = `${this.filePath}|experience.spent`;

		let totalXP = this.store.get(totalKey) ?? 0;
		let spentXP = this.store.get(spentKey) ?? 0;
		let availableXP = totalXP - spentXP;

		// Title
		const title = container.createDiv({ cls: 'vtm-xp-title' });
		title.setText('Experience');

		// XP Cards Grid
		const cardsGrid = container.createDiv({ cls: 'vtm-xp-cards' });

		// Total XP Card
		this.renderXPCard(cardsGrid, 'Total XP', totalXP, 'total');

		// Spent XP Card
		this.renderXPCard(cardsGrid, 'Spent XP', spentXP, 'spent');

		// Available XP Card (read-only)
		this.renderXPCard(cardsGrid, 'Available XP', availableXP, 'available');

		// Controls for Total XP
		this.renderControls(container, 'Total XP', totalXP, (val) =>
			this.updateTotal(val, container),
		);

		// Controls for Spent XP
		this.renderControls(container, 'Spent XP', spentXP, (val) =>
			this.updateSpent(val, container),
		);

		// Reset Button
		const resetContainer = container.createDiv({
			cls: 'vtm-xp-reset-container',
		});
		const resetBtn = resetContainer.createEl('button', {
			text: 'Reset All',
			cls: 'vtm-xp-reset-btn',
		});
		resetBtn.addEventListener('click', () => {
			this.resetAll(container);
		});
	}

	private renderXPCard(
		container: HTMLElement,
		label: string,
		value: number,
		type: 'total' | 'spent' | 'available',
	): void {
		const card = container.createDiv({ cls: `vtm-xp-card ${type}` });

		const labelEl = card.createDiv({ cls: 'vtm-xp-card-label' });
		labelEl.setText(label);

		const valueEl = card.createDiv({ cls: 'vtm-xp-card-value' });
		valueEl.setText(value.toString());
	}

	private renderControls(
		container: HTMLElement,
		label: string,
		value: number,
		onChange: (val: number) => void,
	): void {
		const controls = container.createDiv({ cls: 'vtm-xp-controls' });

		const labelEl = controls.createDiv({ cls: 'vtm-xp-controls-label' });
		labelEl.setText(label);

		const buttons = controls.createDiv({ cls: 'vtm-xp-buttons' });

		// -10 button
		const minus10 = buttons.createEl('button', {
			text: '-10',
			cls: 'vtm-xp-btn',
		});
		minus10.addEventListener('click', () => {
			onChange(Math.max(0, value - 10));
		});

		// -1 button
		const minus1 = buttons.createEl('button', {
			text: '-1',
			cls: 'vtm-xp-btn',
		});
		minus1.addEventListener('click', () => {
			if (value > 0) onChange(value - 1);
		});

		// +1 button
		const plus1 = buttons.createEl('button', {
			text: '+1',
			cls: 'vtm-xp-btn',
		});
		plus1.addEventListener('click', () => {
			onChange(value + 1);
		});

		// +10 button
		const plus10 = buttons.createEl('button', {
			text: '+10',
			cls: 'vtm-xp-btn',
		});
		plus10.addEventListener('click', () => {
			onChange(value + 10);
		});
	}

	private async updateTotal(
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const totalKey = `${this.filePath}|experience.total`;
		await this.store.set(totalKey, value);
		this.refresh(container);
	}

	private async updateSpent(
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const spentKey = `${this.filePath}|experience.spent`;
		await this.store.set(spentKey, value);
		this.refresh(container);
	}

	private async resetAll(container: HTMLElement): Promise<void> {
		const totalKey = `${this.filePath}|experience.total`;
		const spentKey = `${this.filePath}|experience.spent`;
		await this.store.set(totalKey, 0);
		await this.store.set(spentKey, 0);
		this.refresh(container);
	}

	private refresh(container: HTMLElement): void {
		let rootContainer = container;
		while (
			rootContainer &&
			!rootContainer.classList.contains('vtm-experience-container')
		) {
			rootContainer = rootContainer.parentElement!;
		}

		const parentEl = rootContainer.parentElement!;
		parentEl.empty();
		this.register('', parentEl, {});
	}
}
