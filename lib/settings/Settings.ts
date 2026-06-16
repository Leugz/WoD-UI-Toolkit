import { GAME_CONFIGS } from 'lib/config/GameConfig';
import { IWodPlugin } from 'lib/interfaces/IWodPlugin';
import { App, Notice, PluginSettingTab, Setting } from 'obsidian';

export interface WodSettings {
	gameSystem: string;
}

export const DEFAULT_SETTINGS: WodSettings = {
	gameSystem: 'vtm',
};

export class WodSettingsTab extends PluginSettingTab {
	plugin: IWodPlugin;

	constructor(app: App, plugin: IWodPlugin) {
		super(app, plugin as any);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'World of Darkness UI Toolkit' });

		new Setting(containerEl)
			.setName('Activate Game System')
			.setDesc(
				'Select which game rules to load. (Changing requires a reload)',
			)
			.addDropdown((dropdown) => {
				Object.entries(GAME_CONFIGS).forEach(([id, config]) => {
					dropdown.addOption(id, config.name);
				});
				dropdown
					.setValue(this.plugin.settings.gameSystem)
					.onChange(async (value) => {
						this.plugin.settings.gameSystem = value as any;
						await this.plugin.saveSettings();
						new Notice(
							'Game system changed. Please reload Obsidian/Plugin.',
						);
					});
			});
	}
}
