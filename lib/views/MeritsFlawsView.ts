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
		store: KeyValueStore,
		filePath: string,
		eventBus: EventBus,
	) {
		super(app);
		this.store = store;
		this.filePath = filePath;
		this.eventBus = eventBus;
	}

	register(source: string, el: HTMLElement, ctx: any): void {
		el.empty();

		let entries: any[] = [];
		try {
			entries = parseYaml(source) || [];
		} catch {
			el.createDiv({
				text: '⚠️ Invalid YAML format',
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
			el.createDiv({
				text: 'No merits or flaws defined.',
				cls: 'wod-mf-empty',
			});
			return;
		}

		const gridContainer = el.createDiv({ cls: 'wod-mf-grid' });

		const meritsColumn = gridContainer.createDiv({ cls: 'wod-mf-column' });
		const meritsTitle = meritsColumn.createDiv({
			cls: 'wod-mf-section-title merit',
		});
		meritsTitle.setText('Merits');

		if (merits.length > 0) {
			const meritsCard = new CardView(this.app, {
				title: '',
				entries: merits.map((e) => ({
					name: e.name || 'Unnamed',
					description: e.description,
					rating: e.rating,
					maxRating: 5,
					tags: ['Merit'],
				})),
				dotColor: 'var(--text-success)',
				maxRatingDefault: 5,
				extraClasses: 'wod-card-reversed',
			});
			meritsCard.register('', meritsColumn, ctx);
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
				entries: flaws.map((e) => ({
					name: e.name || 'Unnamed',
					description: e.description,
					rating: e.rating,
					maxRating: 5,
					tags: ['Flaw'],
				})),
				dotColor: 'var(--text-error)',
				maxRatingDefault: 5,
				extraClasses: 'wod-card-reversed',
			});
			flawsCard.register('', flawsColumn, ctx);
		} else {
			flawsColumn.createDiv({
				text: 'No flaws defined.',
				cls: 'wod-mf-empty',
			});
		}
	}
}
