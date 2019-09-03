"use strict"

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

//Data Methods
function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

//Universal Registers
var kingdom = null;
var generateOutput = "";

//Data
var nobleHouseNames = []
//var deathTypes = ["natural causes", "assassination", "old age", "poisoning", "gout", "senility", "battlefield wounds"];
var maleNames = [];
var femaleNames = []
var sobriquets = ["Bold", "Pious", "Terrible", "Wise", "Clever", "Builder", "Sage", "Warlord", "Valiant", "Merciless", "Cruel", "Good", "Bad", "Bald", "Logician", "Farmer", "Mirthful", "Restless", "Pillager", "Butcher", "Dragon", "Poet", "Reformer", "Philosopher"]

var monumentNameNouns = ["Castle", "Citadel", "Tower", "Shrine", "Fortress", "Monument", "Wall", "Statue", "Arch", "Temple", "Lighthouse", "Colossus", "Gardens", "Library", "Palace", "College", "Observatory"]
var monumentDestructionTypes = ["fire", "storm", "earthquake", "lightning", "witchcraft", "blight", "sabotage", "uprising", "arson", "design flaw", "warfare", "crumbling", "toppling", "mysterious forces", "the Sovereign"]

var otherKingdomNames = ["Austaria", "Griggledorn", "Carthal", "Tortestra"]
var governmentTypes = ["Kingdom", "Kingdom", "Kingdom", "Kingdom", "Kingdom", "Empire", "Republic", "City", "Confederation", "Mageocracy", "Holy Order", "Horde", "Council", "Bank"]


//Constants
var yearsSimulated = 3000;
var nobleHouseSize = 1000;

var initialAgeRange = 60;
//var maxReignTime = 50; //not yet used
//var minAscendAge = 10; //not yet used
//var AscendAgeRange = 20; //not yet used
//var chanceRegimeChange = .1;
var femaleRulerChance = .5;
var yearlyDeathChance = .04;
var ageDeathChance = .001;
var minParentAge = 13;
var minRulerAge = 12;
var minRegentAge = 20;

//Prestige & Power
var initialHousePowerRange = 10; //ranges from 0 to this. Higher it is, more spread out the noble houses are in power at start, generally
var yearlyHouseJostling = 1;
var prestigeGrowthRange = .3; //more of this, more prestige gained each year, and more likely a death will lead to usurping
var prestigeFromCount = 1;
var prestigeFromRuler = 3;
var inheritedPrestige = .75; //how much prestige you get from your primary parent - lower means usurping is more likely
var yearlyUsurpAttempt = .1; //if a ruler's house has less might, there is a chance each year of being deposed
var allowUsurping = true;

//Event Constants
var monumentChance = .02;
var warStartChance = .02;
var warEndChance = .1;
var monumentDestructionChance = .002;



function chanceToHaveChild(female, age) {
    if (age < minParentAge)
        return 0;

    if (female)
        return .30 - (age * .005)

    return .25
}



class DeathCause {
    constructor(name, minAge, maxAge) {
        if (DeathCause.All == null)
            DeathCause.All = new Array();
        else
            DeathCause.All.push(this);
        this.name = name;
        this.minAge = minAge;
        this.maxAge = maxAge;
    }

    static SelectCause(deceased) {
        var applicableCauses = new Array();
        for (var i = 0; i < DeathCause.All.length; i++) {
            var acceptable = true;
            if (deceased.age < DeathCause.All[i].minAge || deceased.age > DeathCause.All[i].maxAge)
                acceptable = false;
            if (acceptable)
                applicableCauses.push(DeathCause.All[i]);
        }
        return randomItem(applicableCauses);
    }
}

new DeathCause("disease", 0, 200);
new DeathCause("natural causes", 0, 200);
new DeathCause("plague", 0, 200);
new DeathCause("assassination", 0, 200);
new DeathCause("old age", 50, 200);
new DeathCause("poisoning", 0, 200);
new DeathCause("gout", 0, 200);
new DeathCause("senility", 50, 200);
new DeathCause("battlefield wounds", 10, 200);


