import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

export class BloodPotencyView extends BaseView {
	codeblock = 'vtm-blood-potency';
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

		const container = el.createDiv({ cls: 'vtm-blood-potency-container' });

		// Get current Blood Potency (0-10)
		const bpKey = `${this.filePath}|blood-potency`;
		let currentBP = this.store.get(bpKey);

		// Default to 0 (thin-blood)
		if (currentBP === undefined) {
			currentBP = 0;
			this.store.set(bpKey, 0);
		}

		// Header with inline reset button
		const header = container.createDiv({ cls: 'vtm-bp-header' });
		header.createEl('h3', { text: 'Blood Potency', cls: 'vtm-bp-title' });

		const rightSide = header.createDiv({ cls: 'vtm-bp-header-right' });

		// Reset button
		const resetBtn = rightSide.createEl('button', {
			text: '↻',
			cls: 'vtm-bp-reset-btn',
			attr: { 'aria-label': 'Reset to 1' },
		});
		resetBtn.addEventListener('click', () => {
			this.setBloodPotency(1, container);
		});

		// BP level display
		const bpDisplay = rightSide.createDiv({ cls: 'vtm-bp-display' });
		bpDisplay.setText(`BP ${currentBP}`);

		// Dots (1-10)
		const dotsContainer = container.createDiv({ cls: 'vtm-bp-dots' });

		for (let i = 1; i <= 10; i++) {
			this.renderBPDot(dotsContainer, i, currentBP, container);
		}

		// Derived Stats
		this.renderDerivedStats(container, currentBP);
	}

	private renderBPDot(
		dotsContainer: HTMLElement,
		value: number,
		currentBP: number,
		container: HTMLElement,
	): void {
		const dot = dotsContainer.createDiv({ cls: 'vtm-bp-dot' });

		if (value <= currentBP) {
			dot.setText('●');
			dot.addClass('filled');
		} else {
			dot.setText('○');
		}

		// Click to set BP to this level
		// Special case: clicking the first filled dot when BP=1 sets to 0
		dot.addEventListener('click', () => {
			if (currentBP === 1 && value === 1) {
				this.setBloodPotency(0, container);
			} else {
				this.setBloodPotency(value, container);
			}
		});
	}

	private renderDerivedStats(container: HTMLElement, bp: number): void {
		const statsContainer = container.createDiv({ cls: 'vtm-bp-stats' });

		// Calculate derived values
		const bloodSurge = this.getBloodSurge(bp);
		const mendAmount = this.getMendAmount(bp);
		const powerBonus = this.getPowerBonus(bp);
		const feedingPenalty = this.getFeedingPenalty(bp);
		const baneSeverity = this.getBaneSeverity(bp);

		// Create stat rows
		this.createStatRow(
			statsContainer,
			'Blood Surge',
			`+${bloodSurge} dice`,
		);
		this.createStatRow(
			statsContainer,
			'Mend Amount',
			`${mendAmount} superficial`,
		);
		this.createStatRow(
			statsContainer,
			'Power Bonus',
			`+${powerBonus} dice`,
		);
		this.createStatRow(statsContainer, 'Feeding', feedingPenalty);
		this.createStatRow(statsContainer, 'Bane Severity', baneSeverity);
	}

	private createStatRow(
		container: HTMLElement,
		label: string,
		value: string,
	): void {
		const row = container.createDiv({ cls: 'vtm-bp-stat-row' });
		row.createSpan({ text: `${label}:`, cls: 'vtm-bp-stat-label' });
		row.createSpan({ text: value, cls: 'vtm-bp-stat-value' });
	}

	private async setBloodPotency(
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const bpKey = `${this.filePath}|blood-potency`;
		await this.store.set(bpKey, value);

		// Re-render
		let rootContainer = container;
		while (
			rootContainer &&
			!rootContainer.classList.contains('vtm-blood-potency-container')
		) {
			rootContainer = rootContainer.parentElement!;
		}

		const parentEl = rootContainer.parentElement!;
		parentEl.empty();
		this.register('', parentEl, {});
	}

	// Derived stat calculations based on VtM V5 rules
	private getBloodSurge(bp: number): number {
		if (bp === 0) return 1;
		if (bp <= 2) return 2;
		if (bp <= 4) return 3;
		if (bp <= 6) return 4;
		if (bp <= 8) return 5;
		return 6;
	}

	private getMendAmount(bp: number): number {
		if (bp === 0) return 1;
		if (bp <= 3) return 2;
		if (bp <= 6) return 3;
		return 4;
	}

	private getPowerBonus(bp: number): number {
		if (bp <= 2) return 0;
		if (bp <= 4) return 1;
		if (bp <= 6) return 2;
		if (bp <= 8) return 3;
		return 4;
	}

	private getFeedingPenalty(bp: number): string {
		if (bp === 0) return 'Slake 2+ per human';
		if (bp === 1) return 'Slake 2 per human';
		if (bp === 2) return 'Slake 1-2 per human';
		if (bp === 3) return 'Slake 1 per human';
		if (bp === 4) return 'Slake 1, animals 0';
		if (bp === 5) return 'Slake 1, animals 0';
		if (bp >= 6) return 'Slake 1, needs resonance';
		return 'Unknown';
	}

	private getBaneSeverity(bp: number): string {
		if (bp <= 2) return 'Minor';
		if (bp <= 5) return 'Moderate';
		if (bp <= 7) return 'Severe';
		return 'Extreme';
	}
}
