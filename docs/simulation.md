# Simulation architecture and rules

## Boundaries

The main page imports `app.mjs`; the legacy `Kingdom.js` is not loaded by it. The new engine has no DOM dependencies and uses explicit per-run state rather than shared globals.

`generateKingdom(config)` is a synchronous generator yielding `{ year, totalYears, events }` for year 0 and every simulated year. Its final return value is a complete summary. A consumer must read that return value from the iterator's final `next()` result; `for...of` alone discards it.

`runGeneration(config, runId, send, checkpoint)` consumes the generator and emits messages. The browser adapter runs it in a module Web Worker. A checkpoint after each batch waits for the main thread to render and acknowledge receipt. Computation is off-thread; the generator by itself does not create concurrency.

### Worker protocol

| Direction | Type | Payload |
| --- | --- | --- |
| UI → worker | `generate` | `runId`, `config` |
| Worker → UI | `started` | `runId`, `totalYears` |
| Worker → UI | `events` | `runId`, `events` |
| Worker → UI | `progress` | `runId`, `year`, `totalYears` |
| UI → worker | `ack` | `runId` |
| Worker → UI | `completed` | `runId`, `summary` |
| Worker → UI | `error` | `runId`, `message` |

A batch contains at most five yearly results and aims for a 12 ms worker budget between turns. An individual yearly turn can exceed that budget; it still runs off the UI thread. The UI mounts at most 100 events in reverse chronological order, keeps all events in chronological order in memory for browsing/export, and acknowledges on its next animation frame. A background tab can therefore pause generation until it renders again.

Cancellation terminates the worker immediately. A new generation creates a new worker and run ID; stale messages are ignored. Cancellation does not produce a final summary or a resumable checkpoint.

## Reproducibility and settings

All simulation rolls use a seeded Mulberry32 random source. Configuration defaults use a separate stream. Resolved configuration, together with `engineVersion`, is included in the final result. Tests verify that replaying this configuration reproduces events and state.

An omitted seed creates a fresh random seed. Blank or empty name lists select defaults; nonempty lists replace them. Default house selection is randomized; explicit names are preserved. A custom monarch house is added to the house list if necessary, within the 12-house limit.

Monarch overrides are independent. Missing attributes roll 4d6, dropping the lowest die. Scores can be supplied from 3–20. An age-only override picks from enabled ancestries compatible with that age; an explicit ancestry is honored even if its random weight is zero.

## Characters and time

Each character has a stable ID; relationship links use IDs, so exported data contains no cyclic references. Age is derived from birth year and either current year or death year. Death freezes age. Events hold value snapshots of names and context rather than references to mutable characters.

The character browser includes living and deceased characters, pages its directory in groups of 20, and renders a family tree centered on the selected character. Parents, partners, and children are navigable by ID even when names repeat. `family.mjs` reads union events to recover historical partners because `partnerId` only describes the current partnership. A partnership ends at the earlier partner's death; navigating to a relative reveals the next generation without mounting the entire kingdom's genealogy at once.

The engine starts with six independent notable characters per house. These founders have unrecorded parents. Houses with fewer than four living members recruit unrelated adult nobles, keeping succession viable. Births are limited to houses with fewer than 12 living notable members and to four children per parent. This models the notable family roster, not the whole population.

Annual order:

1. Replenish small house rosters and ensure house leadership.
2. Resolve coming of age and regency.
3. Form partnerships and resolve births.
4. Resolve activities, advancement, old age, and disease.
5. Resolve governance, rivalries, and assassination attempts.
6. Resolve wars and battlefield exposure.
7. Build or destroy monuments and update aggregate population.

Deaths immediately update living rosters, partners, house leadership, succession, and regency before later actions. A recruit introduced during mortality processing begins regular annual activities on the next turn.

## D&D-inspired mechanics

### Ancestry

| Ancestry | Adult age | Typical lifespan | Maximum starting age |
| --- | ---: | ---: | ---: |
| Human | 18 | 80 | 120 |
| Elf | 100 | 700 | 1,000 |
| Dwarf | 50 | 320 | 450 |
| Halfling | 20 | 130 | 200 |
| Gnome | 40 | 400 | 550 |
| Dragonborn | 15 | 75 | 110 |

These values are simulation conventions. Old-age risk begins at 65% of typical lifespan, increases nonlinearly, and is reduced by Constitution. At or beyond maximum age the next mortality check is certain. Ancestry does not grant blanket attribute bonuses; resilience and vigilance instead modify relevant danger checks.

### Attributes, advancement, and power

Ability modifiers use `floor((score - 10) / 2)`. Professions define a primary attribute, hit die, activity, and eligibility for military participation. Stewards and scholars are included alongside six adventuring professions.

Adults have a yearly chance of attempting a profession-related achievement. A d20 check uses the primary attribute and Wisdom; success grants experience and prestige. Surviving a battle also grants experience. Reaching level `n + 1` requires `n² × 100` total experience. Levels stop at 20; every fourth level improves the primary attribute, capped at 20. There is no automatic yearly leveling or inheritance of a parent's combat power.

Hit points and personal power are derived from profession, level, relevant attributes, and lasting conditions. HP is a capability measure, not a turn-by-turn combat resource. Political influence is computed independently from prestige, legitimacy, house wealth, allied houses, Charisma, and rulership.

### Mortality

- **Disease:** annual exposure, then a d20 survival check adjusted by Constitution, ancestry resilience, advanced age, and conditions.
- **Old age:** a separate ancestry-relative annual probability.
- **Battle:** only adult military participants selected during an active war face danger. Their class's primary ability, Constitution, level, and conditions affect survival.
- **Assassination:** political danger to the ruler when a rival house exists, more likely during instability. Dexterity, Wisdom, ancestry vigilance, and level affect survival.

Surviving exactly at a disease/battle threshold can leave frailty or an old wound. These conditions persist in this version. Failure produces death from that danger rather than selecting an unrelated cause afterward.

### Families and succession

Partnership is gender-neutral. Characters must be adults; ancestors, descendants, siblings, and relatives sharing a parent or grandparent cannot partner. Eligible partners can have a child while both are younger than 65% of their ancestry's typical lifespan. A child inherits one parent's ancestry and the first parent's house; hybrid ancestries and detailed reproductive rules are not modeled.

Succession uses absolute primogeniture: the oldest child's branch precedes younger branches, regardless of gender. If there are no living descendants, the ruler's house leader inherits; house leadership falls back to the most influential living member, or a new recruit if the house is empty. A child ruler has an adult regent. A rival adult house leader with substantially greater influence may usurp when that setting is enabled.

The summary's fallback candidate describes current influence, not a guaranteed future heir. Later events can change the ranking. Every reign is a separate record, so accession and ending years determine duration even if a ruler returns to power.

## Scope and extension points

There is one simulated kingdom, with named neighboring opponents rather than independently simulated foreign populations. Wars resolve annually; no tactical combat, spells, equipment inventory, or full edition-specific character sheets are implemented. Population, prosperity, and stability are aggregate indicators with bounded values.

Add content and ancestry/profession definitions in `data.mjs`. Add character rules in `character.mjs`; causal kingdom behavior belongs in `engine.mjs`. Every new event needs a presentation in `app.mjs`. Keep the engine independent of the renderer, route all randomness through the seeded source, and bump the engine version when changing reproducible behavior.
