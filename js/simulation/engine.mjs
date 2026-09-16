import { ANCESTRIES, ENGINE_VERSION, MONUMENT_NAMES, PROFESSIONS } from './data.mjs';
import { resolveConfig } from './config.mjs';
import { createRandom } from './random.mjs';
import { ageOf, capability, clamp, createCharacter, gainExperience, influence, isAdult, modifier, oldAgeRisk, survivalTarget } from './character.mjs';

export class Simulation {
    constructor(input = {}) {
        this.config = resolveConfig(input);
        this.random = createRandom(`${this.config.seed}:simulation`);
        this.year = 0;
        this.characters = new Map();
        this.living = new Set();
        this.houses = this.config.houseNames.map((name, index) => ({ id: `h${index + 1}`, name, wealth: this.random.int(35, 75), allies: [], leaderId: null, members: new Set() }));
        this.rulerId = null;
        this.regentId = null;
        this.reigns = [];
        this.wars = [];
        this.monuments = [];
        this.population = this.random.int(20, 80) * 1000;
        this.prosperity = 55;
        this.stability = 65;
        this.events = [];
        this.eventCount = 0;
        this.totals = { births: 0, deaths: 0, arrivals: 0, achievements: 0 };
        this.initialized = false;
    }

    emit(type, characterIds = [], data = {}) {
        this.events.push({ id: ++this.eventCount, year: this.year, type, characterIds, data });
    }

    house(id) { return this.houses.find(house => house.id === id); }
    character(id) { return this.characters.get(id); }
    person(character) { return { id: character.id, name: character.name, house: this.house(character.houseId).name }; }
    livingMembers(house) { return [...house.members].map(id => this.character(id)); }
    politicalPower(character) { return influence(character, this.house(character.houseId), this.rulerId); }

    addCharacter(house, overrides = {}) {
        const character = createCharacter(this.random, this.config, `c${this.characters.size + 1}`, house.id, this.year, overrides);
        this.characters.set(character.id, character);
        this.living.add(character.id);
        house.members.add(character.id);
        return character;
    }

    initialize() {
        if (this.initialized) { return; }
        this.initialized = true;
        this.emit('founded', [], { name: this.config.kingdomName, population: this.population });
        const monarchHouse = this.houses.find(house => house.name === this.config.startingMonarch.houseName) || this.houses[0];
        const monarch = this.addCharacter(monarchHouse, this.config.startingMonarch);
        for (const house of this.houses) {
            while (house.members.size < 6) { this.addCharacter(house); }
            house.leaderId = this.strongest(this.livingMembers(house)).id;
        }
        this.ascend(monarch, 'founding');
        this.updateRegent();
    }

    strongest(characters) {
        return characters.sort((a, b) => this.politicalPower(b) - this.politicalPower(a) || a.birthYear - b.birthYear || a.id.localeCompare(b.id))[0];
    }

    // Absolute primogeniture: oldest child's branch precedes younger branches, regardless of gender.
    descendant(character, houseId = null) {
        const children = character.children.map(id => this.character(id)).sort((a, b) => a.birthYear - b.birthYear || a.id.localeCompare(b.id));
        const stack = [...children].reverse();
        const visited = new Set();
        while (stack.length) {
            const candidate = stack.pop();
            if (visited.has(candidate.id)) { continue; }
            visited.add(candidate.id);
            if (candidate.alive && (!houseId || candidate.houseId === houseId)) { return candidate; }
            stack.push(...candidate.children.map(id => this.character(id)).sort((a, b) => b.birthYear - a.birthYear || b.id.localeCompare(a.id)));
        }
        return null;
    }

    recruit(house) {
        const character = this.addCharacter(house);
        this.totals.arrivals++;
        this.emit('arrival', [character.id], { person: this.person(character), ancestry: character.ancestry });
        return character;
    }

    ensureLeadership(house) {
        const leader = this.character(house.leaderId);
        if (leader?.alive) { return; }
        const successor = (leader && this.descendant(leader, house.id)) || this.strongest(this.livingMembers(house)) || this.recruit(house);
        house.leaderId = successor.id;
        this.emit('house-leader', [successor.id], { person: this.person(successor) });
    }

