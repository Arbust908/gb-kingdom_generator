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