import { App } from 'obsidian';

export abstract class BaseView {
	app: App;
	abstract codeblock: string;

	constructor(app: App) {
		this.app = app;
	}

	abstract register(source: string, element: HTMLElement, ctx: any): void;
}
