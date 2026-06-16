import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

export class ExperienceTrackerView extends BaseView {
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;

	constructor(
		app: App,
		containerEl: HTMLElement,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
	) {
		super(app, containerEl);
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
	}

	render(source: string): void {
		this.source = source;
		this.containerEl.empty();

		const container = this.containerEl.createDiv({
			cls: 'wod-experience-container',
		});

		const totalKey = `${this.filePath}|experience.total`;
		const spentKey = `${this.filePath}|experience.spent`;

		let totalXP = this.store.get(totalKey) ?? 0;
		let spentXP = this.store.get(spentKey) ?? 0;
		let availableXP = totalXP - spentXP;

		const title = container.createDiv({ cls: 'wod-xp-title' });
		title.setText('Experience');

		const cardsGrid = container.createDiv({ cls: 'wod-xp-cards' });

		this.renderXPCard(cardsGrid, 'Total XP', totalXP, 'total');
		this.renderXPCard(cardsGrid, 'Spent XP', spentXP, 'spent');
		this.renderXPCard(cardsGrid, 'Available XP', availableXP, 'available');

		this.renderControls(container, 'Total XP', totalXP, (val) =>
			this.updateTotal(val),
		);

		this.renderControls(container, 'Spent XP', spentXP, (val) =>
			this.updateSpent(val),
		);

		const resetContainer = container.createDiv({
			cls: 'wod-xp-reset-container',
		});
		const resetBtn = resetContainer.createEl('button', {
			text: 'Reset All',
			cls: 'wod-xp-reset-btn',
		});
		resetBtn.addEventListener('click', () => {
			this.resetAll();
		});
	}

	private renderXPCard(
		container: HTMLElement,
		label: string,
		value: number,
		type: 'total' | 'spent' | 'available',
	): void {
		const card = container.createDiv({ cls: `wod-xp-card ${type}` });

		const labelEl = card.createDiv({ cls: 'wod-xp-card-label' });
		labelEl.setText(label);

		const valueEl = card.createDiv({ cls: 'wod-xp-card-value' });
		valueEl.setText(value.toString());
	}

	private renderControls(
		container: HTMLElement,
		label: string,
		value: number,
		onChange: (val: number) => void,
	): void {
		const controls = container.createDiv({ cls: 'wod-xp-controls' });

		const labelEl = controls.createDiv({ cls: 'wod-xp-controls-label' });
		labelEl.setText(label);

		const buttons = controls.createDiv({ cls: 'wod-xp-buttons' });

		const minus10 = buttons.createEl('button', {
			text: '-10',
			cls: 'wod-xp-btn',
		});
		minus10.addEventListener('click', () => {
			onChange(Math.max(0, value - 10));
		});

		const minus1 = buttons.createEl('button', {
			text: '-1',
			cls: 'wod-xp-btn',
		});
		minus1.addEventListener('click', () => {
			if (value > 0) onChange(value - 1);
		});

		const plus1 = buttons.createEl('button', {
			text: '+1',
			cls: 'wod-xp-btn',
		});
		plus1.addEventListener('click', () => {
			onChange(value + 1);
		});

		const plus10 = buttons.createEl('button', {
			text: '+10',
			cls: 'wod-xp-btn',
		});
		plus10.addEventListener('click', () => {
			onChange(value + 10);
		});
	}

	private async updateTotal(
		value: number,
	): Promise<void> {
		const totalKey = `${this.filePath}|experience.total`;
		await this.store.set(totalKey, value);
		this.refresh();
	}

	private async updateSpent(
		value: number,
	): Promise<void> {
		const spentKey = `${this.filePath}|experience.spent`;
		await this.store.set(spentKey, value);
		this.refresh();
	}

	private async resetAll(): Promise<void> {
		const totalKey = `${this.filePath}|experience.total`;
		const spentKey = `${this.filePath}|experience.spent`;
		await this.store.set(totalKey, 0);
		await this.store.set(spentKey, 0);
		this.refresh();
	}
}
