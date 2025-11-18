import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

export class ExperienceView extends BaseView {
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

		// Get current values
		const totalKey = `${this.filePath}|experience.total`;
		const spentKey = `${this.filePath}|experience.spent`;

		let totalXP = this.store.get(totalKey) ?? 0;
		let spentXP = this.store.get(spentKey) ?? 0;
		let availableXP = totalXP - spentXP;

		// Title
		container.createEl('h3', { text: 'Experience', cls: 'vtm-xp-title' });

		// XP Display Cards
		const cardsContainer = container.createDiv({ cls: 'vtm-xp-cards' });

		// Total XP Card
		this.createXPCard(cardsContainer, 'Total XP', totalXP, 'total');

		// Spent XP Card
		this.createXPCard(cardsContainer, 'Spent XP', spentXP, 'spent');

		// Available XP Card (calculated, not editable)
		const availableCard = cardsContainer.createDiv({
			cls: 'vtm-xp-card available',
		});
		availableCard.createDiv({
			text: 'Available XP',
			cls: 'vtm-xp-card-label',
		});
		const availableValue = availableCard.createDiv({
			cls: 'vtm-xp-card-value',
		});
		availableValue.setText(availableXP.toString());

		// Controls for Total XP
		const totalControls = container.createDiv({ cls: 'vtm-xp-controls' });
		totalControls.createDiv({
			text: 'Total XP:',
			cls: 'vtm-xp-controls-label',
		});

		const totalButtons = totalControls.createDiv({ cls: 'vtm-xp-buttons' });

		this.createButton(totalButtons, '-5', () =>
			this.adjustXP('total', -5, container),
		);
		this.createButton(totalButtons, '-1', () =>
			this.adjustXP('total', -1, container),
		);
		this.createButton(totalButtons, '+1', () =>
			this.adjustXP('total', 1, container),
		);
		this.createButton(totalButtons, '+5', () =>
			this.adjustXP('total', 5, container),
		);

		// Controls for Spent XP
		const spentControls = container.createDiv({ cls: 'vtm-xp-controls' });
		spentControls.createDiv({
			text: 'Spent XP:',
			cls: 'vtm-xp-controls-label',
		});

		const spentButtons = spentControls.createDiv({ cls: 'vtm-xp-buttons' });

		this.createButton(spentButtons, '-5', () =>
			this.adjustXP('spent', -5, container),
		);
		this.createButton(spentButtons, '-1', () =>
			this.adjustXP('spent', -1, container),
		);
		this.createButton(spentButtons, '+1', () =>
			this.adjustXP('spent', 1, container),
		);
		this.createButton(spentButtons, '+5', () =>
			this.adjustXP('spent', 5, container),
		);

		// Reset button
		const resetContainer = container.createDiv({
			cls: 'vtm-xp-reset-container',
		});
		const resetBtn = resetContainer.createEl('button', {
			text: 'Reset All',
			cls: 'vtm-xp-reset-btn',
		});
		resetBtn.addEventListener('click', () => {
			this.resetXP(container);
		});
	}

	private createXPCard(
		parent: HTMLElement,
		label: string,
		value: number,
		type: 'total' | 'spent',
	): void {
		const card = parent.createDiv({ cls: `vtm-xp-card ${type}` });
		card.createDiv({ text: label, cls: 'vtm-xp-card-label' });
		const valueEl = card.createDiv({ cls: 'vtm-xp-card-value' });
		valueEl.setText(value.toString());
	}

	private createButton(
		parent: HTMLElement,
		text: string,
		callback: () => void,
	): void {
		const btn = parent.createEl('button', {
			text: text,
			cls: 'vtm-xp-btn',
		});
		btn.addEventListener('click', callback);
	}

	private async adjustXP(
		type: 'total' | 'spent',
		amount: number,
		container: HTMLElement,
	): Promise<void> {
		const key = `${this.filePath}|experience.${type}`;
		const current = this.store.get(key) ?? 0;
		const newValue = Math.max(0, current + amount); // Can't go below 0

		await this.store.set(key, newValue);
		this.refresh(container);
	}

	private async resetXP(container: HTMLElement): Promise<void> {
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
