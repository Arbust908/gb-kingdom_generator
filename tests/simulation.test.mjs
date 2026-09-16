import test from 'node:test';
import assert from 'node:assert/strict';
import { ANCESTRIES, ATTRIBUTES, DEFAULT_WEIGHTS, KINGDOM_NAMES } from '../js/simulation/data.mjs';
import { resolveConfig } from '../js/simulation/config.mjs';
import { capability, gainExperience, oldAgeRisk, survivalTarget } from '../js/simulation/character.mjs';
import { generateKingdom, Simulation } from '../js/simulation/engine.mjs';
import { runGeneration } from '../js/simulation/run.mjs';

function complete(config) {
    const generator = generateKingdom(config);
    const events = [];
    let step = generator.next();
    while (!step.done) {
        events.push(...step.value.events);
        step = generator.next();
    }
    return { events, summary: step.value };
}

test('generates with no input and replays a run from its resolved configuration', () => {
    const randomRun = complete();
    assert.equal(randomRun.summary.year, 100);
    assert.ok(randomRun.summary.config.seed);
    assert.deepEqual(complete(randomRun.summary.config), randomRun);
    assert.deepEqual(complete({ seed: 'repeat', years: 100 }), complete({ seed: 'repeat', years: 100 }));
    assert.notDeepEqual(complete({ seed: 'other', years: 100 }), complete({ seed: 'repeat', years: 100 }));
});

test('preserves a partially specified monarch and custom name pools', () => {
    const simulation = new Simulation({ seed: 'elara', years: 1, characterNames: ['Aster'], houseNames: ['Oak'], startingMonarch: { name: 'Elara', title: 'Queen', ancestry: 'elf', age: 120, houseName: 'Moon', attributes: { constitution: 18 } } });
    simulation.initialize();
    const { ruler, characters, config } = simulation.summary();
    assert.equal(ruler.name, 'Elara');
    assert.equal(ruler.title, 'Queen');
    assert.equal(ruler.age, 120);
    assert.equal(ruler.ancestry, 'elf');
    assert.equal(ruler.house, 'Moon');
    assert.equal(ruler.attributes.constitution, 18);
    assert.equal(Object.keys(ruler.attributes).length, 6);
    assert.ok(characters.filter(person => person.id !== ruler.id).every(person => person.name === 'Aster'));
    assert.deepEqual(config.houseNames, ['Oak', 'Moon']);
});

test('rejects invalid configuration instead of silently replacing supplied values', () => {
    for (const years of [-1, 0, 1.5, 10001, 'not a number', Infinity, null, true]) {
        assert.throws(() => resolveConfig({ years }), /Years/);
    }
    assert.throws(() => resolveConfig({ ancestryWeights: Object.fromEntries(Object.keys(DEFAULT_WEIGHTS).map(key => [key, 0])) }), /at least one/);
    assert.throws(() => resolveConfig({ ancestryWeights: { elf: -1 } }), /weight/);
    assert.throws(() => resolveConfig({ startingMonarch: { ancestry: 'human', age: 500 } }), /no older/);
    assert.throws(() => resolveConfig({ startingMonarch: { ancestry: 'toString' } }), /known ancestry/);
    assert.throws(() => resolveConfig({ startingMonarch: { profession: 'dragon' } }), /known profession/);
    assert.throws(() => resolveConfig({ startingMonarch: { attributes: { strength: 21 } } }), /strength/);
    assert.throws(() => resolveConfig({ houseNames: Array(13).fill('House') }), /at most 12/);
    assert.throws(() => resolveConfig({ characterNames: [5] }), /must be text/);
    assert.throws(() => resolveConfig({ kingdomName: 'Oak', neighborNames: ['oak'] }), /different name/);
});

test('respects ancestry weights while allowing an explicit starting monarch exception', () => {
    const weights = Object.fromEntries(Object.keys(DEFAULT_WEIGHTS).map(key => [key, key === 'dwarf' ? 1 : 0]));
    const simulation = new Simulation({ seed: 'dwarves', ancestryWeights: weights, startingMonarch: { ancestry: 'elf', age: 200 } });
    simulation.initialize();
    assert.ok([...simulation.characters.values()].filter(person => person.id !== simulation.rulerId).every(person => person.ancestry === 'dwarf'));
    assert.throws(() => resolveConfig({ ancestryWeights: weights, startingMonarch: { age: 600 } }), /exceeds every enabled/);
});

