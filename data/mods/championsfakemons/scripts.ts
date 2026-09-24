

import { Scripts as ChampionsScripts } from '../champions/scripts';

export const Scripts: ModdedBattleScriptsData = {
	inherit: 'champions',
	gen: 9,

	init() {
		// Preserve Champions-specific initialization.
		ChampionsScripts.init?.call(this);
	},
};
