// CONSTANTES
const MAX_AGE = 100;

const ADUKEN = { name: 'Aduken', power: 10, symbol: 'Hammer', color: 'hsla(306, 100%, 25%, 1)' };
const HUMAN = { name: 'Human', femaleRatio: 0.5, statMod: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 }, names: { Female: ['Aelia','Antonina','Augustina','Caecilia','Caelina','Decima','Domitia','Fabricia','Faustina','Flaviana','Floriana','Fulvia','Gratiana','Hilaria','Iulia','Julia','Junia','Liviana','Longina','Lucia','Lucilia','Paula','Pomponi','Porcia','Priscilla','Rufina','Sabina','Tacita','Tatiana','Tullia','Valentina','Valeria','Virginia','Aeliana','Aemilia','Agrippina','Aurelia','Balbina','Blandina','Cassia','Cloelia','Cornelia','Drusa','Fabia','Fabiola','Germana','Herminia','Hortensia','Iuliana','Iunia','Juliana','Laurentia','Luciana','Lucretia','Marcella','Marina','Maximiliana','Octavia','Paulina','Petronia','Valeriana','Varinia','Vita','Aemiliana','Albina','Antonia','Aquilina','Augusta','Aureliana','Caelia','Camilla','Claudia','Domitilla','Drusilla','Fabiana','Fausta','Flavia','Hadriana','Horatia','Laelia','Laurentina','Lucilla','Marcellina','Marcia','Mariana','Martina','Maxima','Prisca','Quintina','Saturnina','Septima','Severina','Titiana','Verginia','Vibiana'], Male: ['Aelius','Aemilianus','Agrippa','Albinus','Appius','Aquilinus','Aulus','Aurelianus','Avitus','Balbus','Blandus','Caesar','Camillus','Cassianus','Celsus','Claudius','Cnaeus','Crispinus','Domitius','Drusus','Ennius','Fabianus','Felix','Gallus','Glaucia','Hadrianus','Horatius','Ianuarius','Iulius','Iuvenalis','Laelius','Laurentinus','Lucius','Manlius','Marcellinus','Marcius','Marianus','Marius','Martinus','Maximianus','Maximinus','Nonus','Octavius','Paulus','Plinius','Quintilianus','Quintinus','Saturninus','Secundus','Septimius','Servius','Severinus','Sextus','Terentius','Tiberius','Titianus','Valerius','Varius','Verginius','Vibianus','Aemilius','Albanus','Albus','Antoninus','Aquila','Atilius','Augustinus','Aurelius','Blasius','Caecilius','Caelinus','Caius','Cassius','Cicero','Crispus','Decimus','Domitianus','Duilius','Fabricius','Faustinus','Festus','Flavianus','Florianus','Fulvius','Gnaeus','Gratianus','Hilarius','Iovianus','Januarius','Junius','Laurentius','Livianus','Longinus','Lucilius','Marcellus','Marcus','Martialis','Maxentius','Maximus','Nerva','Otho','Pompeius','Pomponius','Porcius','Priscus','Quintillus','Quintus','Rufinus','Sabinus','Scaevola','Seneca','Septimus','Severianus','Severus','Silvanus','Tacitus','Tatianus','Tertius','Tiburtius','Titus','Tullius','Valentinianus','Vergilius','Vespasianus','Vibius','Aelianus','Aetius','Ahenobarbus','Antonius','Augustus','Avilius','Balbinus','Blandinus','Brutus','Caelius','Cassian','Cloelius','Cornelius','Cyprianus','Diocletianus','Egnatius','Fabius','Faustus','Flavius','Florus','Gaius','Germanus','Gordianus','Herminius','Hortensius','Iovita','Iulianus','Iunius','Jovian','Julius','Livius','Lucanus','Lucianus','Lucretius','Marinus','Maximilianus','Naevius','Octavianus','Ovidius','Paulinus','Petronius','Pompilius','Pontius','Publius','Regulus','Rufus','Secundinus','Sergius','Sextilius','Spurius','Tarquinius','Tatius','Thracius','Traianus','Valens','Valentinus','Valerianus','Varinius','Vinicius','Vitus'] } };
const WARRIOR = { name: 'Warrior', powerMod: 1.2 };

// HELPERS
const rand = (max, min = 0) => {
    return Math.floor(Math.random() * max) + min;
};

const initialPower = () => {
    return rand(10);
};

const initialAge = () => {
    return rand(MAX_AGE);
};

const findHouse = () => {
    return ADUKEN;
};

const assignProfession = () => {
    return WARRIOR;
};

const rollStat = () => {
    return rand(18, 3);
};

const statToBonus = (stat) => {
    return Math.floor((stat - 10) / 2);
};

const generateStat = () => {
    const stadistic = rollStat();
    return { stat: stadistic, bonus: statToBonus(stadistic) };
};

// END HELPERS
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