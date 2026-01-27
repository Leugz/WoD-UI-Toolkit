import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

export class AttributesView extends BaseView {
	codeblock = 'vtm-attributes';
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private attributesData: Record<string, string[]>;

	constructor(
		app: App,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
		attributesData: Record<string, string[]>,
	) {
		super(app);
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
		this.attributesData = attributesData;
	}

	register(source: string, element: HTMLElement, ctx: any): void {
		element.empty();
		const container = element.createDiv({
			cls: 'wod-attributes-container',
		});

		Object.entries(this.attributesData).forEach(
			([category, attributeList]) => {
				this.renderCategory(container, category, attributeList);
			},
		);
	}

	private renderCategory(
		container: HTMLElement,
		category: string,
		attributeList: string[],
	): void {
		const section = container.createDiv({ cls: 'vtm-attribute-category' });
		section.createEl('h3', { text: category, cls: 'vtm-category-title' });

		attributeList.forEach((attribute) => {
			this.renderAttribute(section, attribute);
		});
	}

	private renderAttribute(
		container: HTMLElement,
		attributeName: string,
	): void {
		const attributeRow = container.createDiv({ cls: 'wod-attribute-row' });
		attributeRow.createSpan({
			text: attributeName,
			cls: 'vtm-attribute-name',
		});

		const dotsContainer = attributeRow.createDiv({
			cls: 'wod-dots-container',
		});

		const storeKey = `${this.filePath}|attribute.${attributeName}`;
		// Default to 1 for attributes
		const currentValue = this.store.get(storeKey) ?? 1;

		for (let i = 0; i < 5; i++) {
			const dot = dotsContainer.createSpan({ cls: 'wod-dot' });

			if (i < currentValue) {
				dot.textContent = '●';
				dot.addClass('filled');
			} else {
				dot.textContent = '○';
			}

			const dotIndex = i + 1;

			// Left click - set value
			dot.addEventListener('click', () => {
				this.setAttributeValue(attributeName, dotIndex, container);
			});

			// Right click - reset to 1
			dot.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				this.resetAttribute(attributeName, container);
			});
		}
	}

	private async setAttributeValue(
		attributeName: string,
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const storeKey = `${this.filePath}|attribute.${attributeName}`;
		const currentValue = this.store.get(storeKey) ?? 1;

		if (currentValue === value) {
			await this.store.set(storeKey, value - 1);
		} else {
			await this.store.set(storeKey, value);
		}

		if (attributeName === 'Stamina') {
			this.eventBus.emit(`${this.filePath}:stamina-changed`);
		}
		if (attributeName === 'Composure') {
			this.eventBus.emit(`${this.filePath}:composure-changed`);
		}
		if (attributeName === 'Resolve') {
			this.eventBus.emit(`${this.filePath}:resolve-changed`);
		}

		let rootContainer = container;

		while (
			rootContainer &&
			!rootContainer.classList.contains('wod-attributes-container')
		) {
			rootContainer = rootContainer.parentElement!;
		}

		const parentElement = rootContainer.parentElement!;
		parentElement.empty();
		this.register('', parentElement, {});
	}

	private async resetAttribute(
		attributeName: string,
		container: HTMLElement,
	): Promise<void> {
		const storeKey = `${this.filePath}|attribute.${attributeName}`;
		await this.store.set(storeKey, 1); // Reset to 1

		if (attributeName === 'Stamina') {
			this.eventBus.emit(`${this.filePath}:stamina-changed`);
		}

		let rootContainer = container;

		while (
			rootContainer &&
			!rootContainer.classList.contains('wod-attributes-container')
		) {
			rootContainer = rootContainer.parentElement!;
		}

		const parentElement = rootContainer.parentElement!;
		parentElement.empty();
		this.register('', parentElement, {});

		console.log(`${attributeName} reset to 1`);
	}
}