class Monument {
    constructor(name, buildYear) {
        this.name = name;
        this.yearBuilt = buildYear;
        this.duration = 0;
        this.resolution = "";
    }
    AdvanceYear() {
        this.duration++;
    }
}

class War {
    constructor(opponent) {
        this.opponent = opponent;
        this.duration = 0;
        //this.chanceToEnd = .05;
    }
    AdvanceYear() {
        this.duration++;
    }
}

class OtherKingdom {
    constructor(name) {
        this.name = name;
    }
}

class Kingdom {
    constructor() {
        this.nobleHouses = new Array();
        this.RulerList = new Array();
        this.monumentList = new Array();
        this.destroyedMonumentList = new Array();
        this.religionList = new Array();
        this.warList = new Array();
        this.periodList = new Array();
        this.otherKingdoms = new Array();
        this.otherKingdomsAtPeace = new Array();

        Kingdom.eventLog = new Array();
        for (var i = 0; i < nobleHouseNames.length; i++) {
            this.nobleHouses.push(new NobleHouse(nobleHouseNames[i], this));
        }

        for (var i = 0; i < otherKingdomNames.length; i++) {
            var tempKingdom = new OtherKingdom(randomItem(governmentTypes) + " of " + otherKingdomNames[i]);
            this.otherKingdoms.push(tempKingdom);
            this.otherKingdomsAtPeace.push(tempKingdom);
        }

        this.year = 0;

        this.rulingHouse = null;
        this.ruler = null;
        this.FindNewRuler();

    }

    AdvanceYear() {
        this.year++;

        for (var i = 0; i < this.nobleHouses.length; i++) {
            this.nobleHouses[i].AdvanceYear();
        }

        for (var i = 0; i < this.warList.length; i++) {
            this.warList[i].AdvanceYear();
        }

        for (var i = 0; i < this.monumentList.length; i++) {
            this.monumentList[i].AdvanceYear();
        }

        for (var i = 0; i < this.monumentList.length; i++) {
            if (Math.random() < monumentDestructionChance)
                this.DestroyMonument(this.monumentList[i]);
        }

        if (allowUsurping && this.GreatestHouse() != this.rulingHouse) {
            if (Math.random() < yearlyUsurpAttempt)
                this.ruler.Die("violent overthrow");
        }

        if (Kingdom.eventLog.length > 0) {
            write("<h4>Year " + this.year + "</h4>");
            Kingdom.eventLog.reverse();

            while (Kingdom.eventLog.length > 0) {
                writebullet(Kingdom.eventLog.pop());
            }
        }

        if (Math.random() < monumentChance)
            this.BuildMonument();

        if (Math.random() < warStartChance)
            this.StartWar();




        if (Math.random() < warEndChance && this.warList.length > 0)
            this.EndWar(randomItem(this.warList));

        if (this.year % KingdomOverviewPeriod == 0) {
            write("<h3>Year " + this.year + " Review</h3>");
            this.DisplayKingdomStats();
            write("<h3></h3>");
        }

    }

    StartWar() {

        if (this.otherKingdomsAtPeace.length <= 0)
            return false;

        var enemy = randomItem(this.otherKingdomsAtPeace);
        this.otherKingdomsAtPeace.splice(this.otherKingdomsAtPeace.indexOf(enemy), 1);


        var newWar = new War(enemy);
        this.warList.push(newWar);

        if (inlineWars)
            Kingdom.eventLog.push("War has started with the " + enemy.name + "!");
    }

    EndWar(war) {

        this.warList.splice(this.warList.indexOf(war), 1);
        this.otherKingdomsAtPeace.push(war.opponent);
        if (inlineWars)
            Kingdom.eventLog.push("War has ended with the " + war.opponent.name + " after " + war.duration + " years!");

    }

