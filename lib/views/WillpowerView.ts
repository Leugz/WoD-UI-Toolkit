import { App, setIcon } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus, EventMap } from '../services/EventBus';

type WPDamageType = 'none' | 'superficial' | 'aggravated';

export class WillpowerView extends BaseView {
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;

	private onAttributeChanged = (
		data: EventMap['attribute-changed'],
	): void => {
		if (
			data.file === this.filePath &&
			(data.attribute === 'Composure' || data.attribute === 'Resolve')
		) {
			this.refresh();
		}
	};

	private onWillpowerChanged = (
		data: EventMap['willpower-changed'],
	): void => {
		if (data.file === this.filePath) {
			this.refresh();
		}
	};

	onload(): void {
		this.eventBus.on('attribute-changed', this.onAttributeChanged);
		this.eventBus.on('willpower-changed', this.onWillpowerChanged);
	}

	onunload(): void {
		this.eventBus.off('attribute-changed', this.onAttributeChanged);
		this.eventBus.off('willpower-changed', this.onWillpowerChanged);
	}

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
			cls: 'wod-willpower-container',
		});

		const composure =
			this.store.get(`${this.filePath}|attribute.Composure`) ?? 1;
		const resolve =
			this.store.get(`${this.filePath}|attribute.Resolve`) ?? 1;
		const maxWillpower = composure + resolve;

		const header = container.createDiv({ cls: 'wod-willpower-header' });
		header.createEl('h3', {
			text: 'Willpower',
			cls: 'wod-willpower-title',
		});

		const rightSide = header.createDiv({
			cls: 'wod-willpower-header-right',
		});

		const boxesContainer = container.createDiv({
			cls: 'wod-willpower-boxes',
		});

		for (let i = 0; i < maxWillpower; i++) {
			this.renderWillpowerBox(boxesContainer, i);
		}

		const legend = container.createDiv({ cls: 'wod-willpower-legend' });
		legend.createSpan({
			text: 'Click to cycle: Empty → Superficial (/) → Aggravated (X) | Right-click to clear',
			cls: 'wod-willpower-legend-text',
		});
	}

	private renderWillpowerBox(container: HTMLElement, index: number): void {
		const box = container.createDiv({ cls: 'wod-willpower-box' });

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

	private getDamageAtIndex(index: number): WPDamageType {
		const storeKey = `${this.filePath}|willpower.${index}`;
		return this.store.get(storeKey) || 'none';
	}

	private async cycleDamageAtIndex(index: number): Promise<void> {
		const currentDamage = this.getDamageAtIndex(index);

		if (currentDamage === 'none') {
			for (let i = 0; i <= index; i++) {
				const key = `${this.filePath}|willpower.${i}`;
				if (this.getDamageAtIndex(i) === 'none') {
					await this.store.set(key, 'superficial');
				}
			}
		} else if (currentDamage === 'superficial') {
			for (let i = 0; i <= index; i++) {
				const key = `${this.filePath}|willpower.${i}`;
				await this.store.set(key, 'aggravated');
			}
		} else {
			const composure =
				this.store.get(`${this.filePath}|attribute.Composure`) ?? 1;
			const resolve =
				this.store.get(`${this.filePath}|attribute.Resolve`) ?? 1;
			const maxWP = composure + resolve;

			for (let i = index; i < maxWP; i++) {
				const key = `${this.filePath}|willpower.${i}`;
				await this.store.set(key, 'none');
			}
		}

		this.refresh();
	}

	private async clearDamageFromIndex(index: number): Promise<void> {
		const composure =
			this.store.get(`${this.filePath}|attribute.Composure`) ?? 1;
		const resolve =
			this.store.get(`${this.filePath}|attribute.Resolve`) ?? 1;
		const maxWP = composure + resolve;

		for (let i = index; i < maxWP; i++) {
			const key = `${this.filePath}|willpower.${i}`;
			await this.store.set(key, 'none');
		}
		this.refresh();
	}

	private async clearAllDamage(maxWP: number): Promise<void> {
		for (let i = 0; i < maxWP; i++) {
			const key = `${this.filePath}|willpower.${i}`;
			await this.store.set(key, 'none');
		}
		this.refresh();
	}
}