    ascend(character, reason) {
        const previous = this.character(this.rulerId);
        if (previous) {
            const reign = this.reigns[this.reigns.length - 1];
            reign.endYear = this.year;
            reign.endReason = reason;
            previous.title = 'Noble';
        }
        this.rulerId = character.id;
        this.house(character.houseId).leaderId = character.id;
        if (reason !== 'founding') { character.title = 'Sovereign'; }
        character.prestige = clamp(character.prestige + 15, 0, 150);
        this.reigns.push({ characterId: character.id, name: character.name, house: this.house(character.houseId).name, title: character.title, startYear: this.year, endYear: null, endReason: null });
        this.emit('accession', [character.id], { person: this.person(character), title: character.title, reason, age: ageOf(character, this.year) });
    }

    updateRegent() {
        const ruler = this.character(this.rulerId);
        if (isAdult(ruler, this.year)) {
            if (this.regentId) { this.emit('regency-ended', [ruler.id], { person: this.person(ruler) }); }
            this.regentId = null;
            return;
        }
        if (this.character(this.regentId)?.alive) { return; }
        let candidates = [...this.living].map(id => this.character(id)).filter(person => isAdult(person, this.year));
        if (!candidates.length) { candidates = [this.recruit(this.house(ruler.houseId))]; }
        const regent = this.strongest(candidates);
        this.regentId = regent.id;
        this.emit('regency', [ruler.id, regent.id], { ruler: this.person(ruler), regent: this.person(regent) });
    }

    die(character, cause) {
        if (!character.alive) { return; }
        character.alive = false;
        character.deathYear = this.year;
        character.deathCause = cause;
        this.living.delete(character.id);
        this.house(character.houseId).members.delete(character.id);
        const partner = this.character(character.partnerId);
        if (partner) { partner.partnerId = null; }
        character.partnerId = null;
        this.totals.deaths++;
        this.emit('death', [character.id], { person: this.person(character), age: ageOf(character, this.year), cause });
        const wasRuler = character.id === this.rulerId;
        this.ensureLeadership(this.house(character.houseId));
        if (wasRuler) {
            const successor = this.descendant(character) || this.character(this.house(character.houseId).leaderId);
            this.ascend(successor, 'succession');
            this.stability = clamp(this.stability - 3, 0, 100);
        }
        this.updateRegent();
    }

    closeKin(first, second) {
        // Exclude ancestors/descendants and relatives sharing a parent or grandparent.
        const ancestors = person => {
            const all = new Set();
            const near = new Set();
            const stack = person.parents.map(id => [id, 1]);
            while (stack.length) {
                const [id, depth] = stack.pop();
                if (depth <= 2) { near.add(id); }
                if (all.has(id)) { continue; }
                all.add(id);
                stack.push(...this.character(id).parents.map(parentId => [parentId, depth + 1]));
            }
            return { all, near };
        };
        const left = ancestors(first);
        const right = ancestors(second);
        return left.all.has(second.id) || right.all.has(first.id) || [...left.near].some(id => right.near.has(id));
    }

    families() {
        const adults = [...this.living].map(id => this.character(id)).filter(person => isAdult(person, this.year));
        for (const person of adults) {
            if (!person.partnerId && this.random.chance(0.05)) {
                const candidates = adults.filter(other => other.id !== person.id && !other.partnerId && !this.closeKin(person, other));
                if (candidates.length) {
                    const partner = this.random.pick(candidates);
                    person.partnerId = partner.id;
                    partner.partnerId = person.id;
                    const house = this.house(person.houseId);
                    const otherHouse = this.house(partner.houseId);
                    if (house.id !== otherHouse.id && !house.allies.includes(otherHouse.id)) {
                        house.allies.push(otherHouse.id);
                        otherHouse.allies.push(house.id);
                    }
                    this.emit('union', [person.id, partner.id], { first: this.person(person), second: this.person(partner) });
                }
            }
            const partner = this.character(person.partnerId);
            if (!partner || person.id > partner.id) { continue; }
            const house = this.house(person.houseId);
            const canParent = parent => parent.children.length < 4 && ageOf(parent, this.year) < ANCESTRIES[parent.ancestry].lifespan * 0.65;
            if (house.members.size >= 12 || !canParent(person) || !canParent(partner) || !this.random.chance(0.06)) { continue; }
            const child = this.addCharacter(house, { age: 0, ancestry: this.random.pick([person.ancestry, partner.ancestry]), parents: [person.id, partner.id] });
            person.children.push(child.id);
            partner.children.push(child.id);
            this.totals.births++;
            this.emit('birth', [child.id, person.id, partner.id], { child: this.person(child), parents: [this.person(person), this.person(partner)], ancestry: child.ancestry });
        }
    }

