import { App } from 'obsidian';
import { parseYaml } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

interface DisciplineData {
	name: string;
	level?: number;
}

interface DisciplinesConfig {
	disciplines: DisciplineData[];
}

export class DisciplinesView extends BaseView {
	codeblock = 'vtm-disciplines';
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private yamlSource: string = '';

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
		// Store the YAML source for re-rendering
		if (source) {
			this.yamlSource = source;
		}

		el.empty();
		const container = el.createDiv({ cls: 'vtm-disciplines-container' });

		// Parse YAML
		let config: DisciplinesConfig;
		try {
			config = parseYaml(this.yamlSource) as DisciplinesConfig;
		} catch (error) {
			container.createDiv({
				text: '⚠️ Invalid YAML format',
				cls: 'vtm-disciplines-error',
			});
			return;
		}

		// Validate
		if (!config.disciplines || !Array.isArray(config.disciplines)) {
			container.createDiv({
				text: '⚠️ "disciplines" array is required',
				cls: 'vtm-disciplines-error',
			});
			return;
		}

		// Title
		container.createEl('h3', {
			text: 'Disciplines',
			cls: 'vtm-disciplines-title',
		});

		// Grid
		const grid = container.createDiv({ cls: 'vtm-disciplines-grid' });

		// Render each discipline
		config.disciplines.forEach((discipline) => {
			if (!discipline.name) return;
			this.renderDiscipline(grid, discipline, el);
		});
	}

	private renderDiscipline(
		grid: HTMLElement,
		discipline: DisciplineData,
		containerEl: HTMLElement,
	): void {
		const card = grid.createDiv({ cls: 'vtm-discipline-card' });

		// Discipline name
		const nameEl = card.createDiv({ cls: 'vtm-discipline-name' });
		nameEl.setText(discipline.name);

		// Icon
		const icon = this.getIcon(discipline.name);
		const iconEl = card.createDiv({ cls: 'vtm-discipline-icon' });
		iconEl.setText(icon);

		// Dots
		const dotsContainer = card.createDiv({ cls: 'vtm-discipline-dots' });

		const storeKey = `${this.filePath}|discipline.${discipline.name}`;
		let currentValue = this.store.get(storeKey);

		// Initialize from YAML if not set
		if (currentValue === undefined && discipline.level !== undefined) {
			currentValue = discipline.level;
			this.store.set(storeKey, discipline.level);
		} else if (currentValue === undefined) {
			currentValue = 0;
		}

		for (let i = 0; i < 5; i++) {
			const dot = dotsContainer.createSpan({ cls: 'vtm-discipline-dot' });

			if (i < currentValue) {
				dot.textContent = '●';
				dot.addClass('filled');
			} else {
				dot.textContent = '○';
			}

			const dotIndex = i + 1;

			// Left click - set value
			dot.addEventListener('click', () => {
				this.setDisciplineValue(discipline.name, dotIndex, containerEl);
			});

			// Right click - reset to 0
			dot.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				this.setDisciplineValue(discipline.name, 0, containerEl);
			});
		}
	}

	private async setDisciplineValue(
		disciplineName: string,
		value: number,
		containerEl: HTMLElement,
	): Promise<void> {
		const storeKey = `${this.filePath}|discipline.${disciplineName}`;
		const currentValue = this.store.get(storeKey) || 0;

		// Toggle behavior: clicking the same value decreases by 1
		if (currentValue === value) {
			await this.store.set(storeKey, value - 1);
		} else {
			await this.store.set(storeKey, value);
		}

		// Re-render using stored YAML source
		containerEl.empty();
		this.register('', containerEl, {});
	}

	private getIcon(discipline: string): string {
		const icons: Record<string, string> = {
			Animalism: '🐺',
			Auspex: '👁️',
			'Blood Sorcery': '🔮',
			Celerity: '⚡',
			Dominate: '🎭',
			Fortitude: '🛡️',
			Obfuscate: '👤',
			Oblivion: '💀',
			Potence: '💪',
			Presence: '✨',
			Protean: '🦇',
			'Thin-Blood Alchemy': '⚗️',
		};
		return icons[discipline] || '◆';
	}
}
