import { App, parseYaml } from 'obsidian';
import { BaseView } from './BaseView';
import { CardView, CardEntry } from './CardView'; // Import your generic CardView
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

// Get icon by discipline name
function getIcon(discipline?: string): string {
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

export class PowerListView extends BaseView {
	codeblock = 'vtm-power-list';
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

		// Parse YAML powers list
		let powers: any[] = [];
		try {
			powers = parseYaml(source) || [];
		} catch {
			el.createDiv({
				text: '⚠️ Invalid YAML format',
				cls: 'vtm-power-error',
			});
			return;
		}

		// Map powers to generic CardEntry[]
		const entries: CardEntry[] = powers.map((power) => {
			const tags = [];
			if (power.discipline) tags.push(power.discipline);
			if (power.level) tags.push(`Level ${power.level}`);

			return {
				name: power.name || 'Unnamed',
				description: power.description,
				rating: undefined, // Powers don't use dots rating here
				tags,
				icon: getIcon(power.discipline),
			};
		});

		// Use CardView
		const cardView = new CardView(this.app, {
			title: 'Discipline Powers',
			entries,
			maxRatingDefault: 5,
			dotColor: 'rgb(147, 51, 234)', // Purple
		});

		cardView.register('', el, ctx);
	}
}
