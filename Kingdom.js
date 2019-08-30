'use strict';
/*
Copyright (C) 2016  Adam Edwards

The JavaScript code in this page is free software: you can
redistribute it and/or modify it under the terms of the GNU
General Public License (GNU GPL) as published by the Free Software
Foundation, either version 3 of the License, or (at your option)
any later version.  The code is distributed WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

As additional permission under GNU GPL version 3 section 7, you
may distribute non-source (e.g., minimized or compacted) forms of
that code without the copy of the GNU GPL normally required by
section 4, provided you include this license notice and a URL
through which recipients can access the Corresponding Source.
*/

// Data Methods
function randomItem (items) {
    return items[Math.floor(Math.random() * items.length)];
}

// Universal Registers
let kingdom = null;
let generateOutput = '';

// Data
const nobleHouseNames = [];
// let deathTypes = ["natural causes", "assassination", "old age", "poisoning", "gout", "senility", "battlefield wounds"];
const maleNames = [];
const femaleNames = [];
const sobriquets = ['Bold', 'Pious', 'Terrible', 'Wise', 'Clever', 'Builder', 'Sage', 'Warlord', 'Valiant', 'Merciless', 'Cruel', 'Good', 'Bad', 'Bald', 'Logician', 'Farmer', 'Mirthful', 'Restless', 'Pillager', 'Butcher', 'Dragon', 'Poet', 'Reformer', 'Philosopher'];

const monumentNameNouns = ['Castle', 'Citadel', 'Tower', 'Shrine', 'Fortress', 'Monument', 'Wall', 'Statue', 'Arch', 'Temple', 'Lighthouse', 'Colossus', 'Gardens', 'Library', 'Palace', 'College', 'Observatory'];
const monumentDestructionTypes = ['fire', 'storm', 'earthquake', 'lightning', 'witchcraft', 'blight', 'sabotage', 'uprising', 'arson', 'design flaw', 'warfare', 'crumbling', 'toppling', 'mysterious forces', 'the Sovereign'];

const otherKingdomNames = ['Austaria', 'Griggledorn', 'Carthal', 'Tortestra'];
const governmentTypes = ['Kingdom', 'Kingdom', 'Kingdom', 'Kingdom', 'Kingdom', 'Empire', 'Republic', 'City', 'Confederation', 'Mageocracy', 'Holy Order', 'Horde', 'Council', 'Bank'];

// Constants
const yearsSimulated = 3000;
const nobleHouseSize = 1000;

const initialAgeRange = 60;
// let maxReignTime = 50; // not yet used
// let minAscendAge = 10; // not yet used
// let AscendAgeRange = 20; // not yet used
// let chanceRegimeChange = .1;
// let femaleRulerChance = 0.5; // not used
const yearlyDeathChance = 0.04;
const ageDeathChance = 0.001;
const minParentAge = 13;
const minRulerAge = 12;
const minRegentAge = 20;

// Prestige & Power
const initialHousePowerRange = 10; // ranges from 0 to this. Higher it is, more spread out the noble houses are in power at start, generally
const yearlyHouseJostling = 1;
const prestigeGrowthRange = 0.3; // more of this, more prestige gained each year, and more likely a death will lead to usurping
const prestigeFromCount = 1;
const prestigeFromRuler = 3;
const inheritedPrestige = 0.75; // how much prestige you get from your primary parent - lower means usurping is more likely
const yearlyUsurpAttempt = 0.1; // if a ruler's house has less might, there is a chance each year of being deposed
const allowUsurping = true;

// Event Constants
const monumentChance = 0.02;
const warStartChance = 0.02;
const warEndChance = 0.1;
const monumentDestructionChance = 0.002;

function chanceToHaveChild (female, age) {
    if (age < minParentAge) { return 0; }

    if (female) { return 0.30 - (age * 0.005); }

    return 0.25;
}

class DeathCause {
    constructor (name, minAge, maxAge) {
        if (DeathCause.All == null) { DeathCause.All = []; } else { DeathCause.All.push(this); }
        this.name = name;
        this.minAge = minAge;
        this.maxAge = maxAge;
    }

