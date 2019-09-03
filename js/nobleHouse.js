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
            if (this.regent == null || !this.regent.alive) {
                this.regent = this.FindRegent();
            }
        } else {
            this.regent = null;
        }

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