test('generates compatible kingdom and neighbor names when either is omitted', () => {
    const config = resolveConfig({ seed: 'names', neighborNames: KINGDOM_NAMES });
    assert.ok(!config.neighborNames.includes(config.kingdomName));
    const named = resolveConfig({ kingdomName: 'austaria', seed: 'names' });
    assert.ok(!named.neighborNames.some(name => name.toLowerCase() === named.kingdomName));
});

test('uses ancestry life stages and attributes in mortality and dangerous encounters', () => {
    const simulation = new Simulation({ seed: 'risk' });
    simulation.initialize();
    const base = simulation.character(simulation.rulerId);
    const human = { ...base, ancestry: 'human', birthYear: -80, conditions: [], attributes: Object.fromEntries(ATTRIBUTES.map(key => [key, 10])) };
    const elf = { ...human, ancestry: 'elf' };
    assert.ok(oldAgeRisk(human, 0) > oldAgeRisk(elf, 0));
    assert.equal(oldAgeRisk({ ...human, birthYear: -120 }, 0), 1);
    const hardy = { ...human, attributes: { ...human.attributes, constitution: 18 } };
    assert.ok(oldAgeRisk(hardy, 0) < oldAgeRisk(human, 0));
    assert.ok(survivalTarget(hardy, 'disease', 0) < survivalTarget(human, 'disease', 0));
    const alert = { ...human, attributes: { ...human.attributes, dexterity: 18, wisdom: 18 } };
    assert.ok(survivalTarget(alert, 'assassination', 0) < survivalTarget(human, 'assassination', 0));
    assert.ok(survivalTarget({ ...hardy, level: 10 }, 'battle', 0) < survivalTarget(human, 'battle', 0));
    assert.ok(capability(hardy).hitPoints > capability(human).hitPoints);
});

test('bounds advancement and separates personal power from political influence', () => {
    const simulation = new Simulation({ seed: 'power' });
    simulation.initialize();
    const person = simulation.character(simulation.rulerId);
    const originalPower = capability(person).personalPower;
    person.prestige += 30;
    assert.equal(capability(person).personalPower, originalPower);
    gainExperience(person, 1000000);
    assert.equal(person.level, 20);
    assert.equal(person.experience, 36100);
    assert.ok(Object.values(person.attributes).every(score => score <= 20));
    const before = structuredClone(person);
    gainExperience(person, 1000);
    assert.deepEqual(person, before);
});

test('resolves a monarch death immediately with a living child and an adult regent', () => {
    const simulation = new Simulation({ seed: 'heir', startingMonarch: { ancestry: 'human', age: 40 } });
    simulation.initialize();
    simulation.takeEvents();
    const ruler = simulation.character(simulation.rulerId);
    const house = simulation.house(ruler.houseId);
    const heir = simulation.addCharacter(house, { age: 2, ancestry: 'human', parents: [ruler.id] });
    ruler.children.push(heir.id);
    simulation.year = 3;
    simulation.die(ruler, 'disease');
    assert.equal(simulation.rulerId, heir.id);
    assert.equal(house.leaderId, heir.id);
    assert.ok(simulation.character(simulation.regentId).alive);
    assert.ok(simulation.summary().regent.age >= ANCESTRIES[simulation.summary().regent.ancestry].maturity);
    assert.equal(simulation.reigns[0].endYear, 3);
    assert.equal(simulation.reigns[1].startYear, 3);
    const eventCount = simulation.eventCount;
    simulation.die(ruler, 'disease');
    assert.equal(simulation.eventCount, eventCount);
    simulation.year = 16;
    simulation.updateRegent();
    assert.equal(simulation.regentId, null);
});

