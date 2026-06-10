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
}
