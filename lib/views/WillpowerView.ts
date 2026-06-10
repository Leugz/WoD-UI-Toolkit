import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

export class WillpowerView extends BaseView {
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

		this.eventBus.on('attribute-changed', (data) => {
			if (
				data.file === this.filePath &&
				(data.attribute === 'Composure' ||
					data.attribute === 'resolve') &&
				this.rootElement?.isConnected
			) {
				this.refresh();
			}
		});
	}

	register(source: string, element: HTMLElement, ctx: any): void {
		element.empty();
		this.source = source;
		this.rootElement = element;

		const container = element.createDiv({ cls: 'wod-willpower-container' });

		const composureKey = `${this.filePath}|attribute.Composure`;
		const resolveKey = `${this.filePath}|attribute.Resolve`;
		const composure = this.store.get(composureKey) ?? 1;
		const resolve = this.store.get(resolveKey) ?? 1;
		const maxWillpower = composure + resolve;

		const currentKey = `${this.filePath}|willpower.current`;
		let currentWillpower = this.store.get(currentKey);

		if (currentWillpower === undefined) {
			currentWillpower = maxWillpower;
			this.store.set(currentKey, maxWillpower);
		}

		const header = container.createDiv({ cls: 'wod-willpower-header' });
		header.createEl('h3', {
			text: 'Willpower',
			cls: 'wod-willpower-title',
		});

		const rightSide = header.createDiv({
			cls: 'wod-willpower-header-right',
		});

		const resetBtn = rightSide.createEl('button', {
			text: '↻',
			cls: 'wod-willpower-reset-btn',
			attr: { 'aria-label': 'Reset to max' },
		});
		resetBtn.addEventListener('click', () => {
			this.setWillpower(maxWillpower, container);
		});

		const counter = rightSide.createDiv({ cls: 'wod-willpower-counter' });
		counter.setText(`${currentWillpower} / ${maxWillpower}`);

		const boxesContainer = container.createDiv({
			cls: 'wod-willpower-boxes',
		});

		for (let i = 0; i < maxWillpower; i++) {
			this.renderWillpowerBox(boxesContainer, i, currentWillpower);
		}
	}

	private renderWillpowerBox(
		container: HTMLElement,
		index: number,
		currentWillpower: number,
	): void {
		const box = container.createDiv({ cls: 'wod-willpower-box' });

		if (index < currentWillpower) {
			box.addClass('filled');
		}

		box.addEventListener('click', () => {
			if (currentWillpower === 1 && index === 0) {
				this.setWillpower(0, container);
			} else {
				this.setWillpower(index + 1, container);
			}
		});
	}

	private async setWillpower(
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const currentKey = `${this.filePath}|willpower.current`;
		await this.store.set(currentKey, value);

		this.refresh();
	}
}
