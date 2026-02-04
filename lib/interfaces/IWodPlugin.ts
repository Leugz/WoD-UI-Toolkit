import { GameConfig } from 'lib/config/GameConfig';
import { WodSettings } from 'lib/settings/Settings';
import { App, PluginManifest } from 'obsidian';

export interface IWodPlugin {
	app: App;
	manifest: PluginManifest;
	settings: WodSettings;
	activeConfig: GameConfig;
	saveSettings(): Promise<void>;
	registerMarkdownCodeBlockProcessor(id: string, callback: any): void;
}
