import { KeyValueStore } from 'lib/services/KeyValueStore';
import { BaseView } from './BaseView';
import { App } from 'obsidian';
import { EventBus, EventMap } from 'lib/services/EventBus';

type DamageType = 'none' | 'superficial' | 'aggravated';

export class HealthView extends BaseView {
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;

	private onAttributeChanged = (
		data: EventMap['attribute-changed'],
	): void => {
		if (data.file === this.filePath && data.attribute === 'Stamina') {
			this.refresh();
		}
	};

	onload(): void {
		this.eventBus.on('attribute-changed', this.onAttributeChanged);
	}

	onunload(): void {
		this.eventBus.off('attribute-changed', this.onAttributeChanged);
	}

	constructor(
		app: App,
		containerEL: HTMLElement,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
	) {
		super(app, containerEL);
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;

		// this.eventBus.on('attribute-changed', (data) => {
		// 	if (
		// 		data.file === this.filePath &&
		// 		data.attribute === 'Stamina' &&
		// 		this.rootElement?.isConnected
		// 	) {
		// 		this.refresh();
		// 	}
		// });
	}

	render(source: string): void {
		this.source = source;
		this.containerEl.empty();

		const container = this.containerEl.createDiv({
			cls: 'wod-health-container',
		});

		const staminaKey = `${this.filePath}|attribute.Stamina`;
		const stamina = this.store.get(staminaKey) ?? 1;
		const maxHealth = 3 + stamina;

		container.createEl('h3', {
			text: `Health (${maxHealth} boxes)`,
			cls: 'wod-health-title',
		});

		const boxesContainer = container.createDiv({ cls: 'wod-health-boxes' });

		for (let i = 0; i < maxHealth; i++) {
			this.renderHealthBox(boxesContainer, i);
		}

		const legend = container.createDiv({ cls: 'wod-health-legend' });
		legend.createSpan({
			text: 'Click to cycle: Empty → Superficial (/) → Aggravated (X) | Right-click to clear from here',
			cls: 'wod-health-legend-text',
		});
	}

	private renderHealthBox(container: HTMLElement, index: number): void {
		const box = container.createDiv({ cls: 'wod-health-box' });

		const damageType = this.getDamageAtIndex(index);

		if (damageType === 'superficial') {
			box.setText('/');
			box.addClass('superficial');
		} else if (damageType === 'aggravated') {
			box.setText('X');
			box.addClass('aggravated');
		} else {
			box.setText('');
		}

		box.addEventListener('click', () => {
			this.cycleDamageAtIndex(index);
		});

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

		if (currentDamage === 'none') {
			for (let i = 0; i <= index; i++) {
				const key = `${this.filePath}|health.${i}`;
				const existingDamage = this.getDamageAtIndex(i);

				if (existingDamage === 'none') {
					await this.store.set(key, 'superficial');
				}
			}
		} else if (currentDamage === 'superficial') {
			for (let i = 0; i <= index; i++) {
				const key = `${this.filePath}|health.${i}`;
				await this.store.set(key, 'aggravated');
			}
		} else {
			const staminaKey = `${this.filePath}|attribute.Stamina`;
			const stamina = this.store.get(staminaKey) ?? 1;
			const maxHealth = 3 + stamina;

			for (let i = index; i < maxHealth; i++) {
				const key = `${this.filePath}|health.${i}`;
				await this.store.set(key, 'none');
			}
		}

		this.refresh();
	}

	private async clearDamageFromIndex(index: number): Promise<void> {
		const staminaKey = `${this.filePath}|attribute.Stamina`;
		const stamina = this.store.get(staminaKey) ?? 1;
		const maxHealth = 3 + stamina;

		for (let i = index; i < maxHealth; i++) {
			const key = `${this.filePath}|health.${i}`;
			await this.store.set(key, 'none');
		}

		this.refresh();
	}
}
