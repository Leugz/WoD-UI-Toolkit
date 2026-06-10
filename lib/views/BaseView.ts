import { App, MarkdownPostProcessorContext } from 'obsidian';

export abstract class BaseView {
	app: App;
	protected source: string = '';
	protected rootElement: HTMLElement | null = null;

	constructor(app: App) {
		this.app = app;
	}

	abstract register(
		source: string,
		element: HTMLElement,
		ctx: MarkdownPostProcessorContext,
	): void | Promise<void>;

	protected refresh(): void {
		if (!this.rootElement) return;

		this.rootElement.empty();
		this.register(this.source, this.rootElement, {} as any);
	}
}
