import { App, setIcon } from 'obsidian';
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

	constructor(
		app: App,
		containerEl: HTMLElement,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
		config: MoralityConfig,
	) {
		super(app, containerEl);
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
		this.config = config;
		this.codeblock = config.codeblock;
	}

	render(source: string): void {
		this.source = source;
		this.containerEl.empty();

		const container = this.containerEl.createDiv({
			cls: 'wod-morality-container',
		});

		const moralityKey = `${this.filePath}|${this.config.codeblock}`;
		let currentMorality = this.store.get(moralityKey);

		if (currentMorality === undefined) {
			currentMorality = this.config.defaultValue;
			this.store.set(moralityKey, this.config.defaultValue);
		}

		const stainsKey = `${this.filePath}|${this.config.codeblock}.stains`;
		let currentStains = this.config.hasStains
			? (this.store.get(stainsKey) ?? 0)
			: 0;

		const maxStains = this.config.hasStains
			? this.config.stainFormula(currentMorality)
			: 0;

		const isImpaired = this.config.hasStains && currentStains === maxStains;
		const overflowStains = Math.max(0, currentStains - maxStains);

		const header = container.createDiv({ cls: 'wod-morality-header' });
		header.createEl('h3', {
			text: this.config.name,
			cls: 'wod-morality-title',
		});

		const rightSide = header.createDiv({
			cls: 'wod-morality-header-right',
		});

		const resetBtn = rightSide.createEl('button', {
			cls: 'wod-reset-btn',
			attr: { 'aria-label': `Reset to ${this.config.defaultValue}` },
		});
		setIcon(resetBtn, 'rotate-ccw');

		resetBtn.addEventListener('click', () => {
			this.setMorality(this.config.defaultValue);
			if (this.config.hasStains) {
				this.setStains(0);
			}
		});

		const moralityLevel = rightSide.createDiv({
			cls: 'wod-morality-level',
		});
		moralityLevel.setText(this.getMoralityLabel(currentMorality));

		if (currentMorality <= 2) {
			moralityLevel.addClass('danger');
		} else if (currentMorality <= 4) {
			moralityLevel.addClass('warning');
		}

		const iconsContainer = container.createDiv({
			cls: 'wod-morality-icons',
		});

		for (let i = 1; i <= 10; i++) {
			this.renderMoralityIcon(iconsContainer, i, currentMorality);
		}

		const desc = container.createDiv({ cls: 'wod-morality-description' });
		desc.setText(this.getMoralityDescription(currentMorality));

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
	): void {
		const icon = container.createDiv({ cls: 'wod-morality-icon' });

		if (value <= currentMorality) {
			icon.setText('◆');
			icon.addClass('filled');
		} else {
			icon.setText('◇');
		}

		icon.addEventListener('click', () => {
			if (currentMorality === 1 && value === 1) {
				this.setMorality(0);
			} else {
				this.setMorality(value);
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

		const clearBtn = stainsRightSide.createEl('button', {
			cls: 'wod-reset-btn',
			attr: { 'aria-label': 'Clear all stains' },
		});
		setIcon(clearBtn, 'rotate-ccw');

		clearBtn.addEventListener('click', () => {
			this.setStains(0);
		});

		const stainsContainer = stainsSection.createDiv({
			cls: 'wod-stains-boxes',
		});

		for (let i = 0; i < maxStains; i++) {
			this.renderStainBox(stainsContainer, i, currentStains);
		}

		if (isImpaired) {
			this.renderImpairmentWarning(container, overflowStains);
		}
	}

	private renderStainBox(
		container: HTMLElement,
		index: number,
		currentStains: number,
	): void {
		const box = container.createDiv({ cls: 'wod-stain-box' });

		if (index < currentStains) {
			box.setText('■');
			box.addClass('filled');
		} else {
			box.setText('□');
		}

		box.addEventListener('click', async () => {
			if (index < currentStains) {
				await this.setStains(index);
			} else {
				await this.setStains(index + 1);
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
			`IMPAIRED (${overflowStains} overflow stain${overflowStains > 1 ? 's' : ''})`,
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
			this.snapOut();
		});

		const note = impairmentWarning.createEl('div', {
			cls: 'wod-impairment-note',
		});
		note.setText(
			'Impairment lasts until Remorse test at end of session or you snap out.',
		);
	}

	private async setMorality(value: number): Promise<void> {
		const moralityKey = `${this.filePath}|${this.config.codeblock}`;
		await this.store.set(moralityKey, value);
		this.refresh();
	}

	private async setStains(value: number): Promise<void> {
		const stainsKey = `${this.filePath}|${this.config.codeblock}.stains`;
		await this.store.set(stainsKey, value);
		this.refresh();
	}

	private async snapOut(): Promise<void> {
		const moralityKey = `${this.filePath}|${this.config.codeblock}`;
		const stainsKey = `${this.filePath}|${this.config.codeblock}.stains`;

		let currentMorality =
			this.store.get(moralityKey) ?? this.config.defaultValue;

		if (currentMorality > 0) {
			await this.store.set(moralityKey, currentMorality - 1);
		}

		await this.store.set(stainsKey, 0);
		this.refresh();
	}

	private getMoralityLabel(value: number): string {
		return `${value} - ${this.config.labels[value]}`;
	}

	private getMoralityDescription(value: number): string {
		return this.config.descriptions[value];
	}
}