    BuildMonument() {
        var monument = new Monument(randomItem(monumentNameNouns) + " of " + this.ruler.name, this.year);
        this.monumentList.push(monument);
        if (inlineDeaths)
            Kingdom.eventLog.push("The Soverign has built the great " + monument.name + "!");
    }

    DestroyMonument(monument) {
        this.monumentList.splice(this.monumentList.indexOf(monument), 1);
        var cause = randomItem(monumentDestructionTypes);
        monument.resolution = cause;
        this.destroyedMonumentList.push(monument);
        if (inlineDeaths)
            Kingdom.eventLog.push("The " + monument.name + " has been destroyed by " + cause);

    }

    GreatestHouse() //returns house with most power
    {
        var bestHouse = this.nobleHouses[0];
        for (var i = 0; i < this.nobleHouses.length; i++) {
            if (this.nobleHouses[i].Might() > bestHouse.Might())
                bestHouse = this.nobleHouses[i];
        }
        return bestHouse;
    }

    RegisterDeath(noble) {
        if (noble == this.ruler) {
            this.FindNewRuler();
        }
    }

    FindNewRuler() {
        var greatestHouse = this.GreatestHouse();

        if (this.rulingHouse == null) {
            this.AnointRuler(greatestHouse.leader);
            return;
        }

        if (allowUsurping && greatestHouse != this.rulingHouse) {
            Kingdom.eventLog.push(greatestHouse.FullName() + " has usurped " + this.rulingHouse.FullName() + "!");
            this.AnointRuler(greatestHouse.leader); //used to be MostPowerfulNoble() but that didn't make sense
        }
        else
            this.AnointRuler(this.rulingHouse.leader);
    }

    AnointRuler(noble) {


        if (this.ruler != null && this.ruler.parent != null && this.ruler.parent == noble.parent)
            Kingdom.eventLog[Kingdom.eventLog.length - 1] += (" Thus, their sibling " + noble.BasicTitle() + " succeeds them.");

        this.ruler = noble;
        this.rulingHouse = noble.nobleHouse;


        this.rulingHouse.leader = this.ruler;
        this.ruler.notable = true;
        this.ruler.prestige += prestigeFromRuler;
        this.ruler.ageAtAscention = this.ruler.age;



        if (this.ruler.female)
            this.ruler.title = "Queen";
        else
            this.ruler.title = "King";



        for (var i = 0; i < this.ruler.children.length; i++) {
            var tempChild = this.ruler.children[i];
            if (tempChild.female)
                tempChild.title = "Dutchess";
            else
                tempChild.title = "Duke";
            // writeln(tempChild.BasicTitle());
        }


        this.RulerList.push(noble);
        if (inlineAscensions) {
            Kingdom.eventLog.push("All hail " + this.ruler.FullTitle() + "!");
            if (this.ruler.age < minRulerAge)
                Kingdom.eventLog.push("The young soverign is guided by Regent " + this.rulingHouse.FindRegent().FullTitle());

        }

        this.ruler.sobriquet = "the " + randomItem(sobriquets);

    }

    DisplayKingdomStats() {
        for (var i = 0; i < this.nobleHouses.length; i++) {
            writeln(this.nobleHouses[i].DisplayStats());
        }
    }

