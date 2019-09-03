class Noble {
    constructor (parent, name, nobleHouse) {
        this.name = name; // Pone el nombre
        this.title = ''; // Titulo vacio
        this.sobriquet = ''; //

        this.nobleHouse = nobleHouse; // Le pasa la casa
        this.alive = true; // Esta vivo
        this.notable = false;
        this.female = Math.random() < 0.5; // si es mujer

        this.parent = parent; // El objeto Noble padre
        this.children = []; // Array de Hijos

        this.age = null; // Edad
        this.ageAtAscention = 0; //
        this.prestige = null; // numero de Prestigio

        this.hadChildThisYear = false; // si tuvo hijos

        if (name == null) { // Genera el nombre si es null
            if (this.female) {
                this.name = randomItem(femaleNames); // Deberia ser una funcion global del helper
            } else {
                this.name = randomItem(maleNames); // Deberia ser una funcion global del helper
            }
        }

        if (this.parent != null) { // Si tiene padre
            this.age = 0;
            this.prestige = this.parent.prestige * inheritedPrestige; // Multiplicador de punto heredado
            if (kingdom.ruler === this.parent) { // kingdom deberia ser un getGlobal
                if (this.female) { // Podria ser una funcion update title
                    this.title = 'Dutchess';
                } else {
                    this.title = 'Duke';
                }
            }
        } else {
            this.age = Math.round(Math.random() * initialAgeRange); // Funcion que da una fecha inicial
            this.prestige = nobleHouse.power / 2 + (Math.random() * nobleHouse.power / 2); // Funcion prestigio inicial
        }

        if (this.female) { // Set inital de titulo
            this.title = 'Lady';
        } else {
            this.title = 'Lord';
        }

        this.nobleHouse.livingNobles.push(this); // arma el array de nobles de la casa
    }

    HaveChild () { // Deliver baby - genera u noble
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

        if (showSobriquet && this.sobriquet.length > 0) {
            output += ' ' + this.sobriquet;
        }

        if (showStats) {
            output += 
            ' (Age ' + this.age + (inlinePower 
                ? (', Power ' + Math.round(this.prestige)) 
                : '') + ')';
        }

        if (showHouse) {
            output += ' of ' + this.nobleHouse.FullName();
        }

        if (generations > 0) {
            if (this.parent == null) {
                output += ', of noblest blood';
            } else if (this.female) {
                output += ', daughter of ' + this.parent.TitleBuilder(false, false, false, generations - 1);
            } else {
                output += ', son of ' + this.parent.TitleBuilder(false, false, false, generations - 1);
            }
        }

        return output;
    }

    AgeUp () { // Envejece
        this.age++;
        this.hadChildThisYear = false;
        this.prestige += Math.random() * prestigeGrowthRange; // Crece por un numero

        if (Math.random() < (yearlyDeathChance + this.age * ageDeathChance)) {
            this.Die();// si se muere
        }
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
