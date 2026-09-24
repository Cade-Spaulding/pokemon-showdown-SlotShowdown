export const TYPEN_TYPES = [
	'Normal',
	'Fire',
	'Water',
	'Electric',
	'Grass',
	'Ice',
	'Fighting',
	'Poison',
	'Ground',
	'Flying',
	'Psychic',
	'Bug',
	'Rock',
	'Ghost',
	'Dragon',
	'Dark',
	'Steel',
	'Fairy',
] as const;

export type TypenType = typeof TYPEN_TYPES[number];

export interface TypenForm {
	id: string;
	name: string;
	types: [TypenType, TypenType];
}

export function typenStrikeID(type: TypenType) {
	return `${type.toLowerCase()}strike`;
}

export const TYPEN_FORMS: TypenForm[] = [];

for (let i = 0; i < TYPEN_TYPES.length; i++) {
	for (let j = i + 1; j < TYPEN_TYPES.length; j++) {
		const first = TYPEN_TYPES[i];
		const second = TYPEN_TYPES[j];

		// Showdown needs one species entry to be the base forme.
		// Normal/Fire is arbitrarily used as that internal base.
		const isBase = first === 'Normal' && second === 'Fire';

		TYPEN_FORMS.push({
			id: isBase
				? 'typen'
				: `typen${first.toLowerCase()}${second.toLowerCase()}`,

			name: isBase
				? 'Typen'
				: `Typen-${first}-${second}`,

			types: [first, second],
		});
	}
}