    static SelectCause (deceased) {
        const applicableCauses = [];
        for (let i = 0; i < DeathCause.All.length; i++) {
            let acceptable = true;
            if (deceased.age < DeathCause.All[i].minAge || deceased.age > DeathCause.All[i].maxAge) { acceptable = false; }
            if (acceptable) { applicableCauses.push(DeathCause.All[i]); }
        }
        return randomItem(applicableCauses);
    }
}
// hay que crear el Obj con array de Death aparte
new DeathCause('disease', 0, 200);
new DeathCause('natural causes', 0, 200);
new DeathCause('plague', 0, 200);
new DeathCause('assassination', 0, 200);
new DeathCause('old age', 50, 200);
new DeathCause('poisoning', 0, 200);
new DeathCause('gout', 0, 200);
new DeathCause('senility', 50, 200);
new DeathCause('battlefield wounds', 10, 200);

class Monument {
    constructor (name, buildYear) {
        this.name = name;
        this.yearBuilt = buildYear;
        this.duration = 0;
        this.resolution = '';
    }

    AdvanceYear () {
        this.duration++;
    }
}

class War {
    constructor (opponent) {
        this.opponent = opponent;
        this.duration = 0;
    // this.chanceToEnd = .05;
    }

    AdvanceYear () {
        this.duration++;
    }
}

class OtherKingdom {
    constructor (name) {
        this.name = name;
    }
}

class Kingdom {
    constructor () {
        this.nobleHouses = [];
        this.RulerList = [];
        this.monumentList = [];
        this.destroyedMonumentList = [];
        this.religionList = [];
        this.warList = [];
        this.periodList = [];
        this.otherKingdoms = [];
        this.otherKingdomsAtPeace = [];

        Kingdom.eventLog = [];
        for (let i = 0; i < nobleHouseNames.length; i++) {
            this.nobleHouses.push(new NobleHouse(nobleHouseNames[i], this));
        }

        for (let i = 0; i < otherKingdomNames.length; i++) {
            const tempKingdom = new OtherKingdom(randomItem(governmentTypes) + ' of ' + otherKingdomNames[i]);
            this.otherKingdoms.push(tempKingdom);
            this.otherKingdomsAtPeace.push(tempKingdom);
        }

        this.year = 0;

        this.rulingHouse = null;
        this.ruler = null;
        this.FindNewRuler();
    }

    AdvanceYear () {
        this.year++;

        for (let i = 0; i < this.nobleHouses.length; i++) {
            this.nobleHouses[i].AdvanceYear();
        }

        for (let i = 0; i < this.warList.length; i++) {
            this.warList[i].AdvanceYear();
        }

        for (let i = 0; i < this.monumentList.length; i++) {
            this.monumentList[i].AdvanceYear();
        }

        for (let i = 0; i < this.monumentList.length; i++) {
            if (Math.random() < monumentDestructionChance) { this.DestroyMonument(this.monumentList[i]); }
        }

        if (allowUsurping && this.GreatestHouse() !== this.rulingHouse) {
            if (Math.random() < yearlyUsurpAttempt) { this.ruler.Die('violent overthrow'); }
        }

        if (Kingdom.eventLog.length > 0) {
            write('<h4>Year ' + this.year + '</h4>');
            Kingdom.eventLog.reverse();

            while (Kingdom.eventLog.length > 0) {
                writebullet(Kingdom.eventLog.pop());
            }
        }

        if (Math.random() < monumentChance) { this.BuildMonument(); }

        if (Math.random() < warStartChance) { this.StartWar(); }

        if (Math.random() < warEndChance && this.warList.length > 0) { this.EndWar(randomItem(this.warList)); }

        if (this.year % KingdomOverviewPeriod === 0) {
            write('<h3>Year ' + this.year + ' Review</h3>');
            this.DisplayKingdomStats();
            write('<h3></h3>');
        }
    }

