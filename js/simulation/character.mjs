import { ANCESTRIES, ATTRIBUTES, PROFESSIONS } from './data.mjs';

export const modifier = score => Math.floor((score - 10) / 2);
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const ageOf = (character, year) => (character.deathYear ?? year) - character.birthYear;
export const isAdult = (character, year) => ageOf(character, year) >= ANCESTRIES[character.ancestry].maturity;

export function createCharacter(random, config, id, houseId, year, overrides = {}) {
    // Roll every default even when overridden so replaying resolved inputs keeps the stream stable.
    const rolledAncestry = random.weighted(config.ancestryWeights);
    const ancestry = overrides.ancestry || rolledAncestry;
    const species = ANCESTRIES[ancestry];
    const rolledAge = random.int(species.maturity, Math.floor(species.lifespan * 0.6));
    const rolledName = random.pick(config.characterNames.length ? config.characterNames : species.names);
    const rolledProfession = random.pick(Object.keys(PROFESSIONS));
    const rolledLevel = random.int(1, 4);
    const attributes = Object.fromEntries(ATTRIBUTES.map(attribute => {
        const dice = Array.from({ length: 4 }, () => random.int(1, 6)).sort((a, b) => a - b);
        return [attribute, dice.slice(1).reduce((sum, value) => sum + value, 0)];
    }));
    const age = overrides.age ?? rolledAge;
    const level = overrides.level ?? (age < species.maturity ? 1 : rolledLevel);
    return {
        id, name: overrides.name || rolledName, ancestry, houseId,
        birthYear: year - age, alive: true, deathYear: null, deathCause: null,
        profession: overrides.profession || rolledProfession,
        level, experience: (level - 1) ** 2 * 100,
        attributes: { ...attributes, ...overrides.attributes },
        prestige: random.int(5, 25), legitimacy: random.int(45, 85),
        conditions: [], parents: overrides.parents || [], children: [], partnerId: null,
        title: overrides.title || 'Noble', achievements: 0
    };
}

export function capability(character) {
    const profession = PROFESSIONS[character.profession];
    const conditionPenalty = character.conditions.length * 2;
    const hitPoints = Math.max(character.level, profession.hitDie + (character.level - 1) * Math.ceil(profession.hitDie / 2) + character.level * modifier(character.attributes.constitution) - conditionPenalty);
    return {
        hitPoints,
        personalPower: Math.max(1, character.level * 4 + modifier(character.attributes[profession.primary]) * 2 + Math.floor(hitPoints / 5) - conditionPenalty)
    };
}

export function influence(character, house, rulerId) {
    return Math.max(0, Math.round(character.prestige + character.legitimacy / 4 + house.wealth / 5 + house.allies.length * 5 + modifier(character.attributes.charisma) * 3 + (character.id === rulerId ? 30 : 0)));
}

export function oldAgeRisk(character, year) {
    const ancestry = ANCESTRIES[character.ancestry];
    const age = ageOf(character, year);
    if (age >= ancestry.maxAge) { return 1; }
    const relativeAge = age / ancestry.lifespan;
    if (relativeAge < 0.65) { return 0; }
    return clamp(((relativeAge - 0.65) / 0.6) ** 3 * 0.3 * (1 - modifier(character.attributes.constitution) * 0.06), 0, 0.95);
}

export function survivalTarget(character, danger, year) {
    const ancestry = ANCESTRIES[character.ancestry];
    const attributes = character.attributes;
    const agePenalty = ageOf(character, year) > ancestry.lifespan * 0.8 ? 2 : 0;
    if (danger === 'disease') { return 8 - modifier(attributes.constitution) - ancestry.resilience + agePenalty + character.conditions.length; }
    if (danger === 'assassination') { return 10 - modifier(attributes.dexterity) - modifier(attributes.wisdom) - ancestry.vigilance - Math.floor(character.level / 4); }
    const primary = PROFESSIONS[character.profession].primary;
    return 11 - modifier(attributes[primary]) - modifier(attributes.constitution) - Math.floor(character.level / 3) + character.conditions.length;
}

export function gainExperience(character, amount) {
    const previousLevel = character.level;
    character.experience = Math.min(36100, character.experience + amount);
    while (character.level < 20 && character.experience >= character.level ** 2 * 100) {
        character.level++;
        if (character.level % 4 === 0) {
            const primary = PROFESSIONS[character.profession].primary;
            character.attributes[primary] = Math.min(20, character.attributes[primary] + 1);
        }
    }
    return character.level > previousLevel;
}
