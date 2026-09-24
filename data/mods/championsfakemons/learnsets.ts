import type { MoveSource } from '../../../sim/dex-species';
import { TYPEN_FORMS, typenStrikeID } from './typen-data';

export const Learnsets:
	import('../../../sim/dex-species').ModdedLearnsetDataTable = { ...require('../champions/learnsets').Learnsets };

/*
 * Everything Typelet could learn, plus the two moves
 * Typen gains upon evolution: Bulk Up and Recover.
 */
const COMMON_MOVES = [
	'amnesia',
	'babydolleyes',
	'coaching',
	'cosmicpower',
	'entrainment',
	'helpinghand',
	'howl',
	'protect',
	'quickguard',
	'reflect',
	'rest',
	'sleeptalk',
	'substitute',
	'tickle',
	'trickroom',
	'wideguard',

	// Typen additions
	'bulkup',
	'recover',
] as const;

const SOURCE: MoveSource[] = ['9L1'];

for (const form of TYPEN_FORMS) {
	const learnset: { [moveid: string]: MoveSource[] } = {};

	// Shared Typelet/Typen movepool
	for (const move of COMMON_MOVES) {
		learnset[move] = SOURCE;
	}

	// Exactly TWO signature attacks:
	// one corresponding to each of this Typen's types.
	for (const type of form.types) {
		learnset[typenStrikeID(type)] = SOURCE;
	}

	Learnsets[form.id as ID] = {
		learnset,
	};
}