    StartWar () {
        if (this.otherKingdomsAtPeace.length <= 0) { return false; }

        const enemy = randomItem(this.otherKingdomsAtPeace);
        this.otherKingdomsAtPeace.splice(this.otherKingdomsAtPeace.indexOf(enemy), 1);

        const newWar = new War(enemy);
        this.warList.push(newWar);

        if (inlineWars) { Kingdom.eventLog.push('War has started with the ' + enemy.name + '!'); }
    }

    EndWar (war) {
        this.warList.splice(this.warList.indexOf(war), 1);
        this.otherKingdomsAtPeace.push(war.opponent);
        if (inlineWars) { Kingdom.eventLog.push('War has ended with the ' + war.opponent.name + ' after ' + war.duration + ' years!'); }
    }

    BuildMonument () {
        const monument = new Monument(randomItem(monumentNameNouns) + ' of ' + this.ruler.name, this.year);
        this.monumentList.push(monument);
        if (inlineDeaths) { Kingdom.eventLog.push('The Soverign has built the great ' + monument.name + '!'); }
    }

    DestroyMonument (monument) {
        this.monumentList.splice(this.monumentList.indexOf(monument), 1);
        const cause = randomItem(monumentDestructionTypes);
        monument.resolution = cause;
        this.destroyedMonumentList.push(monument);
        if (inlineDeaths) { Kingdom.eventLog.push('The ' + monument.name + ' has been destroyed by ' + cause); }
    }

    GreatestHouse () { // returns house with most power
        let bestHouse = this.nobleHouses[0];
        for (let i = 0; i < this.nobleHouses.length; i++) {
            if (this.nobleHouses[i].Might() > bestHouse.Might()) { bestHouse = this.nobleHouses[i]; }
        }
        return bestHouse;
    }

    RegisterDeath (noble) {
        if (noble === this.ruler) {
            this.FindNewRuler();
        }
    }

    FindNewRuler () {
        const greatestHouse = this.GreatestHouse();

        if (this.rulingHouse == null) {
            this.AnointRuler(greatestHouse.leader);
            return;
        }

        if (allowUsurping && greatestHouse !== this.rulingHouse) {
            Kingdom.eventLog.push(greatestHouse.FullName() + ' has usurped ' + this.rulingHouse.FullName() + '!');
            this.AnointRuler(greatestHouse.leader); // used to be MostPowerfulNoble() but that didn't make sense
        } else { this.AnointRuler(this.rulingHouse.leader); }
    }

    AnointRuler (noble) {
        if (this.ruler != null && this.ruler.parent != null && this.ruler.parent === noble.parent) { Kingdom.eventLog[Kingdom.eventLog.length - 1] += (' Thus, their sibling ' + noble.BasicTitle() + ' succeeds them.'); }

        this.ruler = noble;
        this.rulingHouse = noble.nobleHouse;

        this.rulingHouse.leader = this.ruler;
        this.ruler.notable = true;
        this.ruler.prestige += prestigeFromRuler;
        this.ruler.ageAtAscention = this.ruler.age;

        if (this.ruler.female) { this.ruler.title = 'Queen'; } else { this.ruler.title = 'King'; }

        for (let i = 0; i < this.ruler.children.length; i++) {
            const tempChild = this.ruler.children[i];
            if (tempChild.female) { tempChild.title = 'Dutchess'; } else { tempChild.title = 'Duke'; }
            // writeln(tempChild.BasicTitle());
        }

        this.RulerList.push(noble);
        if (inlineAscensions) {
            Kingdom.eventLog.push('All hail ' + this.ruler.FullTitle() + '!');
            if (this.ruler.age < minRulerAge) { Kingdom.eventLog.push('The young soverign is guided by Regent ' + this.rulingHouse.FindRegent().FullTitle()); }
        }

        this.ruler.sobriquet = 'the ' + randomItem(sobriquets);
    }

    DisplayKingdomStats () {
        for (let i = 0; i < this.nobleHouses.length; i++) {
            writeln(this.nobleHouses[i].DisplayStats());
        }
    }

