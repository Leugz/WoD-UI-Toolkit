import { App, setIcon } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';
import { getFeedingInfo } from '../utils/bloodPotency';

export class BloodPotencyView extends BaseView {
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
			cls: 'vtm-blood-potency-container',
		});

		const bpKey = `${this.filePath}|blood-potency`;
		let currentBP = this.store.get(bpKey);

		if (currentBP === undefined) {
			currentBP = 0;
			this.store.set(bpKey, 0);
		}

		const header = container.createDiv({ cls: 'vtm-bp-header' });
		header.createEl('h3', { text: 'Blood Potency', cls: 'vtm-bp-title' });

		const rightSide = header.createDiv({ cls: 'vtm-bp-header-right' });

		const resetBtn = rightSide.createEl('button', {
			cls: 'wod-reset-btn',
			attr: { 'aria-label': 'Reset to Thin-blood (0)' },
		});
		setIcon(resetBtn, 'rotate-ccw');
		resetBtn.addEventListener('click', () => {
			this.setBloodPotency(0);
		});

		const bpDisplay = rightSide.createDiv({ cls: 'vtm-bp-display' });
		bpDisplay.setText(`BP ${currentBP}`);

		const dotsContainer = container.createDiv({ cls: 'vtm-bp-dots' });

		for (let i = 1; i <= 10; i++) {
			this.renderBPDot(dotsContainer, i, currentBP);
		}

		this.renderDerivedStats(container, currentBP);
	}

	private renderBPDot(
		dotsContainer: HTMLElement,
		value: number,
		currentBP: number,
	): void {
		const dot = dotsContainer.createDiv({ cls: 'vtm-bp-dot' });

		if (value <= currentBP) {
			dot.addClass('filled');
		}

		dot.addEventListener('click', () => {
			if (currentBP === 1 && value === 1) {
				this.setBloodPotency(0);
			} else {
				this.setBloodPotency(value);
			}
		});
	}

	private renderDerivedStats(container: HTMLElement, bp: number): void {
		const statsContainer = container.createDiv({ cls: 'vtm-bp-stats' });

		const bloodSurge = this.getBloodSurge(bp);
		const mendAmount = this.getMendAmount(bp);
		const powerBonus = this.getPowerBonus(bp);
		const feeding = getFeedingInfo(bp);
		const baneSeverity = this.getBaneSeverity(bp);

		this.createStatRow(
			statsContainer,
			'Blood Surge',
			`+${bloodSurge} dice`,
		);
		this.createStatRow(
			statsContainer,
			'Mend Amount',
			`${mendAmount} Superficial`,
		);
		this.createStatRow(
			statsContainer,
			'Discipline Bonus',
			powerBonus > 0 ? `+${powerBonus} dice` : 'None',
		);
		this.createStatRow(
			statsContainer,
			'Animal/Bagged Blood',
			feeding.animalBagged,
		);
		this.createStatRow(
			statsContainer,
			'Human Blood',
			feeding.humanReduction > 0
				? `-${feeding.humanReduction} Hunger`
				: 'Normal',
		);
		this.createStatRow(
			statsContainer,
			'Hunger Floor',
			feeding.hungerFloor > 0
				? `${feeding.hungerFloor} (must drain a human)`
				: 'None',
		);
		this.createStatRow(statsContainer, 'Bane Severity', `${baneSeverity}`);
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

	private async setBloodPotency(value: number): Promise<void> {
		const bpKey = `${this.filePath}|blood-potency`;
		await this.store.set(bpKey, value);

		this.eventBus.emit('blood-potency-changed', {
			file: this.filePath,
			value,
		});

		this.refresh();
	}

	private getBloodSurge(bp: number): number {
		if (bp === 0) return 1;
		if (bp <= 2) return 2;
		if (bp <= 4) return 3;
		if (bp <= 6) return 4;
		if (bp <= 8) return 5;
		return 6;
	}

	private getMendAmount(bp: number): number {
		if (bp <= 1) return 1;
		if (bp <= 3) return 2;
		if (bp <= 7) return 3;
		if (bp <= 9) return 4;
		return 5; 
	}

	private getPowerBonus(bp: number): number {
		if (bp <= 1) return 0;
		if (bp <= 3) return 1;
		if (bp <= 5) return 2;
		if (bp <= 7) return 3;
		if (bp <= 9) return 4;
		return 5;
	}

	private getBaneSeverity(bp: number): number {
		if (bp === 0) return 1;
		if (bp <= 2) return 2;
		if (bp <= 4) return 3;
		if (bp <= 7) return 4;
		if (bp <= 8) return 5;
		return 6;
	}
}
