import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';
import { MoralityConfig } from '../config/GameConfig';

export class MoralityTrackerView extends BaseView {
	codeblock: string;
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private config: MoralityConfig;
	private containerEl: HTMLElement | null = null;

	constructor(
		app: App,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
		config: MoralityConfig,
	) {
		super(app);
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
		this.config = config;
		this.codeblock = config.codeblock;
	}

	register(source: string, element: HTMLElement, ctx: any): void {
		element.empty();
		this.containerEl = element;

		const container = element.createDiv({ cls: 'wod-morality-container' });

		// Get current morality (0-10)
		const moralityKey = `${this.filePath}|${this.config.codeblock}`;
		let currentMorality = this.store.get(moralityKey);

		if (currentMorality === undefined) {
			currentMorality = this.config.defaultValue;
			this.store.set(moralityKey, this.config.defaultValue);
		}

		// Get current stains
		const stainsKey = `${this.filePath}|${this.config.codeblock}.stains`;
		let currentStains = this.config.hasStains
			? (this.store.get(stainsKey) ?? 0)
			: 0;

		// Calculate max stains
		const maxStains = this.config.hasStains
			? this.config.stainFormula(currentMorality)
			: 0;

		// Check if impaired
		const isImpaired = this.config.hasStains && currentStains === maxStains;
		const overflowStains = Math.max(0, currentStains - maxStains);

		// Header with inline reset button
		const header = container.createDiv({ cls: 'wod-morality-header' });
		header.createEl('h3', {
			text: this.config.name,
			cls: 'wod-morality-title',
		});

		const rightSide = header.createDiv({
			cls: 'wod-morality-header-right',
		});

		// Reset button
		const resetBtn = rightSide.createEl('button', {
			text: '↻',
			cls: 'wod-morality-reset-btn',
			attr: { 'aria-label': `Reset to ${this.config.defaultValue}` },
		});
		resetBtn.addEventListener('click', () => {
			this.setMorality(this.config.defaultValue, container);
			if (this.config.hasStains) {
				this.setStains(0, container);
			}
		});

		// Morality level
		const moralityLevel = rightSide.createDiv({
			cls: 'wod-morality-level',
		});
		moralityLevel.setText(this.getMoralityLabel(currentMorality));

		if (currentMorality <= 2) {
			moralityLevel.addClass('danger');
		} else if (currentMorality <= 4) {
			moralityLevel.addClass('warning');
		}

		// Morality icons display (1 to 10)
		const iconsContainer = container.createDiv({
			cls: 'wod-morality-icons',
		});

		for (let i = 1; i <= 10; i++) {
			this.renderMoralityIcon(
				iconsContainer,
				i,
				currentMorality,
				container,
			);
		}

		// Description
		const desc = container.createDiv({ cls: 'wod-morality-description' });
		desc.setText(this.getMoralityDescription(currentMorality));

		// Stains section (if applicable)
		if (this.config.hasStains) {
			this.renderStainsSection(
				container,
				currentStains,
				maxStains,
				isImpaired,
				overflowStains,
			);
		}
	}

	private renderMoralityIcon(
		container: HTMLElement,
		value: number,
		currentMorality: number,
		rootContainer: HTMLElement,
	): void {
		const icon = container.createDiv({ cls: 'wod-morality-icon' });

		if (value <= currentMorality) {
			icon.setText('◆');
			icon.addClass('filled');
		} else {
			icon.setText('◇');
		}

		// Click to set morality to this level
		icon.addEventListener('click', () => {
			if (currentMorality === 1 && value === 1) {
				this.setMorality(0, rootContainer);
			} else {
				this.setMorality(value, rootContainer);
			}
		});
	}

