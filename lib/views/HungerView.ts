import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

export class HungerView extends BaseView {
	codeblock = 'vtm-hunger';
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

		const container = el.createDiv({ cls: 'vtm-hunger-container' });

		// Get current hunger (0-5)
		const hungerKey = `${this.filePath}|hunger`;
		let currentHunger = this.store.get(hungerKey);

		// Default to 1 if never set
		if (currentHunger === undefined) {
			currentHunger = 1;
			this.store.set(hungerKey, 1);
		}

		// Header with inline reset button
		const header = container.createDiv({ cls: 'vtm-hunger-header' });
		header.createEl('h3', { text: 'Hunger', cls: 'vtm-hunger-title' });

		const rightSide = header.createDiv({ cls: 'vtm-hunger-header-right' });

		// Reset button first
		const resetBtn = rightSide.createEl('button', {
			text: '↻',
			cls: 'vtm-hunger-reset-btn',
			attr: { 'aria-label': 'Reset to 1' },
		});
		resetBtn.addEventListener('click', () => {
			this.setHunger(1, container);
		});

		// Hunger level second
		const hungerLevel = rightSide.createDiv({ cls: 'vtm-hunger-level' });
		hungerLevel.setText(this.getHungerLabel(currentHunger));

		if (currentHunger >= 4) {
			hungerLevel.addClass('danger');
		} else if (currentHunger >= 2) {
			hungerLevel.addClass('warning');
		}

		// Hunger dice display (just the 5 dice, no zero button)
		const diceContainer = container.createDiv({ cls: 'vtm-hunger-dice' });

		for (let i = 0; i < 5; i++) {
			this.renderHungerDie(diceContainer, i, currentHunger);
		}

		// Description
		const desc = container.createDiv({ cls: 'vtm-hunger-description' });
		desc.setText(this.getHungerDescription(currentHunger));
	}

	private renderHungerDie(
		container: HTMLElement,
		index: number,
		currentHunger: number,
	): void {
		const die = container.createDiv({ cls: 'vtm-hunger-die' });

		if (index < currentHunger) {
			die.setText('⬢');
			die.addClass('filled');
		} else {
			die.setText('⬡');
		}

		// Click to set hunger to this level
		// Special case: clicking the first filled die when hunger=1 sets to 0
		die.addEventListener('click', () => {
			if (currentHunger === 1 && index === 0) {
				this.setHunger(0, container);
			} else {
				this.setHunger(index + 1, container);
			}
		});
	}

	private async setHunger(
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const hungerKey = `${this.filePath}|hunger`;
		await this.store.set(hungerKey, value);

		// Re-render
		let rootContainer = container;
		while (
			rootContainer &&
			!rootContainer.classList.contains('vtm-hunger-container')
		) {
			rootContainer = rootContainer.parentElement!;
		}

		const parentEl = rootContainer.parentElement!;
		parentEl.empty();
		this.register('', parentEl, {});
	}

	private getHungerLabel(hunger: number): string {
		const labels = [
			'Sated', // 0
			'Hungry', // 1
			'Famished', // 2
			'Starving', // 3
			'Ravenous', // 4
			'The Beast', // 5
		];
		return `${hunger} - ${labels[hunger]}`;
	}

	private getHungerDescription(hunger: number): string {
		const descriptions = [
			'You are sated. No Hunger dice.',
			'Slightly hungry. 1 Hunger die replaces a normal die.',
			'Hungry. 2 Hunger dice replace normal dice.',
			'Starving. 3 Hunger dice. The Beast stirs.',
			'Ravenous. 4 Hunger dice. Frenzy tests likely.',
			'The Beast takes over. 5 Hunger dice. Cannot use Willpower.',
		];
		return descriptions[hunger];
	}
}
