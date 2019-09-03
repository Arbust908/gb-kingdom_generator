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