    InterestingFacts () {
        let shortestReign = this.RulerList[0];
        let longestReign = this.RulerList[0];
        let shortReign;
        let longReign;

        for (let i = 0; i < this.RulerList.length; i++) {
            shortReign = shortestReign.age - shortestReign.ageAtAscention;
            longReign = longestReign.age - longestReign.ageAtAscention;
            const tempReign = this.RulerList[i].age - this.RulerList[i].ageAtAscention;
            if (tempReign > longReign) { longestReign = this.RulerList[i]; }
            if (tempReign < shortReign) { shortestReign = this.RulerList[i]; }
        }

        write('The current ruler is ' + this.ruler.TitleBuilder(true, true, true, 8));

        write('<h3>Current Wars</h3>');
        if (this.warList.length === 0) { write('The Kingdom is currently at peace with other kingdoms.'); } else {
            for (let i = 0; i < this.warList.length; i++) {
                const tempWar = this.warList[i];
                writebullet('Have been warring with the ' + tempWar.opponent.name + ' for ' + tempWar.duration + ' years.');
            }
        }

        write('<h3>Noble Houses</h3>');
        for (let i = 0; i < this.nobleHouses.length; i++) {
            writebullet(this.nobleHouses[i].DisplayStats());
        }

        write('<h3>Reign Records</h3>');
        writebullet('The shortest reign was ' + shortReign + ' years by ' + shortestReign.FullTitle());
        writebullet('The longest reign was ' + longReign + ' years by ' + longestReign.FullTitle());

        if (this.monumentList.length === 0) { writeln('No standing monuments'); } else { write('<h3>Standing Monuments</h3>'); }

        for (let i = 0; i < this.monumentList.length; i++) {
            const tempMonument = this.monumentList[i];
            writebullet(tempMonument.name + ' (' + tempMonument.duration + ' years standing)');
        }

        if (this.monumentList.length === 0) { writeln('No Ruins'); } else { write('<h3>Ruins</h3>'); }

        for (let i = 0; i < this.destroyedMonumentList.length; i++) {
            const tempRuin = this.destroyedMonumentList[i];
            writebullet(tempRuin.name + ' (stood ' + tempRuin.duration + ' years until destroyed by ' + tempRuin.resolution + ')');
        }
    }
}

class NobleHouse {
    constructor (name, kingdom) {
        this.name = name;
        this.maxSize = nobleHouseSize;
        this.deadNobles = [];
        this.livingNobles = [];
        this.power = Math.round(Math.random() * initialHousePowerRange);
        this.kingdom = kingdom;
        this.regent = null;

        for (let i = 0; i < this.maxSize; i++) {
            new Noble(null, null, this);
        }

        this.leader = null;
        this.PickNewLeader();
    }

    Might () {
        return this.power + this.leader.prestige;
    }

    FullName () {
        return 'House ' + this.name;
    }

    AdvanceYear () {
        while (this.livingNobles.length < this.maxSize) {
            this.BreedElites();
        }

        for (let i = 0; i < this.livingNobles.length; i++) {
            this.livingNobles[i].AgeUp();
        }

        if (this.leader.age < minRulerAge) {
            if (this.regent == null || !this.regent.alive) { this.regent = this.FindRegent(); }
        } else { this.regent = null; }

        this.power += Math.max(0, ((Math.random() - 0.5) * yearlyHouseJostling));
    }

    BreedElites () {
        const nobles = this.livingNobles;
        const eliteCount = Math.min(nobleHouseSize / 3, nobles.length);
        nobles.sort(comparePrestige);

        if (this.ruler != null && Math.random() / 2 < chanceToHaveChild(nobles[i].female, nobles[i].age)) { this.ruler.HaveChild(); }

        for (let i = 0; i < eliteCount; i++) {
            if (Math.random() < chanceToHaveChild(nobles[i].female, nobles[i].age)) { nobles[i].HaveChild(); }
        }
    }

    RegisterDeath (noble) {
        this.livingNobles.splice(this.livingNobles.indexOf(noble), 1);
        this.deadNobles.push(noble);

        if (noble === this.leader) {
            // Kingdom.eventLog.push("Time to replace " +this.leader.name + " as leader of "+this.FullName());
            this.PickNewLeader();
        }

        kingdom.RegisterDeath(noble);
    }

