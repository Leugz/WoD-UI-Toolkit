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

		// Get current stains
		const stainsKey = `${this.filePath}|humanity.stains`;
		let currentStains = this.store.get(stainsKey) ?? 0;

		// Calculate max stains: (10 - humanity) + 1
		const maxStains = 10 - currentHumanity + 1;

		// Check if impaired (stains === max)
		const isImpaired = currentStains === maxStains;
		const overflowStains = Math.max(0, currentStains - maxStains);

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
			this.setStains(0, container);
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
			this.renderHumanityIcon(
				iconsContainer,
				i,
				currentHumanity,
				container,
			);
		}

		// Description
		const desc = container.createDiv({ cls: 'vtm-humanity-description' });
		desc.setText(this.getHumanityDescription(currentHumanity));

		// Stains section
		const stainsSection = container.createDiv({
			cls: 'vtm-stains-section',
		});

		const stainsHeader = stainsSection.createDiv({
			cls: 'vtm-stains-header',
		});
		const stainsLabel = stainsHeader.createEl('span', {
			text: 'Stains',
			cls: 'vtm-stains-label',
		});

		const stainsRightSide = stainsHeader.createDiv({
			cls: 'vtm-stains-rightSide',
		});

		const stainsCount = stainsRightSide.createDiv({
			cls: 'vtm-stains-count',
		});
		stainsCount.setText(`${currentStains}/${maxStains}`);

		if (isImpaired) {
			stainsCount.addClass('overflow');
		}

		// Clear stains button
		const clearBtn = stainsRightSide.createEl('button', {
			text: '↻',
			cls: 'vtm-stains-btn',
			attr: { 'aria-label': 'Clear all stains' },
		});
		clearBtn.addEventListener('click', () => {
			this.setStains(0, container);
		});

		// Stain boxes (show max capacity)
		const stainsContainer = stainsSection.createDiv({
			cls: 'vtm-stains-boxes',
		});

		for (let i = 0; i < maxStains; i++) {
			this.renderStainBox(stainsContainer, i, currentStains, container);
		}

		// Impairment warning
		if (isImpaired) {
			const impairmentWarning = container.createDiv({
				cls: 'vtm-impairment-warning',
			});

			const warningTitle = impairmentWarning.createEl('div', {
				cls: 'vtm-impairment-title',
			});
			warningTitle.setText(
				`⚠️ IMPAIRED (${overflowStains} overflow stain${overflowStains > 1 ? 's' : ''})`,
			);

			const penaltiesList = impairmentWarning.createEl('ul', {
				cls: 'vtm-impairment-penalties',
			});
			penaltiesList.createEl('li', {
				text: '-2 dice to all pools (regret)',
			});
			penaltiesList.createEl('li', {
				text: `${overflowStains} Aggravated Willpower damage`,
			});
			penaltiesList.createEl('li', {
				text: 'Cannot intentionally violate Tenets',
			});
			penaltiesList.createEl('li', {
				text: 'Forced violations = Terror Frenzy test (Diff 4)',
			});

			const snapOutBtn = impairmentWarning.createEl('button', {
				text: 'Snap Out (Lose 1 Humanity)',
				cls: 'vtm-snap-out-btn',
			});
			snapOutBtn.addEventListener('click', () => {
				this.snapOut(container);
			});

			const note = impairmentWarning.createEl('div', {
				cls: 'vtm-impairment-note',
			});
			note.setText(
				'Impairment lasts until Remorse test at end of session or you snap out.',
			);
		}
	}

	private renderHumanityIcon(
		container: HTMLElement,
		value: number,
		currentHumanity: number,
		rootContainer: HTMLElement,
	): void {
		const icon = container.createDiv({ cls: 'vtm-humanity-icon' });

		if (value <= currentHumanity) {
			icon.setText('◆');
			icon.addClass('filled');
		} else {
			icon.setText('◇');
		}

		// Click to set humanity to this level
		icon.addEventListener('click', () => {
			if (currentHumanity === 1 && value === 1) {
				this.setHumanity(0, rootContainer);
			} else {
				this.setHumanity(value, rootContainer);
			}
		});
	}

	private renderStainBox(
		container: HTMLElement,
		index: number,
		currentStains: number,
		rootContainer: HTMLElement,
	): void {
		const box = container.createDiv({ cls: 'vtm-stain-box' });

		if (index < currentStains) {
			box.setText('■');
			box.addClass('filled');
		} else {
			box.setText('□');
		}

		// Click to set stains to this level
		box.addEventListener('click', async () => {
			if (index < currentStains) {
				// Clicking filled box reduces stains to that level
				await this.setStains(index, rootContainer);
			} else {
				// Clicking empty box fills up to it
				await this.setStains(index + 1, rootContainer);
			}
		});
	}

	private async setHumanity(
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const humanityKey = `${this.filePath}|humanity`;
		await this.store.set(humanityKey, value);
		this.refresh(container);
	}

	private async setStains(
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const stainsKey = `${this.filePath}|humanity.stains`;
		await this.store.set(stainsKey, value);
		this.refresh(container);
	}

	private async snapOut(container: HTMLElement): Promise<void> {
		const humanityKey = `${this.filePath}|humanity`;
		const stainsKey = `${this.filePath}|humanity.stains`;

		let currentHumanity = this.store.get(humanityKey) ?? 7;

		// Lose 1 Humanity
		if (currentHumanity > 0) {
			await this.store.set(humanityKey, currentHumanity - 1);
		}

		// Clear all stains
		await this.store.set(stainsKey, 0);

		this.refresh(container);
	}

	private refresh(container: HTMLElement): void {
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
