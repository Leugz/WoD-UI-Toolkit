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

	register(source: string, el: HTMLElement, ctx: any): void {
		el.empty();
		this.containerEl = el;

		const container = el.createDiv({ cls: 'vtm-humanity-container' });

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
		const header = container.createDiv({ cls: 'vtm-humanity-header' });
		header.createEl('h3', {
			text: this.config.name,
			cls: 'vtm-humanity-title',
		});

		const rightSide = header.createDiv({
			cls: 'vtm-humanity-header-right',
		});

		// Reset button
		const resetBtn = rightSide.createEl('button', {
			text: '↻',
			cls: 'vtm-humanity-reset-btn',
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
			cls: 'vtm-humanity-level',
		});
		moralityLevel.setText(this.getMoralityLabel(currentMorality));

		if (currentMorality <= 2) {
			moralityLevel.addClass('danger');
		} else if (currentMorality <= 4) {
			moralityLevel.addClass('warning');
		}

		// Morality icons display (1 to 10)
		const iconsContainer = container.createDiv({
			cls: 'vtm-humanity-icons',
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
		const desc = container.createDiv({ cls: 'vtm-humanity-description' });
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
		const icon = container.createDiv({ cls: 'vtm-humanity-icon' });

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
			cls: 'vtm-stains-section',
		});

		const stainsHeader = stainsSection.createDiv({
			cls: 'vtm-stains-header',
		});
		stainsHeader.createEl('span', {
			text: this.config.stainName,
			cls: 'vtm-stains-label',
		});

		const stainsRightSide = stainsHeader.createDiv({
			cls: 'vtm-stains-rightside',
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
			this.renderImpairmentWarning(container, overflowStains);
		}
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
			cls: 'vtm-impairment-note',
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
			!rootContainer.classList.contains('vtm-humanity-container')
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