    PickNewLeader () {
        this.leader = this.NextInLine();
        this.leader.prestige += prestigeFromCount;
        // this.leader.notable = true;

        if (this.leader.title === 'Lord' || this.leader.title === 'Lady') { // time for a promotion!
            if (this.leader.female) { this.leader.title = 'Countess'; } else { this.leader.title = 'Count'; }
        }
    }

    NextInLine () {
        if (this.leader == null) { return this.MostPowerfulNoble(); }

        let candidate = this.leader.OldestLivingChild();
        if (candidate == null) {
            candidate = this.MostPowerfulNoble(); // The most powerful relative within the noble family takes over if there are no children heirs
        }
        return candidate;
    }

    /* SpawnChild() {
        //console.log("Starting Spawn Attempt");
        let parent = null;
        let remainingTries = 50;
        while (parent == null && remainingTries > 0) {
            remainingTries--;
            let parentCandidate = randomItem(this.livingNobles);
            if (parentCandidate.age >= minParentAge && !parentCandidate.hadChildThisYear)
                parent = parentCandidate;
        }

        if (parent != null) {
            parent.HaveChild();
            return true;
        }
        else
            return false;

    } */

    MostPowerfulNoble () { // returns house with most power
        let bestNoble = this.livingNobles[0];
        for (let i = 0; i < this.livingNobles.length; i++) {
            if (this.livingNobles[i].prestige > bestNoble.prestige) { bestNoble = this.livingNobles[i]; }
        }
        return bestNoble;
    }

    DisplayStats () {
        return (this.FullName() +
        (inlinePower ? (', Might ' + Math.round(this.Might())) : '') +
        ', is lead by ' + this.leader.FullTitle() +
        ', whose children are ' + this.leader.ListChildren() +
        (this.regent ? ('. The young ruler is guided by Regent ' + this.regent.FullTitle()) : ''));
    }

    FindRegent () {
        const nobles = this.livingNobles;
        nobles.sort(comparePrestige);
        for (let i = 0; i < nobles.length; i++) {
            if (nobles[i] !== this.leader && nobles[i].age >= minRegentAge) {
                this.regent = nobles[i];

                return this.regent;
            }
        }
    }
}

function comparePrestige (a, b) {
    if (a.prestige < b.prestige) { return 1; } else if (a.prestige > b.prestige) { return -1; } else { return 0; }
}

class Noble {
    constructor (parent, name, nobleHouse) {
        this.name = name;
        this.title = '';
        this.sobriquet = '';

        this.nobleHouse = nobleHouse;
        this.alive = true;
        this.notable = false;
        this.female = Math.random() < 0.5;

        this.parent = parent;
        this.children = [];

        this.age = null;
        this.ageAtAscention = 0;
        this.prestige = null;

        this.hadChildThisYear = false;

        if (name == null) {
            if (this.female) { this.name = randomItem(femaleNames); } else { this.name = randomItem(maleNames); }
        }

        if (this.parent != null) {
            this.age = 0;
            this.prestige = this.parent.prestige * inheritedPrestige;
            if (kingdom.ruler === this.parent) { // set when born, also set when parent ascends
                if (this.female) { this.title = 'Dutchess'; } else { this.title = 'Duke'; }
            }
        } else {
            this.age = Math.round(Math.random() * initialAgeRange);
            this.prestige = nobleHouse.power / 2 + (Math.random() * nobleHouse.power / 2);
        }

        if (this.female) { this.title = 'Lady'; } else { this.title = 'Lord'; }

        this.nobleHouse.livingNobles.push(this);
    }

    HaveChild () {
        const child = new Noble(this, null, this.nobleHouse);
        this.hadChildThisYear = true;
        this.children.push(child);
    }

    OldestLivingChild () {
        let child = null;
        for (let i = 0; i < this.children.length; i++) {
            const candidate = this.children[i];
            if (candidate.alive && (child == null || candidate.age >= child.age)) { child = candidate; }
        }

        if (child == null && this.parent != null) {
            // write("|");
            child = this.parent.OldestLivingChild();
        }

        return child;
    }

