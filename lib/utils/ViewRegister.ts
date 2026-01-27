import { MarkdownPostProcessorContext } from 'obsidian';
import { GAME_CONFIGS, GameConfig } from 'lib/config/GameConfig';
import { BaseView } from 'lib/views/BaseView';
import { IWodPlugin } from 'lib/interfaces/IWoDPlugin';

type ViewFactory<T> = (
	config: T,
	context: MarkdownPostProcessorContext,
) => BaseView;

export class ViewRegister {
	constructor(private plugin: IWodPlugin) {}

	register<T>(
		baseTag: string,
		configKey: keyof GameConfig,
		factory: ViewFactory<T>,
	) {
		this.plugin.registerMarkdownCodeBlockProcessor(
			`wod-${baseTag}`,
			(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
				const config = this.plugin.activeConfig[configKey] as T;
				const view = factory(config, ctx);
				view.register(source, el, ctx);
			},
		);

		Object.values(GAME_CONFIGS).forEach((gameConfig) => {
			const specificConfig = gameConfig[configKey] as T;

			const tag =
				(specificConfig as any).codeblock ||
				`${gameConfig.id}-${baseTag}`;

			this.plugin.registerMarkdownCodeBlockProcessor(
				tag,
				(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
					const view = factory(specificConfig, ctx);
					view.register(source, el, ctx);
				},
			);
		});
	}
}
