import { App, MarkdownPostProcessorContext } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

export class AttributesView extends BaseView {
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private attributesData: Record<string, string[]>;

	constructor(
		app: App,
		containerEl: HTMLElement,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
		attributesData: Record<string, string[]>,
	) {
		super(app, containerEl);
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
		this.attributesData = attributesData;
	}

	render(source: string): void {
		this.source = source;
		this.containerEl.empty();

		const container = this.containerEl.createDiv({
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
		section.createEl('h3', { text: category, cls: 'wod-category-title' });

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
		const currentValue = this.store.get(storeKey) ?? 1;
		const dots: HTMLElement[] = [];

		for (let i = 0; i < 5; i++) {
			const dot = dotsContainer.createSpan({ cls: 'wod-dot' });
			dots.push(dot);

			if (i < currentValue) {
				dot.addClass('filled');
			}

			dot.addEventListener('click', () => {
				this.updateAttributeValue(attributeName, i + 1, dots);
			});

			dot.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				this.updateAttributeValue(attributeName, 1, dots);
			});
		}
	}

	private async updateAttributeValue(
		attributeName: string,
		newValue: number,
		dots: HTMLElement[],
	): Promise<void> {
		const storeKey = `${this.filePath}|attribute.${attributeName}`;
		const currentStoredValue = this.store.get(storeKey) ?? 1;

		let finalValue = newValue;
		if (currentStoredValue === newValue && newValue > 0) {
			finalValue = newValue - 1;
		}

		await this.store.set(storeKey, finalValue);

		dots.forEach((dot, index) => {
			if (index < finalValue) {
				dot.addClass('filled');
			} else {
				dot.removeClass('filled');
			}
		});

		this.eventBus.emit('attribute-changed', {
			file: this.filePath,
			attribute: attributeName,
			value: finalValue,
		});
	}
}
