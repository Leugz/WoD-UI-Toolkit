import { MarkdownPostProcessorContext } from 'obsidian';
import { GAME_CONFIGS, GameConfig } from 'lib/config/GameConfig';
import { BaseView } from 'lib/views/BaseView';
import { IWodPlugin } from 'lib/interfaces/IWodPlugin';

type ViewFactory<T> = (
	config: T,
	el: HTMLElement,
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
			(
				source: string,
				el: HTMLElement,
				ctx: MarkdownPostProcessorContext,
			) => {
				el.addClass(`wod-theme-${this.plugin.activeConfig.id}`);

				const config = this.plugin.activeConfig[configKey] as T;
				const view = factory(config, el, ctx);

				ctx.addChild(view);
				view.render(source);
			},
		);

		Object.values(GAME_CONFIGS).forEach((gameConfig) => {
			const specificConfig = gameConfig[configKey] as T;
			const tag =
				(specificConfig as { codeblock?: string }).codeblock ??
				`${gameConfig.id}-${baseTag}`;

			this.plugin.registerMarkdownCodeBlockProcessor(
				tag,
				(
					source: string,
					el: HTMLElement,
					ctx: MarkdownPostProcessorContext,
				) => {
					el.addClass(`wod-theme-${gameConfig.id}`);

					const view = factory(specificConfig, el, ctx);

					ctx.addChild(view);
					view.render(source);
				},
			);
		});
	}
}