test('keeps an older deceased child’s branch ahead of a younger living sibling', () => {
    const simulation = new Simulation({ seed: 'branches' });
    simulation.initialize();
    const ruler = simulation.character(simulation.rulerId);
    const house = simulation.house(ruler.houseId);
    const first = simulation.addCharacter(house, { age: 30, parents: [ruler.id] });
    const second = simulation.addCharacter(house, { age: 25, parents: [ruler.id] });
    const grandchild = simulation.addCharacter(house, { age: 2, parents: [first.id] });
    ruler.children.push(first.id, second.id);
    first.children.push(grandchild.id);
    simulation.die(first, 'disease');
    assert.equal(simulation.descendant(ruler).id, grandchild.id);
    assert.ok(simulation.closeKin(ruler, grandchild));
    assert.ok(simulation.closeKin(first, second));
});

test('maintains character, family, leadership, chronology and summary invariants over centuries', () => {
    for (const seed of ['centuries', 'winter', 'dynasty']) {
        const { events, summary } = complete({ seed, years: 1000 });
        const people = new Map(summary.characters.map(person => [person.id, person]));
        assert.equal(summary.year, 1000);
        assert.equal(summary.eventCount, events.length);
        assert.equal(summary.livingCount, summary.characters.filter(person => person.alive).length);
        assert.equal(summary.totals.deaths, summary.characters.filter(person => !person.alive).length);
        assert.equal(summary.characters.length, summary.config.houseNames.length * 6 + summary.totals.births + summary.totals.arrivals);
        assert.ok(summary.ruler.alive);
        assert.ok(summary.houses.every(house => people.get(house.leaderId).alive));
        const deceased = new Set();
        let previousYear = 0;
        for (const event of events) {
            assert.ok(event.year >= previousYear);
            previousYear = event.year;
            if (['achievement', 'level', 'accession', 'survived', 'majority'].includes(event.type)) { assert.ok(!deceased.has(event.characterIds[0])); }
            if (event.type === 'death') { assert.ok(!deceased.has(event.characterIds[0])); deceased.add(event.characterIds[0]); }
            if ((event.type === 'death' || event.type === 'survived') && event.data.cause === 'battle') {
                assert.ok(summary.wars.some(war => war.startYear <= event.year && (war.endYear === null || war.endYear >= event.year)));
            }
        }
        for (const person of summary.characters) {
            assert.ok(person.level >= 1 && person.level <= 20);
            assert.ok(person.age >= 0);
            assert.ok(Number.isFinite(person.personalPower));
            for (const parentId of person.parents) { assert.ok(people.get(parentId).children.includes(person.id)); }
            if (person.partnerId) { assert.equal(people.get(person.partnerId).partnerId, person.id); assert.ok(people.get(person.partnerId).alive); }
            if (!person.alive) { assert.ok(person.deathCause); assert.equal(person.age, person.deathYear - person.birthYear); }
        }
        assert.equal(summary.reigns.reduce((sum, reign) => sum + reign.duration, 0), 1000);
        assert.equal(Object.values(summary.ancestries).reduce((sum, count) => sum + count, 0), summary.livingCount);
    }
});

test('streams ordered batches with backpressure and the same result as direct execution', async () => {
    const config = { seed: 'stream', years: 37 };
    const messages = [];
    let release;
    const running = runGeneration(config, 'run-1', message => messages.push(message), () => new Promise(resolve => { release = resolve; }));
    assert.equal(messages[0].type, 'started');
    assert.equal(messages.at(-1).type, 'progress');
    const firstBatchLength = messages.length;
    await new Promise(resolve => setTimeout(resolve, 10));
    assert.equal(messages.length, firstBatchLength, 'must wait until the UI acknowledges a batch');
    while (messages.at(-1).type !== 'completed') {
        release();
        await new Promise(resolve => setImmediate(resolve));
    }
    await running;
    assert.ok(messages.every(message => message.runId === 'run-1'));
    const direct = complete(config);
    assert.deepEqual(messages.filter(message => message.type === 'events').flatMap(message => message.events), direct.events);
    assert.deepEqual(messages.at(-1).summary, direct.summary);
    assert.equal(messages.filter(message => message.type === 'progress').at(-1).year, 37);
});