    InterestingFacts() {
        var shortestReign = this.RulerList[0];
        var longestReign = this.RulerList[0];
        var shortReign;
        var longReign;

        for (var i = 0; i < this.RulerList.length; i++) {
            shortReign = shortestReign.age - shortestReign.ageAtAscention;
            longReign = longestReign.age - longestReign.ageAtAscention;
            var tempReign = this.RulerList[i].age - this.RulerList[i].ageAtAscention;
            if (tempReign > longReign)
                longestReign = this.RulerList[i];
            if (tempReign < shortReign)
                shortestReign = this.RulerList[i];
        }

        write("The current ruler is " + this.ruler.TitleBuilder(true, true, true, 8));

        write("<h3>Current Wars</h3>");
        if (this.warList.length == 0)
            write("The Kingdom is currently at peace with other kingdoms.");
        else
            for (var i = 0; i < this.warList.length; i++) {
                var tempWar = this.warList[i];
                writebullet("Have been warring with the " + tempWar.opponent.name + " for " + tempWar.duration + " years.");
            }

        write("<h3>Noble Houses</h3>")
        for (var i = 0; i < this.nobleHouses.length; i++) {
            writebullet(this.nobleHouses[i].DisplayStats());
        }

        write("<h3>Reign Records</h3>");
        writebullet("The shortest reign was " + shortReign + " years by " + shortestReign.FullTitle());
        writebullet("The longest reign was " + longReign + " years by " + longestReign.FullTitle());


        if (this.monumentList.length == 0)
            writeln("No standing monuments");
        else
            write("<h3>Standing Monuments</h3>");

        for (var i = 0; i < this.monumentList.length; i++) {
            var tempMonument = this.monumentList[i];
            writebullet(tempMonument.name + " (" + tempMonument.duration + " years standing)");
        }

        if (this.monumentList.length == 0)
            writeln("No Ruins");
        else
            write("<h3>Ruins</h3>");

        for (var i = 0; i < this.destroyedMonumentList.length; i++) {
            var tempRuin = this.destroyedMonumentList[i];
            writebullet(tempRuin.name + " (stood " + tempRuin.duration + " years until destroyed by " + tempRuin.resolution + ")");
        }


    }

}

class NobleHouse {
    constructor(name, kingdom) {
        this.name = name;
        this.maxSize = nobleHouseSize;
        this.deadNobles = [];
        this.livingNobles = [];
        this.power = Math.round(Math.random() * initialHousePowerRange);
        this.kingdom = kingdom;
        this.regent = null;

        for (var i = 0; i < this.maxSize; i++) {
            new Noble(null, null, this);
        }

        this.leader = null;
        this.PickNewLeader();
    }

    Might() {
        return this.power + this.leader.prestige;
    }

    FullName() {
        return "House " + this.name;
    }

    AdvanceYear() {
        while (this.livingNobles.length < this.maxSize) {
            this.BreedElites();
        }

        for (var i = 0; i < this.livingNobles.length; i++) {
            this.livingNobles[i].AgeUp();
        }

        if (this.leader.age < minRulerAge) {
            if (this.regent == null || !this.regent.alive)
                this.regent = this.FindRegent();
        }
        else
            this.regent = null;

        this.power += Math.max(0, ((Math.random() - .5) * yearlyHouseJostling));
    }

    BreedElites() {
        var nobles = this.livingNobles;
        var eliteCount = Math.min(nobleHouseSize / 3, nobles.length);
        nobles.sort(comparePrestige);

        if (this.ruler != null && Math.random() / 2 < chanceToHaveChild(nobles[i].female, nobles[i].age))
            this.ruler.HaveChild();

        for (var i = 0; i < eliteCount; i++) {
            if (Math.random() < chanceToHaveChild(nobles[i].female, nobles[i].age))
                nobles[i].HaveChild();
        }
    }

    RegisterDeath(noble) {
        this.livingNobles.splice(this.livingNobles.indexOf(noble), 1);
        this.deadNobles.push(noble);

        if (noble == this.leader) {
            //Kingdom.eventLog.push("Time to replace " +this.leader.name + " as leader of "+this.FullName());
            this.PickNewLeader();
        }

        kingdom.RegisterDeath(noble);
    }

    PickNewLeader() {
        this.leader = this.NextInLine();
        this.leader.prestige += prestigeFromCount;
        //this.leader.notable = true;

        if (this.leader.title == "Lord" || this.leader.title == "Lady") { //time for a promotion!
            if (this.leader.female)
                this.leader.title = "Countess";
            else
                this.leader.title = "Count";
        }
    }

