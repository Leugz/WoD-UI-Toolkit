import { App } from 'obsidian';
import { BaseView } from './BaseView';
import { KeyValueStore } from '../services/KeyValueStore';

export class SkillsView extends BaseView {
	private store: KeyValueStore;
	private filePath: string;
	private skillsData: Record<string, string[]>;

	constructor(
		app: App,
		store: KeyValueStore,
		filePath: string,
		skillsData: Record<string, string[]>,
	) {
		super(app);
		this.store = store;
		this.filePath = filePath;
		this.skillsData = skillsData;
	}

	register(source: string, element: HTMLElement, ctx: any): void {
		element.empty();
		const container = element.createDiv({ cls: 'wod-skills-container' });

		Object.entries(this.skillsData).forEach(([category, skillList]) => {
			this.renderCategory(container, category, skillList);
		});
	}

	private renderCategory(
		container: HTMLElement,
		category: string,
		skillList: string[],
	): void {
		const section = container.createDiv({ cls: 'wod-skill-category' });
		section.createEl('h3', { text: category, cls: 'wod-category-title' });

		skillList.forEach((skill) => {
			this.renderSkill(section, skill);
		});
	}

	private renderSkill(container: HTMLElement, skillName: string): void {
		const skillRow = container.createDiv({ cls: 'wod-skill-row' });
		skillRow.createSpan({ text: skillName, cls: 'wod-skill-name' });

		const dotsContainer = skillRow.createDiv({ cls: 'wod-dots-container' });

		// Store key now includes file path: "filepath|skill.SkillName"
		const storeKey = `${this.filePath}|skill.${skillName}`;
		const currentValue = this.store.get(storeKey) || 0;

		for (let i = 0; i < 5; i++) {
			const dot = dotsContainer.createSpan({ cls: 'wod-dot' });

			if (i < currentValue) {
				dot.addClass('filled');
			}

			const dotIndex = i + 1;

			// left click - set value
			dot.addEventListener('click', () => {
				this.setSkillValue(skillName, dotIndex, container);
			});

			// right click - reset value
			dot.addEventListener('contextmenu', (event) => {
				event.preventDefault();
				this.resetSkill(skillName, container);
			});
		}
	}

	private async setSkillValue(
		skillName: string,
		value: number,
		container: HTMLElement,
	): Promise<void> {
		const storeKey = `${this.filePath}|skill.${skillName}`;
		const currentValue = this.store.get(storeKey) || 0;

		if (currentValue === value) {
			await this.store.set(storeKey, value - 1);
		} else {
			await this.store.set(storeKey, value);
		}

		let rootContainer = container;
		while (
			rootContainer &&
			!rootContainer.classList.contains('wod-skills-container')
		) {
			rootContainer = rootContainer.parentElement!;
		}

		const parentEl = rootContainer.parentElement!;
		parentEl.empty();
		this.register('', parentEl, {});
	}

	private async resetSkill(
		skillName: string,
		container: HTMLElement,
	): Promise<void> {
		const storeKey = `${this.filePath}|skill.${skillName}`;
		await this.store.set(storeKey, 0);

		let rootContainer = container;
		while (
			rootContainer &&
			!rootContainer.classList.contains('wod-skills-container')
		) {
			rootContainer = rootContainer.parentElement!;
		}

		const parentElement = rootContainer.parentElement!;
		parentElement.empty();
		this.register('', parentElement, {});

		console.log(`${skillName} reset to 0`);
	}
}
