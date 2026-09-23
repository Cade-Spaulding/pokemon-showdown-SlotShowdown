import { Scripts as MixAndMegaScripts } from '../mixandmega/scripts';
import { Scripts as PokebilitiesScripts } from '../pokebilities/scripts';

export const Scripts: ModdedBattleScriptsData = {
	inherit: 'mixandmega',
	gen: 9,

	/*
	 * A child mod inherits Mix and Mega's battle scripts,
	 * but the Dex loader deliberately does NOT automatically
	 * run the parent's init().
	 *
	 * So forward MnM's init manually.
	 */
	init: MixAndMegaScripts.init!,

	/*
	 * Add the simulator-level pieces Pokebilities needs.
	 *
	 * Mix and Mega currently doesn't define these top-level
	 * field/pokemon overrides, so they compose cleanly.
	 */
	field: PokebilitiesScripts.field!,
	pokemon: PokebilitiesScripts.pokemon!,
};
