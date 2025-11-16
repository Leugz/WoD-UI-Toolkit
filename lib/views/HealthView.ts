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

		const legend = container.createDiv({ cls: 'vtm-health-legend' });
		legend.createSpan({
			text: 'Click to cycle: Empty → Superficial (/) → Aggravated (X) | Right-click to clear from here',
			cls: 'vtm-health-legend-text',
		});
	}

	private renderHealthBox(container: HTMLElement, index: number): void {
		const box = container.createDiv({ cls: 'vtm-health-box' });

		// Get ALL health damage to determine this box's state
		const damageType = this.getDamageAtIndex(index);

		// Set visual based on damage type
		if (damageType === 'superficial') {
			box.setText('/');
			box.addClass('superficial');
		} else if (damageType === 'aggravated') {
			box.setText('X');
			box.addClass('aggravated');
		} else {
			box.setText('');
		}

		// Left click - cycle through states at this position
		box.addEventListener('click', () => {
			this.cycleDamageAtIndex(index);
		});

		// Right click - clear all damage from this point onwards
		box.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			this.clearDamageFromIndex(index);
		});
	}

	private getDamageAtIndex(index: number): DamageType {
		const storeKey = `${this.filePath}|health.${index}`;
		return this.store.get(storeKey) || 'none';
	}

	private async cycleDamageAtIndex(index: number): Promise<void> {
		const currentDamage = this.getDamageAtIndex(index);
		let newDamage: DamageType;

		// Cycle: none → superficial → aggravated → none
		if (currentDamage === 'none') {
			newDamage = 'superficial';
		} else if (currentDamage === 'superficial') {
			newDamage = 'aggravated';
		} else {
			newDamage = 'none';
		}

		// Set damage at this index
		const storeKey = `${this.filePath}|health.${index}`;
		await this.store.set(storeKey, newDamage);

		// If setting to superficial or aggravated, fill all previous boxes with at least superficial
		if (newDamage !== 'none') {
			for (let i = 0; i < index; i++) {
				const prevKey = `${this.filePath}|health.${i}`;
				const prevDamage = this.store.get(prevKey);
				if (!prevDamage || prevDamage === 'none') {
					await this.store.set(prevKey, 'superficial');
				}
			}
		}

		// If clearing this box, clear all boxes after it too
		if (newDamage === 'none') {
			const staminaKey = `${this.filePath}|attribute.Stamina`;
			const stamina = this.store.get(staminaKey) ?? 1;
			const maxHealth = 3 + stamina;

			for (let i = index + 1; i < maxHealth; i++) {
				const nextKey = `${this.filePath}|health.${i}`;
				await this.store.set(nextKey, 'none');
			}
		}

		this.refresh();
	}

	private async clearDamageFromIndex(index: number): Promise<void> {
		const staminaKey = `${this.filePath}|attribute.Stamina`;
		const stamina = this.store.get(staminaKey) ?? 1;
		const maxHealth = 3 + stamina;

		// Clear this box and all boxes after it
		for (let i = index; i < maxHealth; i++) {
			const key = `${this.filePath}|health.${i}`;
			await this.store.set(key, 'none');
		}

		this.refresh();
	}

	private refresh(): void {
		if (this.containerElement) {
			this.containerElement.empty();
			this.register('', this.containerElement, {});
		}
	}
}