    BasicTitle () {
        return this.TitleBuilder(false, false, false, 0);
    }

    FullTitle () {
        return this.TitleBuilder(true, true, true, 1);
    }

    GenelogicalTitle () {
        return this.TitleBuilder(true, true, true, 8);
    }

    ListChildren () {
        let childrenNames = '';

        this.children.forEach(function (element) {
            if (element.alive) { childrenNames += element.name + ' (' + element.age + '), '; }
        }, this);

        if (childrenNames.length <= 0) { return 'none'; }

        return childrenNames.slice(0, -2);
    }

    TitleBuilder (showSobriquet, showHouse, showStats, generations) {
        let output = this.title + ' ' + this.name;

        // if (!this.alive)
        //  output+="(x)";

        if (showSobriquet && this.sobriquet.length > 0) { output += ' ' + this.sobriquet; }

        if (showStats) { output += ' (Age ' + this.age + (inlinePower ? (', Power ' + Math.round(this.prestige)) : '') + ')'; }

        if (showHouse) { output += ' of ' + this.nobleHouse.FullName(); }

        if (generations > 0) {
            if (this.parent == null) { output += ', of noblest blood'; } else if (this.female) { output += ', daughter of ' + this.parent.TitleBuilder(false, false, false, generations - 1); } else { output += ', son of ' + this.parent.TitleBuilder(false, false, false, generations - 1); }
        }

        return output;
    }

    AgeUp () {
        this.age++;
        this.hadChildThisYear = false;
        this.prestige += Math.random() * prestigeGrowthRange;

        if (Math.random() < (yearlyDeathChance + this.age * ageDeathChance)) { this.Die(); }
    }

    Die (deathType) {
        this.alive = false;
        if (deathType == null) { deathType = DeathCause.SelectCause(this).name; }
        if (this.notable && inlineDeaths) {
            Kingdom.eventLog.push(this.FullTitle() + ' has died from ' + deathType + '. Their children are ' + this.ListChildren() + '.');
        }
        this.nobleHouse.RegisterDeath(this);
    }
}

// Output Methods
function write (text) {
    generateOutput += text;
    // document.write(text);
}
function writeln (text) {
    generateOutput += text + '<br>';
    // document.write(text);
    // document.write("<br>");
}

function writebullet (text) {
    generateOutput += '<li>' + text + '</li>';
}

// Generator
// let inlineMonuments = true;
// let inlineWars = true;
// let inlineDeaths = true;
// let inlineAscensions = true;
// let inlinePower = true;
// let KingdomOverviewPeriod = 50; // every x years show the state of the kingdom

function GenerateKingdom () {
    const yearsSimulated = parseInt(document.getElementById('yearsSimulated').value, 10);
    const otherKingdomNames = document.getElementById('otherKingdoms').value.split(',');
    const nobleHouseNames = document.getElementById('nobleHouseNames').value.split(',');
    const maleNames = document.getElementById('maleNames').value.split(',');
    const femaleNames = document.getElementById('femaleNames').value.split(',');
    const allowUsurping = document.getElementById('allowUsurping').checked;
    const inlineMonuments = document.getElementById('inlineMonuments').checked;
    const inlineWars = document.getElementById('inlineWars').checked;
    const inlineDeaths = document.getElementById('inlineDeaths').checked;
    const inlineAscensions = document.getElementById('inlineAscensions').checked;
    const inlinePower = document.getElementById('inlinePower').checked;
    const KingdomOverviewPeriod = parseInt(document.getElementById('nobleReviewPeriod').value, 10);

    kingdom = new Kingdom();

    write('<h2>Yearly Accounts</h2>');

    for (let i = 0; i < yearsSimulated; i++) {
        kingdom.AdvanceYear();
    }

    document.getElementById('GeneratorOutput').innerHTML = generateOutput;
    generateOutput = '';

    write('<h2>Kingdom Summary</h2>');

    kingdom.InterestingFacts();

    document.getElementById('SummaryOutput').innerHTML = generateOutput;
    generateOutput = '';
}
