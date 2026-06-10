import { App } from 'obsidian';
import { IWodPlugin } from '../interfaces/IWodPlugin';
import { GameConfig, GAME_CONFIGS } from '../config/GameConfig';
import { EMBEDDED_ASSETS } from '../data/EmbeddedAssets';

export class IconResolver {
	constructor(
		private app: App,
		private plugin: IWodPlugin,
	) {}

	async resolve(
		name: string,
		gameConfig: GameConfig,
	): Promise<string | undefined> {
		if (!name) return undefined;

		const primary = await this.tryGame(name, gameConfig);
		if (primary) return primary;

		for (const config of Object.values(GAME_CONFIGS)) {
			if (config.id === gameConfig.id) continue;
			const fallback = await this.tryGame(name, config);
			if (fallback) return fallback;
		}

		return undefined;
	}

	private async tryGame(
		name: string,
		gameConfig: GameConfig,
	): Promise<string | undefined> {
		const slug = this.toSlug(name, gameConfig);

		const embedded = this.searchEmbedded(slug, gameConfig.id);
		if (embedded) return embedded;

		const path = this.buildPath(slug, gameConfig.id);
		if (await this.app.vault.adapter.exists(path)) {
			return this.app.vault.adapter.getResourcePath(path);
		}

		return undefined;
	}

	private toSlug(name: string, gameConfig: GameConfig): string {
		const mapped = gameConfig.powerSystem?.iconMap?.[name] ?? name;
		return mapped.replace(/ /g, '_');
	}

	private searchEmbedded(slug: string, gameId: string): string | undefined {
		const subfolder = gameId === 'vtm' ? 'disciplines/' : '';
		const exactKey = `${gameId}/${subfolder}${slug}.png`;

		if (EMBEDDED_ASSETS[exactKey]) return EMBEDDED_ASSETS[exactKey];

		const suffix = `/${slug}.png`;
		const fuzzyKey = Object.keys(EMBEDDED_ASSETS).find(
			(key) => key.startsWith(`${gameId}/`) && key.endsWith(suffix),
		);

		return fuzzyKey ? EMBEDDED_ASSETS[fuzzyKey] : undefined;
	}

	private buildPath(slug: string, gameId: string): string {
		const subfolder = gameId === 'vtm' ? 'disciplines/' : '';
		return `${this.app.vault.configDir}/plugins/${this.plugin.manifest.id}/assets/${gameId}/${subfolder}${slug}.png`;
	}
}
