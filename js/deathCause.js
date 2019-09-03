class DeathCause {
    constructor (name, minAge, maxAge) {
        this.name = name;
        this.minAge = minAge;
        this.maxAge = maxAge;
    }

    isApplicable () {
        if (false) {
            return this;
        }
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