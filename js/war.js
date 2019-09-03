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