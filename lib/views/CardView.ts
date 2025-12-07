import { App } from 'obsidian';
import { BaseView } from './BaseView';

export interface CardEntry {
	name: string;
	description?: string;
	rating?: number;
	maxRating?: number;
	tags?: string[];
	icon?: string;
}

interface CardViewOptions {
	entries: CardEntry[];
	title: string;
	dotColor?: string;
	maxRatingDefault?: number;
}

export class CardView extends BaseView {
	codeblock = 'vtm-generic-card'; // Override in subclasses or usage
	private options: CardViewOptions;
	private containerEl: HTMLElement | null = null;

	constructor(app: App, options: CardViewOptions) {
		super(app);
		this.options = options;
	}

	register(source: string, el: HTMLElement, ctx: any): void {
		el.empty();

		const entries = this.options.entries;

		if (!Array.isArray(entries) || entries.length === 0) {
			el.createDiv({
				text: 'No entries defined.',
				cls: 'vtm-generic-card-empty',
			});
			return;
		}

		const container = el.createDiv({ cls: 'vtm-generic-card-container' });

		// Title (if provided)
		if (this.options.title) {
			container.createEl('h3', {
				text: this.options.title,
				cls: 'vtm-generic-card-title',
			});
		}

		// Grid of cards
		const list = container.createDiv({ cls: 'vtm-generic-card-list' });

		// Render each entry
		entries.forEach((entry) => {
			this.renderEntry(list, entry);
		});
	}

	private renderEntry(container: HTMLElement, entry: CardEntry): void {
		const entryDiv = container.createDiv({ cls: 'vtm-generic-card-entry' });

		// Header: icon + name + tags + rating dots
		const header = entryDiv.createDiv({ cls: 'vtm-generic-card-header' });

		if (entry.icon) {
			const iconEl = header.createSpan({ cls: 'vtm-generic-card-icon' });
			iconEl.setText(entry.icon);
		}

		const nameEl = header.createDiv({ cls: 'vtm-generic-card-name' });
		nameEl.setText(entry.name);

		if (entry.tags && entry.tags.length > 0) {
			const tagsContainer = header.createDiv({
				cls: 'vtm-generic-card-tags',
			});
			entry.tags.forEach((tag) => {
				const tagEl = tagsContainer.createSpan({
					cls: 'vtm-generic-card-tag',
				});
				tagEl.setText(tag.toUpperCase());
			});
		}

		if (entry.rating !== undefined) {
			const maxRating =
				entry.maxRating || this.options.maxRatingDefault || 5;
			const dotsContainer = header.createDiv({
				cls: 'vtm-generic-card-dots',
			});
			for (let i = 0; i < maxRating; i++) {
				const dot = dotsContainer.createSpan({
					cls: 'vtm-generic-card-dot',
				});
				dot.setText(i < entry.rating ? '●' : '○');
				if (this.options.dotColor) {
					dot.style.color = this.options.dotColor;
				}
			}
		}

		if (entry.description) {
			const desc = entryDiv.createDiv({
				cls: 'vtm-generic-card-description',
			});
			desc.setText(entry.description);
		}
	}
}
