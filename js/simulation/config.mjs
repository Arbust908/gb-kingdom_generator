import { ANCESTRIES, ATTRIBUTES, DEFAULT_WEIGHTS, HOUSE_NAMES, KINGDOM_NAMES, PROFESSIONS } from './data.mjs';
import { createRandom } from './random.mjs';

function text(value, label, max = 80) {
    if (value === undefined || value === null || value === '') { return ''; }
    if (typeof value !== 'string' || value.trim().length > max) {
        throw new Error(`${label} must be text of at most ${max} characters.`);
    }
    return value.trim();
}

function integer(value, label, min, max) {
    if (typeof value !== 'number' && typeof value !== 'string') { throw new Error(`${label} must be a number.`); }
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) {
        throw new Error(`${label} must be a whole number between ${min} and ${max}.`);
    }
    return number;
}

function names(value, label, max) {
    if (value === undefined || value === null || value === '') { return []; }
    const list = typeof value === 'string' ? value.split(/[\n,]/) : value;
    if (!Array.isArray(list) || list.length > max) { throw new Error(`${label} must contain at most ${max} names.`); }
    return [...new Set(list.map(name => text(name, label)).filter(Boolean))];
}

export function resolveConfig(input = {}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) { throw new Error('Settings must be an object.'); }
    const seed = text(input.seed, 'Seed', 120) || globalThis.crypto.randomUUID();
    // Separate streams keep resolved settings replayable without changing simulation rolls.
    const random = createRandom(`${seed}:configuration`);
    const shuffledKingdoms = random.shuffle(KINGDOM_NAMES);
    const defaultHouses = random.shuffle(HOUSE_NAMES).slice(0, random.int(4, 6));
    const houseNames = names(input.houseNames, 'Noble houses', 12);
    const neighborNames = names(input.neighborNames, 'Neighboring kingdoms', 12);
    const neighborKeys = new Set(neighborNames.map(name => name.toLowerCase()));
    let defaultKingdom = shuffledKingdoms.find(name => !neighborKeys.has(name.toLowerCase())) || shuffledKingdoms[0];
    for (let suffix = 2; neighborKeys.has(defaultKingdom.toLowerCase()); suffix++) { defaultKingdom = `${shuffledKingdoms[0]} ${suffix}`; }
    const kingdomName = text(input.kingdomName, 'Kingdom name') || defaultKingdom;
    if (neighborKeys.has(kingdomName.toLowerCase())) {
        throw new Error('A neighboring kingdom must have a different name from the kingdom being generated.');
    }
    const ancestryWeights = { ...DEFAULT_WEIGHTS };
    if (input.ancestryWeights !== undefined) {
        if (!input.ancestryWeights || typeof input.ancestryWeights !== 'object' || Array.isArray(input.ancestryWeights)) {
            throw new Error('Ancestry weights must be an object.');
        }
        for (const [key, value] of Object.entries(input.ancestryWeights)) {
            if (!Object.hasOwn(ANCESTRIES, key)) { throw new Error(`Unknown ancestry: ${key}.`); }
            ancestryWeights[key] = integer(value, `${ANCESTRIES[key].name} weight`, 0, 100);
        }
    }
    if (!Object.values(ancestryWeights).some(weight => weight > 0)) { throw new Error('Give at least one ancestry a weight greater than zero.'); }

    const monarch = input.startingMonarch ?? {};
    if (!monarch || typeof monarch !== 'object' || Array.isArray(monarch)) { throw new Error('Starting monarch must be an object.'); }
    const suppliedAncestry = text(monarch.ancestry, 'Monarch ancestry');
    if (suppliedAncestry && !Object.hasOwn(ANCESTRIES, suppliedAncestry)) { throw new Error('Choose a known ancestry for the monarch.'); }
    const suppliedAge = monarch.age !== undefined && monarch.age !== null && monarch.age !== '';
    const age = suppliedAge ? integer(monarch.age, 'Monarch age', 0, 1000) : null;
    const eligibleWeights = Object.fromEntries(Object.entries(ancestryWeights).filter(([key]) => age === null || age <= ANCESTRIES[key].maxAge));
    if (!suppliedAncestry && !Object.values(eligibleWeights).some(weight => weight > 0)) {
        throw new Error('The monarch’s age exceeds every enabled ancestry’s maximum age. Change the age or ancestry weights.');
    }
    const ancestry = suppliedAncestry || random.weighted(eligibleWeights);
    if (age !== null && age > ANCESTRIES[ancestry].maxAge) {
        throw new Error(`${ANCESTRIES[ancestry].name} monarchs must be no older than ${ANCESTRIES[ancestry].maxAge}.`);
    }
    const profession = text(monarch.profession, 'Monarch profession');
    if (profession && !Object.hasOwn(PROFESSIONS, profession)) { throw new Error('Choose a known profession for the monarch.'); }
    const attributes = {};
    if (monarch.attributes !== undefined) {
        if (!monarch.attributes || typeof monarch.attributes !== 'object' || Array.isArray(monarch.attributes)) { throw new Error('Monarch attributes must be an object.'); }
        for (const [key, value] of Object.entries(monarch.attributes)) {
            if (!ATTRIBUTES.includes(key)) { throw new Error(`Unknown attribute: ${key}.`); }
            if (value !== '' && value !== null && value !== undefined) { attributes[key] = integer(value, key, 3, 20); }
        }
    }
    const startingMonarch = {
        name: text(monarch.name, 'Monarch name'),
        title: text(monarch.title, 'Monarch title') || 'Sovereign',
        houseName: text(monarch.houseName, 'Monarch house'),
        ancestry,
        attributes
    };
    if (age !== null) { startingMonarch.age = age; }
    if (profession) { startingMonarch.profession = profession; }
    if (monarch.level !== undefined && monarch.level !== null && monarch.level !== '') { startingMonarch.level = integer(monarch.level, 'Monarch level', 1, 20); }
    const resolvedHouses = houseNames.length ? houseNames : defaultHouses;
    if (startingMonarch.houseName && !resolvedHouses.includes(startingMonarch.houseName)) {
        if (resolvedHouses.length === 12) { throw new Error('Include the monarch’s house in the list of at most 12 noble houses.'); }
        resolvedHouses.push(startingMonarch.houseName);
    }
    const years = input.years === undefined || input.years === '' ? 100 : integer(input.years, 'Years to simulate', 1, 10000);
    if (input.allowUsurping !== undefined && typeof input.allowUsurping !== 'boolean') { throw new Error('Allow usurping must be true or false.'); }
    return {
        seed, years, kingdomName,
        houseNames: resolvedHouses,
        neighborNames: (neighborNames.length ? neighborNames : shuffledKingdoms.filter(name => name.toLowerCase() !== kingdomName.toLowerCase()).slice(0, 3)),
        characterNames: names(input.characterNames, 'Character names', 200),
        ancestryWeights, startingMonarch,
        allowUsurping: input.allowUsurping ?? true
    };
}
