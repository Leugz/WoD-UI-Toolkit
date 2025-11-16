import { KeyValueStore } from 'lib/services/KeyValueStore';
import { BaseView } from './BaseView';
import { EventBus } from 'lib/services/EventBus';
import { App } from 'obsidian';

export class WillpowerView extends BaseView {
	codeblock = 'vtm-willpower';
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
		this.eventBus = eventBus;

		this.eventBus.on(`${this.filePath}:composure-changed`, () => {
			this.refresh();
		});
		this.eventBus.on(`${this.filePath}:resolve-changed`, () => {
			this.refresh();
		});
	}

	private refresh(): void {
		if (this.containerElement) {
			this.containerElement.empty();
			this.register('', this.containerElement, {});
		}
	}

	register(source: string, element: HTMLElement, ctx: any): void {
		element.empty();
		this.containerElement = element;

		const container = element.createDiv({ cls: 'vtm-willpower-container' });

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

		const header = container.createDiv({ cls: 'vtm-willpower-header' });
		header.createDiv('h3', {
			text: 'Willpower',
			cls: 'vtm-willpower-counter',
		});

		const counter = header.createDiv({ cls: 'vtm-willpower-counter' });
		counter.setText(`${currentWillpower} / ${maxWillpower}`);

		const boxesContainer = container.createDiv({
			cls: 'vtm-willpower-boxes',
		});

		for (let i = 0; i < maxWillpower; i++) {
			this.renderWillpowerBox(boxesContainer, i, currentWillpower);
		}

		const controls = container.createDiv({ cls: 'vtm-willpower-controls' });

		const spendBtn = controls.createEl('button', {
			text: '- Spend',
			cls: 'vtm-willpower-btn spend',
		});
		spendBtn.addEventListener('click', () => {
			if (currentWillpower > 0) {
				this.setWillpower(currentWillpower - 1);
			}
		});

		const regainBtn = controls.createEl('button', {
			text: '+ Regain',
			cls: 'vtm-willpower-btn regain',
		});

		regainBtn.addEventListener('click', () => {
			if (currentWillpower < maxWillpower) {
				this.setWillpower(currentWillpower + 1);
			}
		});

		const resetBtn = controls.createEl('button', {
			text: '↻ Reset to Max',
			cls: 'vtm-willpower-btn reset',
		});

		resetBtn.addEventListener('click', () => {
			this.setWillpower(maxWillpower);
		});
	}

	private renderWillpowerBox(
		container: HTMLElement,
		index: number,
		currentWillpower: number,
	): void {
		const box = container.createDiv({ cls: 'vtm-willpower-box' });

		if (index < currentWillpower) {
			box.addClass('filled');
			box.setText('●');
		} else {
			box.setText('○');
		}

		box.addEventListener('click', () => {
			this.setWillpower(index + 1);
		});
	}

	private async setWillpower(value: number): Promise<void> {
		const currentKey = `${this.filePath}|willpower.current`;

		await this.store.set(currentKey, value);
		this.refresh;
	}
}