	private renderStainsSection(
		container: HTMLElement,
		currentStains: number,
		maxStains: number,
		isImpaired: boolean,
		overflowStains: number,
	): void {
		const stainsSection = container.createDiv({
			cls: 'wod-stains-section',
		});

		const stainsHeader = stainsSection.createDiv({
			cls: 'wod-stains-header',
		});
		stainsHeader.createEl('span', {
			text: this.config.stainName,
			cls: 'wod-stains-label',
		});

		const stainsRightSide = stainsHeader.createDiv({
			cls: 'wod-stains-rightside',
		});

		const stainsCount = stainsRightSide.createDiv({
			cls: 'wod-stains-count',
		});
		stainsCount.setText(`${currentStains}/${maxStains}`);

		if (isImpaired) {
			stainsCount.addClass('overflow');
		}

		// Clear stains button
		const clearBtn = stainsRightSide.createEl('button', {
			text: '↻',
			cls: 'wod-stains-btn',
			attr: { 'aria-label': 'Clear all stains' },
		});
		clearBtn.addEventListener('click', () => {
			this.setStains(0, container);
		});

		// Stain boxes (show max capacity)
		const stainsContainer = stainsSection.createDiv({
			cls: 'wod-stains-boxes',
		});

		for (let i = 0; i < maxStains; i++) {
			this.renderStainBox(stainsContainer, i, currentStains, container);
		}

		// Impairment warning
		if (isImpaired) {
			this.renderImpairmentWarning(container, overflowStains);
		}
	}

	private renderStainBox(
		container: HTMLElement,
		index: number,
		currentStains: number,
		rootContainer: HTMLElement,
	): void {
		const box = container.createDiv({ cls: 'wod-stain-box' });

		if (index < currentStains) {
			box.setText('■');
			box.addClass('filled');
		} else {
			box.setText('□');
		}

		// Click to set stains to this level
		box.addEventListener('click', async () => {
			if (index < currentStains) {
				await this.setStains(index, rootContainer);
			} else {
				await this.setStains(index + 1, rootContainer);
			}
		});
	}

	private renderImpairmentWarning(
		container: HTMLElement,
		overflowStains: number,
	): void {
		const impairmentWarning = container.createDiv({
			cls: 'wod-impairment-warning',
		});

		const warningTitle = impairmentWarning.createEl('div', {
			cls: 'wod-impairment-title',
		});
		warningTitle.setText(
			`⚠️ IMPAIRED (${overflowStains} overflow stain${overflowStains > 1 ? 's' : ''})`,
		);

		const penaltiesList = impairmentWarning.createEl('ul', {
			cls: 'wod-impairment-penalties',
		});
		penaltiesList.createEl('li', { text: '-2 dice to all pools (regret)' });
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
			text: `Snap Out (Lose 1 ${this.config.name})`,
			cls: 'vtm-snap-out-btn',
		});
		snapOutBtn.addEventListener('click', () => {
			this.snapOut(container);
		});

		const note = impairmentWarning.createEl('div', {
			cls: 'wod-impairment-note',
		});
		note.setText(
			'Impairment lasts until Remorse test at end of session or you snap out.',
		);
	}

	private async setMorality(
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const moralityKey = `${this.filePath}|${this.config.codeblock}`;
		await this.store.set(moralityKey, value);
		this.refresh(container);
	}

	private async setStains(
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const stainsKey = `${this.filePath}|${this.config.codeblock}.stains`;
		await this.store.set(stainsKey, value);
		this.refresh(container);
	}

	private async snapOut(container: HTMLElement): Promise<void> {
		const moralityKey = `${this.filePath}|${this.config.codeblock}`;
		const stainsKey = `${this.filePath}|${this.config.codeblock}.stains`;

		let currentMorality =
			this.store.get(moralityKey) ?? this.config.defaultValue;

		// Lose 1 morality
		if (currentMorality > 0) {
			await this.store.set(moralityKey, currentMorality - 1);
		}

		// Clear all stains
		await this.store.set(stainsKey, 0);
		this.refresh(container);
	}

	private refresh(container: HTMLElement): void {
		let rootContainer = container;
		while (
			rootContainer &&
			!rootContainer.classList.contains('wod-morality-container')
		) {
			rootContainer = rootContainer.parentElement!;
		}

		const parentEl = rootContainer.parentElement!;
		parentEl.empty();
		this.register('', parentEl, {});
	}

	private getMoralityLabel(value: number): string {
		return `${value} - ${this.config.labels[value]}`;
	}

	private getMoralityDescription(value: number): string {
		return this.config.descriptions[value];
	}
}

// VTM-specific wrapper
export class HumanityView extends MoralityTrackerView {
	constructor(
		app: App,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
		config: MoralityConfig,
	) {
		super(app, store, filePath, eventBus, config);
	}
}
