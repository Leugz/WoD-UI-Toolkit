import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

export class HumanityView extends BaseView {
	codeblock = 'vtm-humanity';
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

		const container = el.createDiv({ cls: 'vtm-humanity-container' });

		// Get current humanity (0-10)
		const humanityKey = `${this.filePath}|humanity`;
		let currentHumanity = this.store.get(humanityKey);

		// Default to 7 (typical starting humanity)
		if (currentHumanity === undefined) {
			currentHumanity = 7;
			this.store.set(humanityKey, 7);
		}

		// Header with inline reset button
		const header = container.createDiv({ cls: 'vtm-humanity-header' });
		header.createEl('h3', { text: 'Humanity', cls: 'vtm-humanity-title' });

		const rightSide = header.createDiv({
			cls: 'vtm-humanity-header-right',
		});

		// Reset button
		const resetBtn = rightSide.createEl('button', {
			text: '↻',
			cls: 'vtm-humanity-reset-btn',
			attr: { 'aria-label': 'Reset to 7' },
		});
		resetBtn.addEventListener('click', () => {
			this.setHumanity(7, container);
		});

		// Humanity level
		const humanityLevel = rightSide.createDiv({
			cls: 'vtm-humanity-level',
		});
		humanityLevel.setText(this.getHumanityLabel(currentHumanity));

		if (currentHumanity <= 2) {
			humanityLevel.addClass('danger');
		} else if (currentHumanity <= 4) {
			humanityLevel.addClass('warning');
		}

		// Humanity icons display (1 to 10)
		const iconsContainer = container.createDiv({
			cls: 'vtm-humanity-icons',
		});

		for (let i = 1; i <= 10; i++) {
			this.renderHumanityIcon(iconsContainer, i, currentHumanity);
		}

		// Description
		const desc = container.createDiv({ cls: 'vtm-humanity-description' });
		desc.setText(this.getHumanityDescription(currentHumanity));
	}

	private renderHumanityIcon(
		container: HTMLElement,
		value: number,
		currentHumanity: number,
	): void {
		const icon = container.createDiv({ cls: 'vtm-humanity-icon' });

		if (value <= currentHumanity) {
			icon.setText('◆'); // Filled diamond for humanity
			icon.addClass('filled');
		} else {
			icon.setText('◇'); // Empty diamond
		}

		// Click to set humanity to this level
		icon.addEventListener('click', () => {
			this.setHumanity(value, container);
		});
	}

	private async setHumanity(
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const humanityKey = `${this.filePath}|humanity`;
		await this.store.set(humanityKey, value);

		// Re-render
		let rootContainer = container;
		while (
			rootContainer &&
			!rootContainer.classList.contains('vtm-humanity-container')
		) {
			rootContainer = rootContainer.parentElement!;
		}

		const parentEl = rootContainer.parentElement!;
		parentEl.empty();
		this.register('', parentEl, {});
	}

	private getHumanityLabel(humanity: number): string {
		const labels = [
			'Lost',
			'Monstrous',
			'Monstrous',
			'Callous',
			'Callous',
			'Conflicted',
			'Conflicted',
			'Human',
			'Virtuous',
			'Virtuous',
			'Saint',
		];
		return `${humanity} - ${labels[humanity]}`;
	}

	private getHumanityDescription(humanity: number): string {
		if (humanity === 10)
			return 'Paragons of virtue. Extremely rare among Kindred.';
		if (humanity >= 8)
			return 'Moral and empathetic. Struggles against the Beast.';
		if (humanity >= 7)
			return 'Average morality. Can distinguish right from wrong.';
		if (humanity >= 5) return 'Slipping morals. The Beast grows stronger.';
		if (humanity >= 3)
			return 'Cruel and callous. Frenzy becomes more common.';
		if (humanity >= 1) return 'Barely human. The Beast is in control.';
		return 'Humanity lost. Wassail imminent.';
	}
}
