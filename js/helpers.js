function randomItem (items) {
    return items[Math.floor(Math.random() * items.length)];
}

function comparePrestige (a, b) {
    if (a.prestige < b.prestige) {
        return 1;
    } else if (a.prestige > b.prestige) {
        return -1;
    } else {
        return 0;
    }
}

// Output Methods
function write (text) {
    generateOutput += text;
}
function writeln (text) {
    generateOutput += text + '<br>';
}

function writebullet (text) {
    generateOutput += '<li>' + text + '</li>';
}

function GenerateKingdom () {
    KingdomOverviewPeriod = parseInt(document.getElementById('nobleReviewPeriod').value, 10);
    yearsSimulated = parseInt(document.getElementById('yearsSimulated').value, 10);
    otherKingdomNames = document.getElementById('otherKingdoms').value.split(',');
    nobleHouseNames = document.getElementById('nobleHouseNames').value.split(',');
    inlineAscensions = document.getElementById('inlineAscensions').checked;
    femaleNames = document.getElementById('femaleNames').value.split(',');
    inlineMonuments = document.getElementById('inlineMonuments').checked;
    maleNames = document.getElementById('maleNames').value.split(',');
    allowUsurping = document.getElementById('allowUsurping').checked;
    inlineDeaths = document.getElementById('inlineDeaths').checked;
    inlinePower = document.getElementById('inlinePower').checked;
    inlineWars = document.getElementById('inlineWars').checked;

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