    NextInLine() {
        if (this.leader == null)
            return this.MostPowerfulNoble();

        var candidate = this.leader.OldestLivingChild();
        if (candidate == null) {
            candidate = this.MostPowerfulNoble(); //The most powerful relative within the noble family takes over if there are no children heirs
        }
        return candidate;
    }

    /*SpawnChild() {
        //console.log("Starting Spawn Attempt");
        var parent = null;
        var remainingTries = 50;
        while (parent == null && remainingTries > 0) {
            remainingTries--;
            var parentCandidate = randomItem(this.livingNobles);
            if (parentCandidate.age >= minParentAge && !parentCandidate.hadChildThisYear)
                parent = parentCandidate;
        }

        if (parent != null) {
            parent.HaveChild();
            return true;
        }
        else
            return false;

    }*/

    MostPowerfulNoble() //returns house with most power
    {
        var bestNoble = this.livingNobles[0];
        for (var i = 0; i < this.livingNobles.length; i++) {
            if (this.livingNobles[i].prestige > bestNoble.prestige)
                bestNoble = this.livingNobles[i];
        }
        return bestNoble;
    }

    DisplayStats() {
        return (this.FullName() + 
        (inlinePower ? (", Might " + Math.round(this.Might())) : "" )  + 
        ", is lead by " + this.leader.FullTitle() +
        ", whose children are " + this.leader.ListChildren() + 
        (this.regent ? (". The young ruler is guided by Regent " + this.regent.FullTitle()) : "" ));
    }



    FindRegent() {
        var nobles = this.livingNobles;
        nobles.sort(comparePrestige);
        for (var i = 0; i < nobles.length; i++) {
            if (nobles[i] != this.leader && nobles[i].age >= minRegentAge) {
                this.regent = nobles[i];



                return this.regent;
            }

        }
    }


}

function comparePrestige(a, b) {
    if (a.prestige < b.prestige)
        return 1;
    else if (a.prestige > b.prestige)
        return -1;
    else
        return 0;
}

class Noble {
    constructor(parent, name, nobleHouse) {
        this.name = name;
        this.title = "";
        this.sobriquet = "";

        this.nobleHouse = nobleHouse;
        this.alive = true;
        this.notable = false;
        this.female = Math.random() < .5;

        this.parent = parent;
        this.children = [];

        this.age = null;
        this.ageAtAscention = 0;
        this.prestige = null;

        this.hadChildThisYear = false;

        if (name == null) {
            if (this.female)
                this.name = randomItem(femaleNames);
            else
                this.name = randomItem(maleNames);
        }

        if (this.parent != null) {
            this.age = 0;
            this.prestige = this.parent.prestige * inheritedPrestige;
            if (kingdom.ruler == this.parent) { //set when born, also set when parent ascends
                if (this.female)
                    this.title = "Dutchess";
                else
                    this.title = "Duke";
            }
        }
        else {
            this.age = Math.round(Math.random() * initialAgeRange);
            this.prestige = nobleHouse.power / 2 + (Math.random() * nobleHouse.power / 2);
        }

        if (this.female)
            this.title = "Lady";
        else
            this.title = "Lord";

        this.nobleHouse.livingNobles.push(this);
    }

    HaveChild() {
        var child = new Noble(this, null, this.nobleHouse);
        this.hadChildThisYear = true;
        this.children.push(child);
    }

    OldestLivingChild() {
        var child = null;
        for (var i = 0; i < this.children.length; i++) {
            var candidate = this.children[i];
            if (candidate.alive && (child == null || candidate.age >= child.age))
                child = candidate;
        }

        if (child == null && this.parent != null) {
            //write("|");
            child = this.parent.OldestLivingChild();

        }

        return child;
    }


