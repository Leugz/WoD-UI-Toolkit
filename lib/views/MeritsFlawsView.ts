import { App, parseYaml } from 'obsidian';
import { BaseView } from './BaseView';
import { CardView } from './CardView';
import { KeyValueStore } from '../services/KeyValueStore';
import { EventBus } from '../services/EventBus';

export class MeritsFlawsListView extends BaseView {
	codeblock = 'vtm-merits-flaws-list';
	private store: KeyValueStore;
	private filePath: string;
	private eventBus: EventBus;

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

		let entries: any[] = [];
		try {
			entries = parseYaml(source) || [];
		} catch {
			this.containerEl.createDiv({
				text: 'Invalid YAML format',
				cls: 'wod-mf-error',
			});
			return;
		}

		const merits = entries.filter(
			(e) => (e.type || '').toLowerCase() === 'merit',
		);
		const flaws = entries.filter(
			(e) => (e.type || '').toLowerCase() === 'flaw',
		);

		if (merits.length === 0 && flaws.length === 0) {
			this.containerEl.createDiv({
				text: 'No merits or flaws defined.',
				cls: 'wod-mf-empty',
			});
			return;
		}

		const gridContainer = this.containerEl.createDiv({
			cls: 'wod-mf-grid',
		});

		const meritsColumn = gridContainer.createDiv({ cls: 'wod-mf-column' });
		const meritsTitle = meritsColumn.createDiv({
			cls: 'wod-mf-section-title merit',
		});
		meritsTitle.setText('Merits');

		if (merits.length > 0) {
			const meritsCard = new CardView(this.app, {
				title: '',
				entries: merits.map((e) => {
					const storeKey = `${this.filePath}|merit.${e.name}`;
					const savedRating = this.store.get(storeKey);
					const currentRating =
						savedRating !== undefined ? savedRating : e.rating || 0;

					return {
						name: e.name || 'Unnamed',
						description: e.description,
						rating: currentRating,
						maxRating: 5,
						tags: ['Merit'],
						onChange: async (newVal) => {
							await this.store.set(storeKey, newVal);
							this.render(source);
						},
					};
				}),
				dotColor: 'var(--text-success)',
				maxRatingDefault: 5,
				extraClasses: 'wod-card-reversed',
			});
			meritsCard.render(this.containerEl);
		} else {
			meritsColumn.createDiv({
				text: 'No merits defined.',
				cls: 'wod-mf-empty',
			});
		}

		const flawsColumn = gridContainer.createDiv({ cls: 'wod-mf-column' });
		const flawsTitle = flawsColumn.createDiv({
			cls: 'wod-mf-section-title flaw',
		});
		flawsTitle.setText('Flaws');

		if (flaws.length > 0) {
			const flawsCard = new CardView(this.app, {
				title: '',
				entries: flaws.map((e) => {
					const storeKey = `${this.filePath}|flaw.${e.name}`;
					const savedRating = this.store.get(storeKey);
					const currentRating =
						savedRating !== undefined ? savedRating : e.rating || 0;

					return {
						name: e.name || 'Unnamed',
						description: e.description,
						rating: currentRating,
						maxRating: 5,
						tags: ['Flaw'],
						onChange: async (newVal) => {
							await this.store.set(storeKey, newVal);
							this.render(source);
						},
					};
				}),
				dotColor: 'var(--text-error)',
				maxRatingDefault: 5,
				extraClasses: 'wod-card-reversed',
			});
			flawsCard.render(flawsColumn);
		} else {
			flawsColumn.createDiv({
				text: 'No flaws defined.',
				cls: 'wod-mf-empty',
			});
		}
	}
}
