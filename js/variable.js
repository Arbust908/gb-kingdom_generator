// Universal Registers
let kingdom = null;
let generateOutput = '';

// Data
let nobleHouseNames = [];
let deathTypes = ['natural causes', 'assassination', 'old age', 'poisoning', 'gout', 'senility', 'battlefield wounds'];
let maleNames = [];
let femaleNames = [];
let sobriquets = ['Bold', 'Pious', 'Terrible', 'Wise', 'Clever', 'Builder', 'Sage', 'Warlord', 'Valiant', 'Merciless', 'Cruel', 'Good', 'Bad', 'Bald', 'Logician', 'Farmer', 'Mirthful', 'Restless', 'Pillager', 'Butcher', 'Dragon', 'Poet', 'Reformer', 'Philosopher'];

let monumentNameNouns = ['Castle', 'Citadel', 'Tower', 'Shrine', 'Fortress', 'Monument', 'Wall', 'Statue', 'Arch', 'Temple', 'Lighthouse', 'Colossus', 'Gardens', 'Library', 'Palace', 'College', 'Observatory'];
let monumentDestructionTypes = ['fire', 'storm', 'earthquake', 'lightning', 'witchcraft', 'blight', 'sabotage', 'uprising', 'arson', 'design flaw', 'warfare', 'crumbling', 'toppling', 'mysterious forces', 'the Sovereign'];

let otherKingdomNames = ['Austaria', 'Griggledorn', 'Carthal', 'Tortestra'];
let governmentTypes = ['Kingdom', 'Kingdom', 'Kingdom', 'Kingdom', 'Kingdom', 'Empire', 'Republic', 'City', 'Confederation', 'Mageocracy', 'Holy Order', 'Horde', 'Council', 'Bank'];

// Constants
let yearsSimulated = 3000;
let nobleHouseSize = 1000;

let initialAgeRange = 60;
let maxReignTime = 50; // not yet used
let minAscendAge = 10; // not yet used
let AscendAgeRange = 20; // not yet used
let chanceRegimeChange = .1;
let femaleRulerChance = 0.5; // not used
let yearlyDeathChance = 0.04;
let ageDeathChance = 0.001;
let minParentAge = 13;
let minRulerAge = 12;
let minRegentAge = 20;

// Prestige & Power
let initialHousePowerRange = 10; // ranges from 0 to this. Higher it is, more spread out the noble houses are in power at start, generally
let yearlyHouseJostling = 1;
let prestigeGrowthRange = 0.3; // more of this, more prestige gained each year, and more likely a death will lead to usurping
let prestigeFromCount = 1;
let prestigeFromRuler = 3;
let inheritedPrestige = 0.75; // how much prestige you get from your primary parent - lower means usurping is more likely
let yearlyUsurpAttempt = 0.1; // if a ruler's house has less might, there is a chance each year of being deposed
let allowUsurping = true;

// Event Constants
let monumentChance = 0.02;
let warStartChance = 0.02;
let warEndChance = 0.1;
let monumentDestructionChance = 0.002;

// Generator
let inlineMonuments = true;
let inlineWars = true;
let inlineDeaths = true;
let inlineAscensions = true;
let inlinePower = true;
let KingdomOverviewPeriod = 50; // every x years show the state of the kingdom