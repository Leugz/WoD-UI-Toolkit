export * from './types';
export { VTM_CONFIG } from './vtm.config';
export { WTA_CONFIG } from './wta.config';

import { VTM_CONFIG } from './vtm.config';
import { WTA_CONFIG } from './wta.config';
import { GameConfig } from './types';

export const GAME_CONFIGS: Record<string, GameConfig> = {
	vtm: VTM_CONFIG,
	wta: WTA_CONFIG,
};
