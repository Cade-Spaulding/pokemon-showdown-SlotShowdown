import { TYPEN_TYPES, typenStrikeID } from './typen-data';

export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {};

for (let i = 0; i < TYPEN_TYPES.length; i++) {
	const type = TYPEN_TYPES[i];
	const id = typenStrikeID(type);

	Moves[id as ID] = {
		num: -2000 - i,

		accuracy: 100,
		basePower: 60,
		category: 'Physical',

		name: `${type} Strike`,

		// You didn't specify PP, so I'm using 20 as the
		// implementation default.
		pp: 20,

		priority: 0,

		// Physical contact move, otherwise ordinary attack.
		flags: {
			contact: 1,
			protect: 1,
		},

		secondary: null,
		target: 'normal',
		type,

		gen: 9,
		isNonstandard: null,
	};
}
