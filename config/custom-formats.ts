import { TeamValidator } from '../sim/team-validator';

const SLOT_FORMATS = [
	'[Gen 9] Camomons',
	'[Gen 9] Pokebilities',
	'[Gen 9] STABmons',
	"[Gen 9] Bad 'n Boosted",
	'[Gen 9] Almost Any Ability',
	'[Gen 9] Mix and Mega',
] as const;

const SLOT_NAMES = [
	'Camomons',
	'Pokebilities',
	'STABmons',
	"Bad 'n Boosted",
	'Almost Any Ability',
	'Mix and Mega',
] as const;

export const Formats: import('../sim/dex-formats').FormatList = [
	{
		section: 'SlotShowdown',
	},

	{
		name: '[Gen 9] SlotShowdown',
		desc: `
			Slot 1: Camomons |
			Slot 2: Pokebilities |
			Slot 3: STABmons |
			Slot 4: Bad 'n Boosted |
			Slot 5: Almost Any Ability |
			Slot 6: Mix and Mega
		`,
		mod: 'SlotShowdown',

		/*
		 * Common battle-level rules.
		 *
		 * Team legality itself is handled by validateTeam below,
		 * because every slot has different legality.
		 */
		ruleset: [
			'Standard OMs',
			'Sleep Moves Clause',
			'Terastal Clause',
			'Min Team Size = 6',
			'Max Team Size = 6',
		],

		/*
		 * =========================================================
		 * TEAM VALIDATION
		 * =========================================================
		 *
		 * Validate each Pokémon as a one-Pokémon team under the
		 * REAL corresponding Showdown OM.
		 */
		validateTeam(team) {
			if (!team || team.length !== 6) {
				return [`You must bring exactly 6 Pokémon.`];
			}

			const problems: string[] = [];

			for (let i = 0; i < 6; i++) {
				const validator = new TeamValidator(SLOT_FORMATS[i]);
				const slotProblems = validator.validateTeam([team[i]]);

				if (slotProblems) {
					for (const problem of slotProblems) {
						problems.push(
							`Slot ${i + 1} (${SLOT_NAMES[i]}): ${problem}`
						);
					}
				}
			}

			/*
			 * Because we validate each slot independently above,
			 * enforce whole-team Species Clause ourselves.
			 */
			const speciesTable = new Set<number>();

			for (const set of team) {
				const species = this.dex.species.get(set.species);

				if (speciesTable.has(species.num)) {
					problems.push(
						`Species Clause: You have more than one ${species.baseSpecies}.`
					);
				}

				speciesTable.add(species.num);
			}

			/*
			 * IMPORTANT:
			 * The entire battle is running the Mix and Mega engine.
			 *
			 * Therefore slots 1-5 must not be allowed to hold an
			 * MnM transformation item, or the MnM engine would also
			 * transform them.
			 *
			 * Reserve those items for slot 6.
			 */
			for (let i = 0; i < 5; i++) {
				const item = this.dex.items.get(team[i].item);

				const isMnMTransformationItem =
					!!item.megaStone ||
					!!item.isPrimalOrb ||
					!!item.forcedForme ||
					!!item.onDrive ||
					!!item.onMemory ||
					!!(item.onPlate && !item.zMove) ||
					item.name.startsWith('Rusted');

				if (isMnMTransformationItem) {
					problems.push(
						`Slot ${i + 1} (${SLOT_NAMES[i]}) cannot use ` +
						`${item.name}; Mix and Mega transformation items are ` +
						`reserved for slot 6.`
					);
				}
			}

			return problems.length ? problems : undefined;
		},

		/*
		 * =========================================================
		 * BATTLE INITIALIZATION
		 * =========================================================
		 */
		onBegin() {
			this.add('rule', 'Slot 1: Camomons');
			this.add('rule', 'Slot 2: Pokebilities');
			this.add('rule', 'Slot 3: STABmons');
			this.add('rule', "Slot 4: Bad 'n Boosted");
			this.add('rule', 'Slot 5: Almost Any Ability');
			this.add('rule', 'Slot 6: Mix and Mega');

			for (const pokemon of this.getAllPokemon()) {
				const slot = pokemon.side.team.indexOf(pokemon.set);

				/*
				 * SLOT 2 — POKEBILITIES
				 *
				 * This is the current Pokebilities format's
				 * initialization, but only for index 1.
				 */
				if (slot === 1) {
					if (
						pokemon.ability !==
						this.toID(pokemon.species.abilities['S'])
					) {
						pokemon.m.innates = Object.keys(pokemon.species.abilities)
							.filter(
								key =>
									key !== 'S' &&
									(key !== 'H' ||
										!pokemon.species.unreleasedHidden)
							)
							.map(key =>
								this.toID(
									pokemon.species.abilities[
										key as '0' | '1' | 'H' | 'S'
									]
								)
							)
							.filter(ability => ability !== pokemon.ability);
					}
				}

				/*
				 * SLOT 6 — MIX AND MEGA
				 *
				 * The normal MnM format initializes this field for
				 * every Pokémon. We only need it on slot 6.
				 */
				if (slot === 5) {
					pokemon.m.originalSpecies = pokemon.baseSpecies.name;
				}
			}
		},

		/*
		 * =========================================================
		 * SLOT 1 — CAMOMONS
		 * SLOT 4 — BAD 'N BOOSTED
		 * =========================================================
		 */
		onModifySpeciesPriority: 2,
		onModifySpecies(species, target, source, effect) {
			if (!target?.side) return;

			const slot = target.side.team.indexOf(target.set);

			/*
			 * SLOT 1 — CAMOMONS
			 *
			 * Exact basic mechanic:
			 * first two moves determine typing.
			 */
			if (slot === 0) {
				if (
					effect &&
					['imposter', 'transform'].includes(effect.id)
				) {
					return;
				}

				const types = [
					...new Set(
						target.baseMoveSlots
							.slice(0, 2)
							.map(move =>
								this.dex.moves.get(move.id).type
							)
					),
				];

				return {
					...species,
					types,
				};
			}

			/*
			 * SLOT 4 — BAD 'N BOOSTED
			 *
			 * Current Showdown implementation doubles every
			 * base stat <= 70, capped at 255.
			 */
			if (slot === 3) {
				const newSpecies = this.dex.deepClone(species);

				newSpecies.bst = 0;

				for (const stat in newSpecies.baseStats) {
					const statID = stat as StatID;

					if (newSpecies.baseStats[statID] <= 70) {
						newSpecies.baseStats[statID] =
							this.clampIntRange(
								newSpecies.baseStats[statID] * 2,
								1,
								255
							);
					}

					newSpecies.bst += newSpecies.baseStats[statID];
				}

				return newSpecies;
			}
		},

		/*
		 * =========================================================
		 * SLOT 2 — START POKEBILITIES INNATE ABILITIES
		 * =========================================================
		 */
		onBeforeSwitchIn(pokemon) {
			const slot = pokemon.side.team.indexOf(pokemon.set);
			if (slot !== 1) return;

			if (pokemon.m.innates) {
				for (const innate of pokemon.m.innates) {
					if (pokemon.hasAbility(innate)) continue;

					const effect = 'ability:' + this.toID(innate);

					pokemon.volatiles[effect] =
						this.initEffectState({
							id: effect,
							target: pokemon,
						});
				}
			}
		},

		/*
		 * =========================================================
		 * SWITCH-IN DISPLAY
		 *
		 * Camomons gets its type-change message.
		 * MnM gets the normal transformed-state display.
		 * =========================================================
		 */
		onSwitchIn(pokemon) {
			const slot = pokemon.side.team.indexOf(pokemon.set);

			// SLOT 1 — Camomons
			if (slot === 0) {
				this.add(
					'-start',
					pokemon,
					'typechange',
					(pokemon.illusion || pokemon)
						.getTypes(true)
						.join('/'),
					'[silent]',
					'[from] format: Slot 1 Camomons'
				);
			}

			// SLOT 6 — Mix and Mega display
			if (slot === 5) {
				const originalSpecies =
					this.dex.species.get(
						(pokemon.species as any).originalSpecies
					);

				if (originalSpecies.exists) {
					this.add(
						'-start',
						pokemon,
						originalSpecies.requiredItems?.[0] ||
							originalSpecies.requiredItem ||
							originalSpecies.requiredMove,
						'[silent]'
					);

					const baseSpecies =
						this.dex.species.get(
							pokemon.m.originalSpecies
						);

					if (
						baseSpecies.types.join('/') !==
						pokemon.species.types.join('/')
					) {
						this.add(
							'-start',
							pokemon,
							'typechange',
							pokemon.species.types.join('/'),
							'[silent]',
							'[from] format: Mix and Mega'
						);
					}
				}
			}
		},

		/*
		 * =========================================================
		 * SWITCH-OUT CLEANUP
		 * =========================================================
		 */
		onSwitchOut(pokemon) {
			const slot = pokemon.side.team.indexOf(pokemon.set);

			// SLOT 2 — remove Pokebilities innate volatiles
			if (slot === 1) {
				for (
					const innate of Object.keys(pokemon.volatiles)
						.filter(id => id.startsWith('ability:'))
				) {
					pokemon.removeVolatile(innate);
				}
			}

			// SLOT 6 — Mix and Mega display cleanup
			if (slot === 5) {
				const originalSpecies =
					this.dex.species.get(
						(pokemon.species as any).originalSpecies
					);

				if (
					originalSpecies.exists &&
					pokemon.m.originalSpecies !==
						originalSpecies.baseSpecies
				) {
					this.add(
						'-end',
						pokemon,
						originalSpecies.requiredItems?.[0] ||
							originalSpecies.requiredItem ||
							originalSpecies.requiredMove,
						'[silent]'
					);
				}
			}
		},

		/*
		 * SLOT 2 — Pokebilities faint cleanup
		 */
		onFaint(pokemon) {
			const slot = pokemon.side.team.indexOf(pokemon.set);
			if (slot !== 1) return;

			for (
				const innate of Object.keys(pokemon.volatiles)
					.filter(id => id.startsWith('ability:'))
			) {
				const innateEffect =
					this.dex.conditions.get(innate) as Effect;

				this.singleEvent(
					'End',
					innateEffect,
					null,
					pokemon
				);
			}
		},

		/*
		 * Camomons refresh / Pokebilities cleanup if a Mega event
		 * somehow affects those slots.
		 */
		onAfterMega(pokemon) {
			const slot = pokemon.side.team.indexOf(pokemon.set);

			if (slot === 0) {
				this.add(
					'-start',
					pokemon,
					'typechange',
					(pokemon.illusion || pokemon)
						.getTypes(true)
						.join('/'),
					'[silent]',
					'[from] format: Slot 1 Camomons'
				);
			}

			if (slot === 1) {
				for (
					const innate of Object.keys(pokemon.volatiles)
						.filter(id => id.startsWith('ability:'))
				) {
					pokemon.removeVolatile(innate);
				}

				pokemon.m.innates = undefined;
			}
		},
	},
];
