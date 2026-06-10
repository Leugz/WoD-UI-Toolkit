import { debounce, Plugin } from 'obsidian';

export class KeyValueStore {
	private plugin: Plugin;
	private data: Record<string, any> = {};
	private requestSave = debounce(this.save.bind(this), 500, true);

	constructor(plugin: Plugin) {
		this.plugin = plugin;
	}

	async load() {
		this.data = Object.assign({}, await this.plugin.loadData());
	}

	async set(key: string, value: any) {
		this.data[key] = value;
		this.requestSave();
	}

	get(key: string): any {
		return this.data[key];
	}

	private async save() {
		await this.plugin.saveData(this.data);
	}

	getKeys(): string[] {
		return Object.keys(this.data);
	}

	deleteByPrefix(prefix: string): void {
		Object.keys(this.data)
			.filter((key) => key.startsWith(`${prefix}|`))
			.forEach((key) => delete this.data[key]);
		this.requestSave();
	}

	renamePrefix(oldPrefix: string, newPrefix: string): void {
		const affected = Object.entries(this.data).filter(([key]) =>
			key.startsWith(`${oldPrefix}|`),
		);

		affected.forEach(([key, value]) => {
			const newKey = key.replace(`${oldPrefix}|`, `${newPrefix}|`);
			delete this.data[key];
			this.data[newKey] = value;
		});

		if (affected.length > 0) this.requestSave();
	}
}
