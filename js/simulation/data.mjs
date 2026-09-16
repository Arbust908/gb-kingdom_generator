export const ENGINE_VERSION = '1.0.0';
export const ATTRIBUTES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

// D&D-inspired life stages and traits, not an implementation of a specific edition.
// Name selections reuse the project's fantasy name tables.
export const ANCESTRIES = {
    human: { name: 'Human', maturity: 18, lifespan: 80, maxAge: 120, resilience: 0, vigilance: 0, names: ['Aelia', 'Lucius', 'Valeria', 'Cassian', 'Flavia', 'Aurelian', 'Marina', 'Octavian'] },
    elf: { name: 'Elf', maturity: 100, lifespan: 700, maxAge: 1000, resilience: 0, vigilance: 2, names: ['Adrie', 'Althaea', 'Caelynn', 'Bryn', 'Eryn', 'Naeris', 'Thia', 'Riardon'] },
    dwarf: { name: 'Dwarf', maturity: 50, lifespan: 320, maxAge: 450, resilience: 2, vigilance: 0, names: ['Anbera', 'Artin', 'Audhild', 'Bardryn', 'Dagnal', 'Eldeth', 'Kathra', 'Thorin'] },
    halfling: { name: 'Halfling', maturity: 20, lifespan: 130, maxAge: 200, resilience: 1, vigilance: 1, names: ['Andry', 'Bree', 'Callie', 'Cora', 'Eldon', 'Garret', 'Milo', 'Roscoe'] },
    gnome: { name: 'Gnome', maturity: 40, lifespan: 400, maxAge: 550, resilience: 1, vigilance: 1, names: ['Bimpnottin', 'Breena', 'Caramip', 'Ellywick', 'Alston', 'Boddynock', 'Dimble', 'Wrenn'] },
    dragonborn: { name: 'Dragonborn', maturity: 15, lifespan: 75, maxAge: 110, resilience: 1, vigilance: 0, names: ['Akra', 'Biri', 'Daar', 'Harann', 'Arjhan', 'Balasar', 'Donaar', 'Medrash'] }
};

export const PROFESSIONS = {
    fighter: { name: 'Fighter', primary: 'strength', hitDie: 10, martial: true, activity: 'distinguished themselves on a dangerous expedition' },
    ranger: { name: 'Ranger', primary: 'dexterity', hitDie: 10, martial: true, activity: 'secured the kingdom’s border roads' },
    rogue: { name: 'Rogue', primary: 'dexterity', hitDie: 8, martial: true, activity: 'uncovered a plot against their house' },
    wizard: { name: 'Wizard', primary: 'intelligence', hitDie: 6, martial: true, activity: 'mastered a difficult arcane working' },
    cleric: { name: 'Cleric', primary: 'wisdom', hitDie: 8, martial: true, activity: 'brought aid to a troubled settlement' },
    bard: { name: 'Bard', primary: 'charisma', hitDie: 8, martial: false, activity: 'won patrons through a celebrated performance' },
    steward: { name: 'Steward', primary: 'wisdom', hitDie: 6, martial: false, activity: 'restored the fortunes of a struggling estate' },
    scholar: { name: 'Scholar', primary: 'intelligence', hitDie: 6, martial: false, activity: 'completed an influential scholarly work' }
};

export const DEFAULT_WEIGHTS = { human: 40, elf: 15, dwarf: 15, halfling: 10, gnome: 10, dragonborn: 10 };
export const HOUSE_NAMES = ['Alphus', 'Betan', 'Gammris', 'Celos', 'Kaeivar', 'Nautus', 'Nighthall', 'Grimstrong', 'Sanport', 'Shurvine'];
export const KINGDOM_NAMES = ['Austaria', 'Griggledorn', 'Carthal', 'Tortestra', 'Everspring', 'Valemere', 'Alderreach', 'Thornward'];
export const MONUMENT_NAMES = ['Archive', 'Watchtower', 'Gardens', 'Great Bridge', 'Sanctuary', 'Observatory'];
