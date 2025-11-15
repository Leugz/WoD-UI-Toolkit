import { Plugin } from 'obsidian';

export class KeyValueStore {
	private plugin: Plugin;
	private data: Record<string, any> = {};

	constructor(plugin: Plugin) {
		this.plugin = plugin;
	}

	async load(): Promise<void> {
		try {
			const loadedData = await this.plugin.loadData();
			if (loadedData) {
				this.data = loadedData;
				console.log(
					'VtM data loaded:',
					Object.keys(this.data).length,
					'entries',
				);
			} else {
				console.log('No existing data found, starting fresh');
				this.data = {};
			}
		} catch (error) {
			console.error('Error loading VtM data:', error);
			this.data = {};
		}
	}

	async save(): Promise<void> {
		try {
			await this.plugin.saveData(this.data);
			console.log('VtM data saved');
		} catch (error) {
			console.error('Error saving VtM data:', error);
		}
	}

	get(key: string): any {
		return this.data[key];
	}

	async set(key: string, value: any): Promise<void> {
		this.data[key] = value;
		await this.save();
	}

	has(key: string): boolean {
		return key in this.data;
	}

	async delete(key: string): Promise<void> {
		delete this.data[key];
		await this.save();
	}

	getAll(): Record<string, any> {
		return { ...this.data };
	}
}
