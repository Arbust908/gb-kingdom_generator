class Character {
    constructor ({
        name = null,
        title = null,
        nobleHouse = null,
        isAlive = true,
        gender = null,
        race = HUMAN,
        profession = assignProfession(),
        parents = [],
        children = [],
        partner = null,
        age = initialAge(),
        ageOfAscention = null,
        power = initialPower(),
        strength = generateStat(),
        dexerity = generateStat(),
        constitution = generateStat(),
        inteligence = generateStat(),
        wisdom = generateStat(),
        charisma = generateStat()
    }) {;
        this._setRace(race)
            ._setGender(gender)
            ._setName(name)
            ._setTitle(title)

            ._setNobleHouse(nobleHouse)

            ._setLife(isAlive)
            ._setProfession(profession)

            ._setParent(parents)
            ._setChildren(children)
            ._setPartner(partner)

            ._setAge(age)
            .ascend(ageOfAscention)
            ._setPower(power)

            ._setSTR(strength)
            ._setDEX(dexerity)
            ._setCON(constitution)
            ._setINT(inteligence)
            ._setWIS(wisdom)
            ._setCHA(charisma)
            ._newBornSetter();
        // La casa tiene que agregarlo
        return this;
    }

    // SETTERS
    _setName (name) {
        if (name !== null) {
            this.name = name;
        } else {
            this.name = this._generateName(this._getGender(), this._getRace());
        }
        return this;
    }

    _setTitle (title) {
        this.title = title;
        return this;
    }

    _setNobleHouse (nobleHouse) {
        if (nobleHouse !== null) {
            this.nobleHouse = nobleHouse;
        } else {
            if (Math.random > 0.8) {
                this.nobleHouse = 'none';
            } else {
                this.nobleHouse = findHouse();
            }
        }
        return this;
    }

    _setLife (isAlive) {
        this.isAlive = isAlive;
        return this;
    }

    _setGender (gender) {
        if (gender !== null) {
            this.gender = gender;
        } else {
            this.gender = (Math.random > this._getRace().femaleRatio) ? 'Female' : 'Male';
        }
        return this;
    }

    _setRace (race) {
        this.race = race;
        return this;
    }

    _setProfession (profession) {
        this.profession = profession;
        return this;
    }

    _setParent (parents) {
        this.parents = parents;
        return this;
    }

    _setChildren (children) {
        this.children = children;
        return this;
    }

    _setPartner (partner) {
        this.partner = partner;
        return this;
    }

    _setAge (age) {
        this.age = age;
        return this;
    }

    _setPower (power) {
        this.power = power * this._getNobleHouse().power;
        return this;
    }

    _setSTR (strength) {
        this.strength = strength;
        return this;
    }

    _setDEX (dexerity) {
        this.dexerity = dexerity;
        return this;
    }

    _setCON (constitution) {
        this.constitution = constitution;
        return this;
    }

    _setINT (inteligence) {
        this.inteligence = inteligence;
        return this;
    }

    _setWIS (wisdom) {
        this.wisdom = wisdom;
        return this;
    }

    _setCHA (charisma) {
        this.charisma = charisma;
        return this;
    }

    // GETTERS
    _getRace () {
        return this.race;
    }

    _getGender () {
        return this.gender;
    }

    _getName () {
        return this.name;
    }

    _getTitle () {
        return this.title;
    }

    _getNobleHouse () {
        return this.nobleHouse;
    }

    _isAlive () {
        return this.isAlive;
    }

    _getProfession () {
        return this.profession;
    }

    _getParent () {
        return this.parents;
    }

    _getChildren () {
        return this.children;
    }

    _getPartner () {
        return this.partner;
    }

    _getAge () {
        return this.age;
    }

    _getPower () {
        return this.power;
    }

    _getSTR () {
        return this.strength;
    }

    _getDEX () {
        return this.dexerity;
    }

    _getCON () {
        return this.constitution;
    }

    _getINT () {
        return this.inteligence;
    }

    _getWIS () {
        return this.wisdom;
    }

    _getCHA () {
        return this.charisma;
    }

    // HELPERS
    ascend (ageOfAscention) {
        this.ageOfAscention = ageOfAscention;
        return this;
    }

    hasAcended () {
        return (this.ageOfAscention < 0 && this.ageOfAscention !== null)
            ? this.ageOfAscention
            : false;
    }

    _generateName (gender, race) {
        const nameAry = race.names[gender];
        return randomItem(nameAry);
    }

    _addPower (num) {
        this.power += num;
        return this;
    }

    _newBornSetter () {
        if (this.parents !== []) {
            this.parents.forEach(parent => {
                this._addPower(parent._getPower());
                if (parent.hasAcended()) {
                    this._setTitle((this._getGender === 'Female' ? 'Lady' : 'Lord'));
                }
            });
        }
        return this;
    }

    haveChild () {
        const child = new Character({ nobleHouse: this._getNobleHouse(), parents: [this, this.partner], age: 0 });
        this.children.push(child);
        // heredar stat
        return this;
    }

    getSuccessor () {
        // Definicion de si la pareja puede ser
        // Definicion de si solo el hijo hombre mayor puede ser
        // Si cualquier hijo mayor puede ser
        // Si es Random
        // minimo de edad
        // el de mas poder
    }

    makeTitle () {
        // Basico
        // Completo
        // Historico
    }

    listChildren () {
        // hijos con Title Basico
    }

    ageUp () {
        // Envegeze
        // chequeo por hijo
        // chequeo si se casa
        // chequeo de muerte
        // random sube stat
        // Crece Prestigio
    }

    die () {
        // Decidir de que o que te pasen porque
        // Comenta porque se murio
        // Se saca de la lista de gente // se pasa a la de muertos
    }

    showMe () {
        console.log(this);
        return this;
    }
}
