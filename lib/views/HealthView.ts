import { KeyValueStore } from 'lib/services/KeyValueStore';
import { BaseView } from './BaseView';
import { App } from 'obsidian';
import { EventBus } from 'lib/services/EventBus';

type DamageType = 'none' | 'superficial' | 'aggravated';

export class HealthView extends BaseView {
	codeblock = 'vtm-health';
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private containerElement: HTMLElement | null = null;

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

		this.eventBus.on(`${this.filePath}:stamina-changed`, () => {
			if (this.containerElement) {
				this.containerElement.empty();
				this.register('', this.containerElement, {});
			}
		});
	}

	register(source: string, element: HTMLElement, ctx: any): void {
		element.empty();
		this.containerElement = element;

		const container = element.createDiv({ cls: 'vtm-health-container' });

		const staminaKey = `${this.filePath}|attribute.Stamina`;
		const stamina = this.store.get(staminaKey) ?? 1;
		const maxHealth = 3 + stamina;

		container.createEl('h3', {
			text: `Health (${maxHealth} boxes)`,
			cls: 'vtm-health-title',
		});

		const boxesContainer = container.createDiv({ cls: 'vtm-health-boxes' });

		for (let i = 0; i < maxHealth; i++) {
			this.renderHealthBox(boxesContainer, i);
		}

		const legend = container.createDiv({ cls: 'vtn-health-legend' });
		legend.createSpan({
			text: 'Click to cycle: Empty → Superficial (/) → Aggravated (X) | Right-click to clear',
			cls: 'vtm-health-legend-text',
		});
	}

	private renderHealthBox(container: HTMLElement, index: number): void {
		const storeKey = `${this.filePath}|health.${index}`;
		const damageType: DamageType = this.store.get(storeKey) || 'none';

		const box = container.createDiv({ cls: 'vtm-health-box' });

		if (damageType === 'superficial') {
			box.setText('/');
			box.addClass('superficial');
		} else if (damageType === 'aggravated') {
			box.setText('X');
			box.addClass('aggravated');
		} else {
			box.setText('');
		}

		// Left click - Superficial damage
		box.addEventListener('click', () => {
			let nextType: DamageType;

			if (damageType === 'none') {
				nextType = 'superficial';
			} else if (damageType === 'superficial') {
				nextType = 'aggravated';
			} else {
				nextType = 'none';
			}

			this.setDamage(index, nextType);
		});

		box.addEventListener('contextmenu', (event) => {
			event.preventDefault();
			this.setDamage(index, 'none');
		});
	}

	private async setDamage(
		index: number,
		damageType: DamageType,
	): Promise<void> {
		const storeKey = `${this.filePath}|health.${index}`;
		await this.store.set(storeKey, damageType);

		let rootContainer = document.querySelector('.vtm-health-container');

		if (rootContainer) {
			const parentElement = rootContainer.parentElement!;
			parentElement.empty();
			this.register('', parentElement, {});
		}
	}
}