    achievement(character) {
        const profession = PROFESSIONS[character.profession];
        const roll = this.random.int(1, 20);
        const bonus = modifier(character.attributes[profession.primary]) + modifier(character.attributes.wisdom);
        if (roll + bonus < 12) { return; }
        const experience = this.random.int(25, 80) + Math.max(0, bonus) * 5;
        const leveled = gainExperience(character, experience);
        character.achievements++;
        character.prestige = clamp(character.prestige + this.random.int(1, 4), 0, 150);
        this.totals.achievements++;
        this.emit('achievement', [character.id], { person: this.person(character), profession: character.profession, experience, roll, bonus });
        if (leveled) { this.emit('level', [character.id], { person: this.person(character), level: character.level }); }
    }

    danger(character, cause) {
        const roll = this.random.int(1, 20);
        const target = survivalTarget(character, cause, this.year);
        if (roll < target) { this.die(character, cause); return; }
        if (cause === 'disease' && roll === target && !character.conditions.includes('frailty')) { character.conditions.push('frailty'); }
        if (cause === 'battle' && roll === target && !character.conditions.includes('old wound')) { character.conditions.push('old wound'); }
        this.emit('survived', [character.id], { person: this.person(character), cause, roll, target, conditions: [...character.conditions] });
        if (cause === 'battle') {
            const leveled = gainExperience(character, 40);
            if (leveled) { this.emit('level', [character.id], { person: this.person(character), level: character.level }); }
        }
    }

    politics() {
        const governor = this.character(this.regentId || this.rulerId);
        const governance = modifier(governor.attributes.wisdom) + modifier(governor.attributes.intelligence);
        this.prosperity = clamp(this.prosperity + this.random.int(-2, 2) + governance * 0.12, 0, 100);
        this.stability = clamp(this.stability + this.random.int(-2, 2) + modifier(governor.attributes.charisma) * 0.12, 0, 100);
        for (const house of this.houses) {
            house.wealth = clamp(house.wealth + this.random.int(-3, 3) + (this.prosperity - 50) / 100, 0, 100);
        }
        const rival = this.strongest(this.houses.map(house => this.character(house.leaderId)).filter(person => person.houseId !== this.character(this.rulerId).houseId && isAdult(person, this.year)));
        if (rival && this.config.allowUsurping && this.politicalPower(rival) > this.politicalPower(this.character(this.rulerId)) + 15 && this.random.chance(0.025)) {
            this.ascend(rival, 'usurpation');
            this.stability = clamp(this.stability - 15, 0, 100);
            this.updateRegent();
        }
        if (rival && this.random.chance(0.005 + (100 - this.stability) / 10000)) { this.danger(this.character(this.rulerId), 'assassination'); }
    }

    conflicts() {
        let active = this.wars.find(war => war.endYear === null);
        if (!active && this.random.chance(0.025 + (100 - this.stability) / 5000)) {
            active = { id: `w${this.wars.length + 1}`, opponent: this.random.pick(this.config.neighborNames), startYear: this.year, endYear: null, outcome: null };
            this.wars.push(active);
            this.emit('war-start', [], { ...active });
        }
        if (!active) { return; }
        this.prosperity = clamp(this.prosperity - 1, 0, 100);
        const participants = this.random.shuffle([...this.living].map(id => this.character(id)).filter(person => isAdult(person, this.year) && PROFESSIONS[person.profession].martial)).slice(0, 6);
        for (const character of participants) {
            if (this.random.chance(0.12)) { this.danger(character, 'battle'); }
        }
        if (this.year - active.startYear >= 15 || this.random.chance(0.15)) {
            const strength = participants.reduce((sum, person) => sum + (person.alive ? capability(person).personalPower : 0), 0);
            const governor = this.character(this.regentId || this.rulerId);
            const chance = clamp(0.35 + strength / 600 + modifier(governor.attributes.intelligence) * 0.025, 0.1, 0.85);
            active.endYear = this.year;
            active.outcome = this.random.chance(chance) ? 'victory' : 'defeat';
            this.stability = clamp(this.stability + (active.outcome === 'victory' ? 8 : -8), 0, 100);
            this.emit('war-end', [], { ...active });
        }
    }

