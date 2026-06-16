import { App, Plugin, setIcon } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus, EventMap } from '../services/EventBus';
import { ResourceConfig } from '../config/GameConfig';
import { EMBEDDED_ASSETS } from '../data/EmbeddedAssets';
import { getHungerFloor } from 'lib/utils/bloodPotency';

export class ResourceTrackerView extends BaseView {
	codeblock: string;
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;
	private config: ResourceConfig;
	private plugin: Plugin;

	constructor(
		app: App,
		containerEl: HTMLElement,
		plugin: Plugin,
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
		config: ResourceConfig,
	) {
		super(app, containerEl);
		this.plugin = plugin;
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
		this.config = config;
		this.codeblock = config.codeblock;
	}

	async render(source: string): Promise<void> {
		this.source = source;
		this.containerEl.empty();

		const container = this.containerEl.createDiv({
			cls: 'wod-resource-container',
		});

		const resourceKey = `${this.filePath}|${this.config.codeblock}`;
		let currentValue = this.store.get(resourceKey) ?? 0;

		const header = container.createDiv({ cls: 'wod-resource-header' });
		const titleDiv = header.createDiv({ cls: 'wod-resource-title-group' });
		const iconSpan = titleDiv.createSpan({ cls: 'wod-resource-icon' });

		let iconSrc = '';
		const cleanKey = this.config.icon
			.replace(/^assets\//, '')
			.replace(/^\//, '');

		if (this.config.icon.startsWith('data:')) {
			iconSrc = this.config.icon;
		} else if (EMBEDDED_ASSETS[cleanKey]) {
			iconSrc = EMBEDDED_ASSETS[cleanKey];
		} else {
			const fileName = cleanKey.split('/').pop();

			if (fileName) {
				const fuzzyKey = Object.keys(EMBEDDED_ASSETS).find(
					(key) => key.endsWith('/' + fileName) || key === fileName,
				);

				if (fuzzyKey) iconSrc = EMBEDDED_ASSETS[fuzzyKey];
			}
		}

		if (
			!iconSrc &&
			(this.config.icon.endsWith('.png') ||
				this.config.icon.includes('/'))
		) {
			const iconPath = `${this.app.vault.configDir}/plugins/${this.plugin.manifest.id}/${this.config.icon}`;

			if (await this.app.vault.adapter.exists(iconPath)) {
				iconSrc = this.app.vault.adapter.getResourcePath(iconPath);
			}
		}

		if (iconSrc) {
			iconSpan.createEl('img', {
				attr: { src: iconSrc, alt: this.config.name },
			});
		} else {
			iconSpan.setText(this.config.icon);
		}

		titleDiv.createEl('h3', {
			text: this.config.name,
			cls: 'wod-resource-title',
		});

		const rightSide = header.createDiv({
			cls: 'wod-resource-header-right',
		});

		const level = this.config.levels.find((l) => l.value === currentValue);
		const levelLabel = rightSide.createDiv({ cls: 'wod-resource-level' });
		levelLabel.setText(level?.label || '');

		if (currentValue === this.config.max) {
			levelLabel.addClass('critical');
		} else if ([4, 3].includes(currentValue)) {
			levelLabel.addClass('danger');
		} else if (currentValue > 0) {
			levelLabel.addClass('warning');
		}

		const resetTarget = this.getResetTarget(currentValue);

		const resetBtn = rightSide.createEl('button', {
			cls: 'wod-reset-btn',
			attr: { 'aria-label': `Reset to ${resetTarget}` },
		});
		setIcon(resetBtn, 'rotate-ccw');

		resetBtn.addEventListener('click', () => {
			this.setValue(resetTarget);
		});

		const iconsContainer = container.createDiv({
			cls: 'wod-resource-icons',
		});

		for (let i = 0; i < this.config.max; i++) {
			this.renderIcon(iconsContainer, i, currentValue);
		}

		// Description
		const currentLevel = this.config.levels.find(
			(l) => l.value === currentValue,
		);
		if (currentLevel) {
			const desc = container.createDiv({
				cls: 'wod-resource-description',
			});
			desc.setText(currentLevel.description);
		}
	}

	private getResetTarget(currentValue: number): number {
		if (this.config.codeblock !== 'vtm-hunger') return 1;

		const bpKey = `${this.filePath}|blood-potency`;
		const bloodPotency = this.store.get(bpKey) ?? 0;

		return Math.max(1, getHungerFloor(bloodPotency));
	}

	private renderIcon(
		container: HTMLElement,
		index: number,
		currentValue: number,
	): void {
		const icon = container.createDiv({ cls: 'wod-resource-icon-dot' });

		if (index < currentValue) {
			icon.setText('⬢');
			icon.addClass('filled');
		} else {
			icon.setText('⬡');
		}

		icon.addEventListener('click', () => {
			if (currentValue === 1 && index === 0) {
				this.setValue(0);
			} else {
				this.setValue(index + 1);
			}
		});
	}

	private async setValue(value: number): Promise<void> {
		const resourceKey = `${this.filePath}|${this.config.codeblock}`;
		await this.store.set(resourceKey, value);
		this.refresh();
	}

	private onBloodPotencyChanged = (
		data: EventMap['blood-potency-changed'],
	): void => {
		if (data.file === this.filePath) {
			this.refresh();
		}
	};

	onload(): void {
		if (this.config.codeblock === 'vtm-hunger') {
			this.eventBus.on(
				'blood-potency-changed',
				this.onBloodPotencyChanged,
			);
		}
	}

	onunload(): void {
		if (this.config.codeblock === 'vtm-hunger') {
			this.eventBus.off(
				'blood-potency-changed',
				this.onBloodPotencyChanged,
			);
		}
	}
}
