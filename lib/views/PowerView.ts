import { App } from 'obsidian';
import { parseYaml } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

interface PowerData {
	name: string;
	discipline?: string;
	level?: string | number;
	cost?: string;
	dice_pool?: string;
	duration?: string;
	description?: string;
	[key: string]: any; // Allow custom fields
}

export class PowerView extends BaseView {
	codeblock = 'vtm-power';
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;

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

		// Parse YAML
		let powerData: PowerData;
		try {
			powerData = parseYaml(source) as PowerData;
		} catch (error) {
			el.createDiv({
				text: '⚠️ Invalid YAML format',
				cls: 'vtm-power-error',
			});
			return;
		}

		// Validate required fields
		if (!powerData.name) {
			el.createDiv({
				text: '⚠️ Power name is required',
				cls: 'vtm-power-error',
			});
			return;
		}

		// Create power card
		const card = el.createDiv({ cls: 'vtm-power-card' });

		// Header
		this.renderHeader(card, powerData);

		// Stats section
		if (powerData.cost || powerData.dice_pool || powerData.duration) {
			this.renderStats(card, powerData);
		}

		// Description
		if (powerData.description) {
			this.renderDescription(card, powerData);
		}
	}

	private renderHeader(card: HTMLElement, data: PowerData): void {
		const header = card.createDiv({ cls: 'vtm-power-header' });

		// Icon based on discipline
		const icon = this.getIcon(data.discipline);
		const iconEl = header.createSpan({ cls: 'vtm-power-icon' });
		iconEl.setText(icon);

		// Name
		const nameEl = header.createDiv({ cls: 'vtm-power-name' });
		nameEl.setText(data.name);

		// Tags
		if (data.discipline || data.level) {
			const tags = header.createDiv({ cls: 'vtm-power-tags' });

			if (data.discipline) {
				tags.createSpan({
					text: data.discipline.toUpperCase(),
					cls: 'vtm-power-tag discipline',
				});
			}

			if (data.level) {
				tags.createSpan({
					text: `LEVEL ${data.level}`,
					cls: 'vtm-power-tag level',
				});
			}
		}
	}

	private renderStats(card: HTMLElement, data: PowerData): void {
		const stats = card.createDiv({ cls: 'vtm-power-stats' });

		if (data.cost) {
			const costRow = stats.createDiv({ cls: 'vtm-power-stat-row' });
			costRow.createSpan({ text: 'Cost:', cls: 'vtm-power-stat-label' });
			costRow.createSpan({
				text: data.cost,
				cls: 'vtm-power-stat-value',
			});
		}

		if (data.dice_pool) {
			const poolRow = stats.createDiv({ cls: 'vtm-power-stat-row' });
			poolRow.createSpan({
				text: 'Dice Pool:',
				cls: 'vtm-power-stat-label',
			});
			poolRow.createSpan({
				text: data.dice_pool,
				cls: 'vtm-power-stat-value',
			});
		}

		if (data.duration) {
			const durationRow = stats.createDiv({ cls: 'vtm-power-stat-row' });
			durationRow.createSpan({
				text: 'Duration:',
				cls: 'vtm-power-stat-label',
			});
			durationRow.createSpan({
				text: data.duration,
				cls: 'vtm-power-stat-value',
			});
		}
	}

	private renderDescription(card: HTMLElement, data: PowerData): void {
		const desc = card.createDiv({ cls: 'vtm-power-description' });

		// Handle multiline descriptions
		const lines = (data.description || '').split('\n');
		lines.forEach((line, index) => {
			if (line.trim()) {
				const p = desc.createEl('p');
				p.setText(line.trim());
			}
		});
	}

	private getIcon(discipline?: string): string {
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
		return icons[discipline || ''] || '◆';
	}
}
