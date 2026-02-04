import { App } from 'obsidian';
import { BaseView } from './BaseView';

export interface CardEntry {
	name: string;
	description?: string;
	rating?: number;
	maxRating?: number;
	tags?: (string | Record<string, any>)[];
	icon?: string;
	pool?: string;
}

interface CardViewOptions {
	entries: CardEntry[];
	title: string;
	dotColor?: string;
	maxRatingDefault?: number;
	extraClasses?: string;
}

export class CardView extends BaseView {
	codeblock = 'wod-generic-card';
	private options: CardViewOptions;

	constructor(app: App, options: CardViewOptions) {
		super(app);
		this.options = options;
	}

	register(source: string, element: HTMLElement, ctx: any): void {
		element.empty();
		const entries = this.options.entries;

		if (!Array.isArray(entries) || entries.length === 0) {
			element.createDiv({
				text: 'No entries defined.',
				cls: 'wod-empty',
			});
			return;
		}

		const container = element.createDiv({ cls: 'wod-card-container' });

		if (this.options.extraClasses) {
			container.addClass(this.options.extraClasses);
		}

		if (this.options.title) {
			container.createEl('h3', {
				text: this.options.title,
				cls: 'wod-card-title',
			});
		}

		const list = container.createDiv({ cls: 'wod-card-list' });

		this.options.entries.forEach((entry) => {
			this.renderEntry(list, entry);
		});
	}

	private renderEntry(container: HTMLElement, entry: CardEntry): void {
		const entryDiv = container.createDiv({ cls: 'wod-card-entry' });
		const header = entryDiv.createDiv({ cls: 'wod-card-header' });

		if (entry.icon) {
			const iconContainer = header.createSpan({
				cls: 'wod-card-icon',
			});

			if (
				entry.icon.startsWith('app://') ||
				entry.icon.startsWith('http')
			) {
				iconContainer.createEl('img', {
					attr: {
						src: entry.icon,
						alt: entry.name,
					},
					cls: 'wod-card-icon-img',
				});
			} else {
				iconContainer.setText(entry.icon);
			}
		}

		const nameEl = header.createDiv({ cls: 'wod-card-name' });
		nameEl.setText(entry.name);

		if (entry.tags && entry.tags.length > 0) {
			const tagsContainer = header.createDiv({
				cls: 'wod-card-tags',
			});

			entry.tags.forEach((tag) => {
				let tagText = '';
				let tagClassSuffix = '';

				if (typeof tag == 'string') {
					if (tag.includes(':')) {
						const [key, ...rest] = tag.split(':');
						const value = rest.join(':').trim();

						tagText = value;
						tagClassSuffix = `${key}-${value}`;
					} else {
						tagText = tag;
						tagClassSuffix = tag;
					}
				} else if (typeof tag == 'object' && tag !== null) {
					const key = Object.keys(tag)[0];
					const value = (tag as any)[key];

					tagText = `${value}`;
					tagClassSuffix = `${key}-${value}`;
				} else {
					tagText = String(tag);
					tagClassSuffix = String(tag);
				}

				tagsContainer.createSpan({
					text: tagText,
					cls: `wod-card-tag ${tagClassSuffix.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
				});
			});
		}

		if (entry.rating !== undefined) {
			const maxRating =
				entry.maxRating || this.options.maxRatingDefault || 5;
			const dotsContainer = header.createDiv({
				cls: 'wod-card-dots',
			});

			for (let i = 0; i < maxRating; i++) {
				const dot = dotsContainer.createSpan({
					cls: 'wod-card-dot',
				});
				dot.setText(i < entry.rating ? '●' : '○');

				if (this.options.dotColor) {
					dot.style.color = this.options.dotColor;
				}
			}
		}

		if (entry.description) {
			const desc = entryDiv.createDiv({
				cls: 'wod-card-description',
			});
			desc.setText(entry.description);
		}

		if (entry.pool) {
			const poolEl = entryDiv.createDiv({ cls: 'wod-card-pool' });
			poolEl.innerHTML = `${entry.pool}`;
		}
	}
}
