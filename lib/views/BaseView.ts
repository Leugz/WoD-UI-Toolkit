import { App, MarkdownRenderChild } from 'obsidian';

export abstract class BaseView extends MarkdownRenderChild {
	protected app: App;
	protected source: string = '';

	constructor(app: App, containerEl: HTMLElement) {
		super(containerEl);
		this.app = app;
	}

	abstract render(source: string): void | Promise<void>;

	protected refresh(): void {
		if (!this.containerEl.isConnected) return;
		this.containerEl.empty();
		this.render(this.source);
	}
}
