
import { TYPEN_FORMS } from './typen-data';

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
Pokedex.typen = {
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