    BasicTitle() {
        return this.TitleBuilder(false, false, false, 0);
    }
    FullTitle() {
        return this.TitleBuilder(true, true, true, 1);
    }

    GenelogicalTitle() {
        return this.TitleBuilder(true, true, true, 8);
    }

    ListChildren() {

        var childrenNames = "";

        this.children.forEach(function(element) {
            if (element.alive)
                childrenNames += element.name + " (" + element.age + "), ";

        }, this);

        if (childrenNames.length <= 0)
            return "none";

        return childrenNames.slice(0, -2);

    }

    TitleBuilder(showSobriquet, showHouse, showStats, generations) {
        var output = this.title + " " + this.name;

        //if (!this.alive)
        //  output+="(x)";

        if (showSobriquet && this.sobriquet.length > 0)
            output += " " + this.sobriquet;



        if (showStats)
            output += " (Age " + this.age + (inlinePower ? (", Power " + Math.round(this.prestige)) : "") + ")";

        if (showHouse)
            output += " of " + this.nobleHouse.FullName();

        if (generations > 0) {
            if (this.parent == null)
                output += ", of noblest blood";
            else if (this.female)
                output += ", daughter of " + this.parent.TitleBuilder(false, false, false, generations - 1);
            else
                output += ", son of " + this.parent.TitleBuilder(false, false, false, generations - 1);

        }


        return output;
    }

    AgeUp() {
        this.age++;
        this.hadChildThisYear = false;
        this.prestige += Math.random() * prestigeGrowthRange;



        if (Math.random() < (yearlyDeathChance + this.age * ageDeathChance))
            this.Die();
    }

    Die(deathType) {
        this.alive = false;
        if (deathType == null)
            deathType = DeathCause.SelectCause(this).name;
        if (this.notable && inlineDeaths) {
            Kingdom.eventLog.push(this.FullTitle() + " has died from " + deathType + ". Their children are " + this.ListChildren() + ".");
        }
        this.nobleHouse.RegisterDeath(this);
    }
}








//Output Methods
function write(text) {
    generateOutput += text;
    //document.write(text);
}
function writeln(text) {
    generateOutput += text + "<br>";
    //document.write(text);
    //document.write("<br>");
}

function writebullet(text) {
    generateOutput += "<li>" + text + "</li>";
}



//Generator
var inlineMonuments = true;
var inlineWars = true;
var inlineDeaths = true;
var inlineAscensions = true;
var inlinePower = true;
var KingdomOverviewPeriod = 50; //every x years show the state of the kingdom

function GenerateKingdom() {
    yearsSimulated = parseInt(document.getElementById("yearsSimulated").value, 10);
    otherKingdomNames = document.getElementById("otherKingdoms").value.split(",");
    nobleHouseNames = document.getElementById("nobleHouseNames").value.split(",");
    maleNames = document.getElementById("maleNames").value.split(",");
    femaleNames = document.getElementById("femaleNames").value.split(",");
    allowUsurping = document.getElementById("allowUsurping").checked;
    inlineMonuments = document.getElementById("inlineMonuments").checked;
    inlineWars = document.getElementById("inlineWars").checked;
    inlineDeaths = document.getElementById("inlineDeaths").checked;
    inlineAscensions = document.getElementById("inlineAscensions").checked;
    inlinePower = document.getElementById("inlinePower").checked;
    KingdomOverviewPeriod = parseInt(document.getElementById("nobleReviewPeriod").value, 10);

    kingdom = new Kingdom();


    write("<h2>Yearly Accounts</h2>");

    for (var i = 0; i < yearsSimulated; i++) {
        kingdom.AdvanceYear();
    }

    document.getElementById('GeneratorOutput').innerHTML = generateOutput;
    generateOutput = "";


    write("<h2>Kingdom Summary</h2>");

    kingdom.InterestingFacts();

    document.getElementById('SummaryOutput').innerHTML = generateOutput;
    generateOutput = "";


}