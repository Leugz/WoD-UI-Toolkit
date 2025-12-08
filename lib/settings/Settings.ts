import WodUIToolkitPlugin from 'main';
import { App, Notice, PluginSettingTab, Setting } from 'obsidian';

export interface WodSettings {
	gameSystem: 'vtm' | 'wta';
}

export const DEFAULT_SETTINGS: WodSettings = {
	gameSystem: 'vtm',
};

export class WodSettingsTab extends PluginSettingTab {
	plugin: WodUIToolkitPlugin;

	constructor(app: App, plugin: WodUIToolkitPlugin) {
		super(app, plugin);
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
				dropdown
					.addOption('vtm', 'Vampire: the Masquerade (V5)')
					.addOption('wta', 'Werewolf: The Apocalypse (V5)')
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
