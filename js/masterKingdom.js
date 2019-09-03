const FEMALE_RATIO = 0.5;
const NAMES = {
    Female: [
        'Lippa',
        'Burwe',
        'Abel',
        'Sidwe',
        'Beornthra',
        'Hilia',
        'Joyce',
        'Eaded',
        'Beatra',
        'Withuia'
    ],
    Male: [
        'Ewis',
        'Eadnoth',
        'Saebertw',
        'Vyncis',
        'Eamald',
        'Vyncent',
        'Enryn',
        'Thenrey',
        'Wulfa',
        'Ealdrerth'
    ]
};
const SURNAME = [
    'Hamor',
    'Badun',
    'Dadun',
    'Weeton'
];
const HOUSE_NAME = [
    { name: 'Sanport' },
    { name: 'Shurvine' },
    { name: 'Grimstrong' },
    { name: 'Nighthall' },
    { name: 'Brewbreed' }
];
const powerGrowthRange = 0.4;
const yearlyDeathChance = 0.1;
const ageDeathChance = 0.1;
const DEBUGING = true;

// *** HELPERS *** //
function randomItem (element) {
    console.log(element);
    return element[Math.floor(Math.random() * element.length)];
}
function rand (max, min = 0) {
    return Math.floor(Math.random() * max) + min;
}
function generateGender () {
    return (Math.random() < FEMALE_RATIO) ? 'Female' : 'Male';
}
function generateHouse () {
    return randomItem(HOUSE_NAME);
}
function generateName (gender) {
    return randomItem(gender === 'Male' ? NAMES.Male : NAMES.Female);
}
function generateSurname (afiliation) {
    return Math.random() < 0.7
        ? afiliation.name
        : randomItem(SURNAME);
}
function debugler (...params) {
    if (DEBUGING) {
        params.forEach((param) => {
            console.log(param);
        });
    }
}

class Character {
    // * Propiedades * //
    // name
    // surname
    // gender
    // race *
    // profession *
    // age
    // power
    // parents (Mother, Father) *
    // children (De grande a chico) *
    // title
    // house/ barony/ afiliation *
    // artifact *
    // isAlive
    // isHero
    // isRuler
    constructor ({ name = null, surname = null, gender = null, race = null, profession = null, age = 0, power = 0, parents = null, children = null, title = null, afiliation = null, artifact = null, isAlive = true, isHero = false, isRuler = false }) {
        this.setGender(gender)
            .setRace(race)
            .setAfiliation(afiliation)
            .setName(name)
            .setParents(parents)
            .setSurname(surname)
            .setChildren(children)
            .setAge(age)
            .setLife(isAlive)
            .setPower(power)
            .setProfession(profession)
            .setTitle(title)
            .becomeRuler(isRuler)
            .becomeHero(isHero)
            .aquireArtifact(artifact);
    }

    // *** SETTERS *** //
    setGender (gender) {
        this.gender = gender == null
            ? generateGender()
            : gender;
        debugler(this.gender);
        return this;
    }

    setRace (race) {
        this.race = 'Human'; // Futuro OBJ Race
        debugler('Raza:_' + this.race);
        return this;
    }

    setAfiliation (afiliation) {
        this.afiliation = afiliation == null
            ? generateHouse()
            : afiliation;
        debugler('Afiliacion:_' + this.afiliation);
        return this;
    }

    setName (name) {
        this.name = name == null
            ? generateName(this.gender)
            : name;
        debugler('Name:_' + this.name);
        return this;
    }

    setParents (parents) {
        if (parents == null) {
            this.parents = null;
            return this;
        }
        this.parents.father = parents[0].gender === 'Male'
            ? parents[0]
            : parents[1];
        this.parents.mother = parents[0].gender === 'Female'
            ? parents[0]
            : parents[1];
        debugler('Padre:_' + this.parents.father, 'Madre:_' + this.parents.mother);
        return this;
    }

    setSurname (surname) {
        if (this.parents !== null) {
            this.surname = this.parents.father != null
                ? this.parents.father.surname
                : this.parents.mother.surname;
        } else {
            this.surname = surname == null
                ? generateSurname(this.afiliation)
                : surname;
        }
        debugler('Apellido:_' + this.surname);
        return this;
    }

    setChildren (children) {
        this.children = children !== null
            ? children
            : null;
        debugler('Hijos:_', this.children);
        return this;
    }

    setAge (age) {
        this.age = age;
        debugler('Edad:_' + this.age);
        return this;
    }

    setLife (isAlive) {
        this.isAlive = isAlive;
        debugler(this.isAlive ? 'Esta Vivo!' : 'Esta Muelto');
        return this;
    }

    setPower (power) {
        this.power = power;
        debugler('Poder:_' + this.power);
        return this;
    }

    setProfession (profession) {
        this.profession = 'Fighter'; // Futuro OBJ Profesion
        debugler('Profesion:_' + this.profession);
        return this;
    }

    setTitle (title) {
        this.title = title;
        debugler('Titulo:_' + this.title);
        return this;
    }

    becomeRuler (isRuler) {
        this.isRuler = isRuler; // Habria que poner año y algo mas
        debugler(isRuler ? 'Es Rey' : 'No es Rey');
        return this;
    }

    becomeHero (isHero) {
        this.isHero = isHero; // Hay que poner que hizo
        debugler(isHero ? 'Es Heroe' : 'No es Heroe');
        return this;
    }

    aquireArtifact (artifact) {
        this.artifact = artifact; // Deberia ser un OBJ
        debugler('Artifact:_' + this.artifact);
        return this;
    }

    // *** GETTER *** //
    getName () {
        return this.name;
    }

    getSurname () {
        return this.surname;
    }

    getGender () {
        return this.gender;
    }

    getRace () {
        return this.race;
    }

    getProfession () {
        return this.profession;
    }

    getAge () {
        return this.age;
    }

    getPower () {
        return this.power;
    }

    getFather () {
        if (this.parents == null) {
            return new Error(this.name + ' has no known Father');
        }
        return this.parents.father;
    }

    getMother () {
        if (this.parents == null) {
            return new Error(this.name + ' has no known Mother');
        }
        return this.parents.mother;
    }

    getChildren () {
        return this.children;
    }

    getTitle () {
        return this.title;
    }

    getAfiliation () {
        return this.afiliation;
    }

    getArtifact () {
        return this.artifact;
    }

    IsAlive () {
        return this.isAlive;
    }

    isHero () {
        return this.isHero;
    }

    isRuler () {
        return this.isRuler;
    }

    // *** HELPERS *** //
    PowerGrowth () {
        return rand(12) * powerGrowthRange;
    }

    AgeUp () {
        const age = this.getAge();
        debugler('Ayer tenian ' + age + ' Años');
        this.setAge(age + 1);
        debugler('Hoy tengo ' + this.getAge());
        // Reputacion
        let power = this.getPower();
        debugler('Tenia ' + this.getPower() + ' puntos');
        power += this.PowerGrowth();
        debugler('Aumenta por ' + power);
        this.setPower(Math.ceil(power));
        debugler('Ahora tengo ' + this.getPower());
        return this;
    }
}