    landmarks() {
        for (const monument of this.monuments.filter(item => item.destroyedYear === null)) {
            if (this.random.chance(0.002)) {
                monument.destroyedYear = this.year;
                monument.cause = this.random.pick(['fire', 'an earthquake', 'neglect']);
                this.emit('monument-lost', [], { ...monument });
            }
        }
        if (this.random.chance(0.035) && this.prosperity >= 35) {
            const ruler = this.character(this.rulerId);
            const monument = { id: `m${this.monuments.length + 1}`, name: `${this.random.pick(MONUMENT_NAMES)} of ${ruler.name}`, founderId: ruler.id, builtYear: this.year, destroyedYear: null, cause: null };
            this.monuments.push(monument);
            this.emit('monument', [ruler.id], { ...monument });
        }
    }

    advanceYear() {
        this.year++;
        for (const house of this.houses) {
            while (house.members.size < 4) { this.recruit(house); }
            this.ensureLeadership(house);
        }
        for (const id of [...this.living]) {
            const character = this.character(id);
            if (ageOf(character, this.year) === ANCESTRIES[character.ancestry].maturity) {
                this.emit('majority', [id], { person: this.person(character), ancestry: character.ancestry });
            }
        }
        this.updateRegent();
        this.families();
        for (const id of [...this.living]) {
            const character = this.character(id);
            if (isAdult(character, this.year) && this.random.chance(0.12)) { this.achievement(character); }
            if (this.random.chance(oldAgeRisk(character, this.year))) { this.die(character, 'old age'); continue; }
            if (this.random.chance(0.012)) { this.danger(character, 'disease'); }
        }
        this.politics();
        this.conflicts();
        this.landmarks();
        const growth = 1 + (this.prosperity - 40) / 10000 - (this.wars.some(war => war.endYear === null) ? 0.008 : 0);
        this.population = clamp(Math.round(this.population * growth), 1000, 1000000);
    }

    takeEvents() {
        const events = this.events;
        this.events = [];
        return events;
    }

    summary() {
        const people = [...this.characters.values()].map(character => ({
            ...character,
            attributes: { ...character.attributes }, conditions: [...character.conditions], parents: [...character.parents], children: [...character.children],
            age: ageOf(character, this.year), house: this.house(character.houseId).name,
            ...capability(character), politicalInfluence: this.politicalPower(character)
        }));
        const reigns = this.reigns.map(reign => ({ ...reign, duration: (reign.endYear ?? this.year) - reign.startYear }));
        const ruler = people.find(person => person.id === this.rulerId);
        const heir = this.descendant(this.character(this.rulerId));
        const fallback = this.strongest(this.livingMembers(this.house(ruler.houseId)).filter(person => person.id !== ruler.id));
        return {
            engineVersion: ENGINE_VERSION, config: structuredClone(this.config), year: this.year,
            population: this.population, prosperity: Math.round(this.prosperity), stability: Math.round(this.stability),
            ruler, regent: people.find(person => person.id === this.regentId) || null,
            heir: heir ? this.person(heir) : null, successionFallback: !heir && fallback ? this.person(fallback) : null,
            characters: people, livingCount: this.living.size, eventCount: this.eventCount, totals: { ...this.totals },
            ancestries: Object.fromEntries(Object.keys(ANCESTRIES).map(key => [key, people.filter(person => person.alive && person.ancestry === key).length])),
            houses: this.houses.map(house => ({ id: house.id, name: house.name, wealth: Math.round(house.wealth), allies: house.allies.map(id => this.house(id).name), livingCount: house.members.size, leaderId: house.leaderId, influence: this.politicalPower(this.character(house.leaderId)) })),
            reigns, longestReign: [...reigns].sort((a, b) => b.duration - a.duration)[0], shortestReign: [...reigns].sort((a, b) => a.duration - b.duration)[0],
            wars: this.wars.map(war => ({ ...war })), monuments: this.monuments.map(monument => ({ ...monument }))
        };
    }
}

export function* generateKingdom(input = {}) {
    const simulation = new Simulation(input);
    simulation.initialize();
    yield { year: 0, totalYears: simulation.config.years, events: simulation.takeEvents() };
    while (simulation.year < simulation.config.years) {
        simulation.advanceYear();
        yield { year: simulation.year, totalYears: simulation.config.years, events: simulation.takeEvents() };
    }
    return simulation.summary();
}
