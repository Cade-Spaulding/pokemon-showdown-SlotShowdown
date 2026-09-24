
import { TYPEN_FORMS } from './typen-data';

/*
 * Note: there is no `data/mods/champions/pokedex.ts` file — the Champions mod
 * inherits its Pokedex entirely from the base game (see champions/scripts.ts).
 * The dex loader (sim/dex.ts) automatically merges parent mod data for any
 * entries not defined here, so we only need to define the new Typen species.
 * Requiring a non-existent '../champions/pokedex' module would throw
 * MODULE_NOT_FOUND and prevent this entire mod (and Typen) from loading.
 */
export const Pokedex:
	import('../../../sim/dex-species').ModdedSpeciesDataTable = {};

const OTHER_FORMES = TYPEN_FORMS
	.filter(form => form.id !== 'typen')
	.map(form => form.name);

/*
 * Base entry.
 *
 * Normal/Fire is only being used as the internal Showdown base forme.
 * It isn't intended to be "more normal" than the other Typens.
 */
Pokedex['typen' as ID] = {
	num: 2000,
	name: 'Typen',

	baseForme: 'Normal-Fire',

	types: ['Normal', 'Fire'],

	baseStats: {
		hp: 100,
		atk: 150,
		def: 100,
		spa: 80,
		spd: 100,
		spe: 70,
	},

	abilities: {
		0: 'Technician',
	},

	/*
	 * PLACEHOLDERS:
	 * You didn't specify these.
	 */
	weightkg: 50,
	eggGroups: ['Undiscovered'],

	gen: 9,
	isNonstandard: null,

	otherFormes: OTHER_FORMES,
	formeOrder: [
		'Typen',
		...OTHER_FORMES,
	],
};

/*
 * Generate every other dual-type Typen.
 */
for (const form of TYPEN_FORMS) {
	if (form.id === 'typen') continue;

	Pokedex[form.id as ID] = {
		num: 2000,

		name: form.name,
		baseSpecies: 'Typen',
		forme: `${form.types[0]}-${form.types[1]}`,

		types: [
			form.types[0],
			form.types[1],
		],

		baseStats: {
			hp: 100,
			atk: 150,
			def: 100,
			spa: 80,
			spd: 100,
			spe: 70,
		},

		abilities: {
			0: 'Technician',
		},

		// PLACEHOLDERS
		weightkg: 50,
		eggGroups: ['Undiscovered'],

		gen: 9,
		isNonstandard: null,
	};
}
