import { App, MarkdownPostProcessorContext } from 'obsidian';

export abstract class BaseView {
	app: App;

	constructor(app: App) {
		this.app = app;
	}

	abstract register(
		source: string,
		element: HTMLElement,
		ctx: MarkdownPostProcessorContext,
	): void;
}
