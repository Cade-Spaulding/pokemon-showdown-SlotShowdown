import { TYPEN_FORMS } from './typen-data';

export const FormatsData:
	import('../../../sim/dex-species').ModdedSpeciesFormatsDataTable = {};

for (const form of TYPEN_FORMS) {
	FormatsData[form.id as ID] = {
		tier: 'OU',
		doublesTier: 'DOU',
		isNonstandard: null,
	};
}
