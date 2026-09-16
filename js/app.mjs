import { ANCESTRIES, ATTRIBUTES, DEFAULT_WEIGHTS, PROFESSIONS } from './simulation/data.mjs';
import { resolveConfig } from './simulation/config.mjs';
import { indexFamilies } from './family.mjs';
import { icon, setIconLabel } from './icons.mjs';

const byId = id => document.getElementById(id);
const form = byId('generation-form');
const field = name => form.elements.namedItem(name);
const format = number => number.toLocaleString();
const capitalize = text => text[0].toUpperCase() + text.slice(1);
const personName = person => `${person.name} of House ${person.house}`;
const PAGE_SIZE = 100;
const EVENT_ICONS = {
    founded: 'castle-turret', arrival: 'user', accession: 'crown', 'house-leader': 'flag',
    regency: 'shield-check', 'regency-ended': 'crown', majority: 'user', union: 'heart',
    birth: 'baby', achievement: 'trophy', level: 'trend-up', death: 'skull',
    survived: 'shield-check', 'war-start': 'sword', 'war-end': 'flag',
    monument: 'castle-turret', 'monument-lost': 'warning-circle'
};
let worker = null;
let activeRun = null;
let frame = null;
let history = [];
let result = null;
let historyEnd = 0;
let currentYear = 0;

function element(tag, text, className, iconName) {
    const node = document.createElement(tag);
    if (text !== undefined) { node.textContent = text; }
    if (className) { node.className = className; }
    if (iconName) { node.prepend(icon(iconName)); }
    return node;
}

for (const node of document.querySelectorAll('[data-icon]')) {
    const glyph = icon(node.dataset.icon);
    if (node.dataset.iconPosition === 'end') {
        glyph.classList.add('icon-trailing');
        node.append(glyph);
    } else {
        node.prepend(glyph);
    }
}

for (const [key, ancestry] of Object.entries(ANCESTRIES)) {
    const option = element('option', ancestry.name);
    option.value = key;
    field('monarchAncestry').append(option);
    const row = element('div', undefined, 'ancestry-row');
    const label = element('label', ancestry.name);
    label.htmlFor = `weight-${key}`;
    label.append(element('span', `Adult ${ancestry.maturity} · lifespan ~${ancestry.lifespan}`, 'hint'));
    const input = element('input');
    Object.assign(input, { id: `weight-${key}`, name: `weight-${key}`, type: 'number', min: '0', max: '100', step: '1', defaultValue: String(DEFAULT_WEIGHTS[key]), required: true });
    row.append(label, input);
    byId('ancestry-inputs').append(row);
}
for (const [key, profession] of Object.entries(PROFESSIONS)) {
    const option = element('option', profession.name);
    option.value = key;
    field('monarchProfession').append(option);
}
for (const attribute of ATTRIBUTES) {
    const container = element('div');
    const label = element('label', capitalize(attribute));
    label.htmlFor = `attribute-${attribute}`;
    const input = element('input');
    Object.assign(input, { id: `attribute-${attribute}`, name: `attribute-${attribute}`, type: 'number', min: '3', max: '20', step: '1', placeholder: 'Roll' });
    container.append(label, input);
    byId('attribute-inputs').append(container);
}

function readConfig() {
    return resolveConfig({
        years: field('years').value,
        seed: field('seed').value,
        kingdomName: field('kingdomName').value,
        houseNames: field('houseNames').value,
        neighborNames: field('neighborNames').value,
        characterNames: field('characterNames').value,
        allowUsurping: field('allowUsurping').checked,
        ancestryWeights: Object.fromEntries(Object.keys(ANCESTRIES).map(key => [key, field(`weight-${key}`).value])),
        startingMonarch: {
            name: field('monarchName').value, title: field('monarchTitle').value,
            houseName: field('monarchHouse').value, ancestry: field('monarchAncestry').value,
            age: field('monarchAge').value, profession: field('monarchProfession').value, level: field('monarchLevel').value,
            attributes: Object.fromEntries(ATTRIBUTES.map(attribute => [attribute, field(`attribute-${attribute}`).value]))
        }
    });
}

function eventDescription(event) {
    const data = event.data;
    const person = data.person && personName(data.person);
    switch (event.type) {
    case 'founded': return `${data.name} begins its recorded history, with ${format(data.population)} inhabitants.`;
    case 'arrival': return `${person}, a ${ANCESTRIES[data.ancestry].name.toLowerCase()}, joins the kingdom’s nobility.`;
    case 'accession': return `${data.title} ${person} ${data.reason === 'usurpation' ? 'seizes the throne' : 'takes the throne'} at age ${data.age}.`;
    case 'house-leader': return `${person} becomes the head of their house.`;
    case 'regency': return `${personName(data.regent)} becomes regent for ${personName(data.ruler)}.`;
    case 'regency-ended': return `${person} comes of age and begins to rule without a regent.`;
    case 'majority': return `${person} reaches adulthood by ${ANCESTRIES[data.ancestry].name.toLowerCase()} custom.`;
    case 'union': return `${personName(data.first)} and ${personName(data.second)} become partners, joining their families’ fortunes.`;
    case 'birth': return `${personName(data.child)}, a ${ANCESTRIES[data.ancestry].name.toLowerCase()}, is born to ${data.parents.map(parent => parent.name).join(' and ')}.`;
    case 'achievement': return `${person} ${PROFESSIONS[data.profession].activity}.`;
    case 'level': return `${person} advances to level ${data.level}.`;
    case 'death': return `${person} dies ${data.cause === 'battle' ? 'from battlefield wounds' : data.cause === 'assassination' ? 'in an assassination' : `of ${data.cause}`}, aged ${data.age}.`;
    case 'survived': return `${person} survives ${data.cause === 'battle' ? 'a dangerous battle' : data.cause === 'assassination' ? 'an assassination attempt' : 'a serious illness'}.`;
    case 'war-start': return `War breaks out with ${data.opponent}.`;
    case 'war-end': return `The war with ${data.opponent} ends in ${data.outcome} after ${data.endYear - data.startYear} years.`;
    case 'monument': return `The ${data.name} is built.`;
    case 'monument-lost': return `The ${data.name} is lost to ${data.cause}, after standing for ${data.destroyedYear - data.builtYear} years.`;
    default: return event.type;
    }
}

function renderHistory() {
    const follow = byId('follow').checked;
    if (follow || historyEnd === 0) { historyEnd = history.length; }
    const historyStart = Math.max(0, historyEnd - PAGE_SIZE);
    const viewport = byId('timeline-scroll');
    const scrollTop = viewport.scrollTop;
    const fragment = document.createDocumentFragment();
    for (const event of history.slice(historyStart, historyEnd).reverse()) {
        const item = element('li', undefined, `event-${event.type}`);
        const content = element('div');
        content.append(element('p', eventDescription(event), 'event-text', EVENT_ICONS[event.type] || 'scroll'));
        if (event.type === 'achievement') {
            content.append(element('p', `Check ${event.data.roll}${event.data.bonus >= 0 ? '+' : ''}${event.data.bonus} against 12 · +${event.data.experience} experience`, 'event-detail'));
        }
        if (event.type === 'survived') {
            content.append(element('p', `Survival roll ${event.data.roll} against ${event.data.target}${event.data.conditions.length ? ` · Conditions: ${event.data.conditions.join(', ')}` : ''}`, 'event-detail'));
        }
        item.append(element('span', `Year ${format(event.year)}`, 'event-year'), content);
        fragment.append(item);
    }
    byId('timeline').replaceChildren(fragment);
    byId('history-empty').hidden = history.length > 0;
    byId('history-content').hidden = history.length === 0;
    byId('event-count').textContent = `${format(history.length)} events · Newest first`;
    byId('event-range').textContent = history.length ? `${format(history.length - historyEnd + 1)}–${format(history.length - historyStart)} of ${format(history.length)}` : '0 events';
    byId('older').disabled = historyStart === 0;
    byId('newer').disabled = historyEnd >= history.length;
    viewport.scrollTop = follow ? 0 : scrollTop;
}

function showError(message) {
    setIconLabel(byId('error'), message, 'warning-circle');
    byId('error').hidden = false;
}

function stopWorker() {
    worker?.terminate();
    worker = null;
    activeRun = null;
    if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
    byId('configuration').disabled = false;
    byId('cancel').hidden = true;
    setIconLabel(byId('generate'), 'Generate kingdom', 'dice-five');
}

form.addEventListener('invalid', event => {
    if (byId('settings').contains(event.target)) { byId('settings').open = true; }
}, true);
form.addEventListener('reset', () => { byId('error').hidden = true; });
form.addEventListener('submit', event => {
    event.preventDefault();
    if (activeRun) { return; }
    byId('error').hidden = true;
    let config;
    try {
        if (location.protocol === 'file:') { throw new Error('Serve this folder over HTTP to use the worker. Run npm start, then open http://localhost:8000.'); }
        if (!window.Worker) { throw new Error('This browser does not support Web Workers. Open the generator in a current browser.'); }
        config = readConfig();
        worker = new Worker(new URL('./generation.worker.mjs', import.meta.url), { type: 'module' });
    } catch (error) { showError(error.message); return; }
    history = [];
    result = null;
    currentYear = 0;
    historyEnd = 0;
    activeRun = crypto.randomUUID();
    const runId = activeRun;
    byId('follow').checked = true;
    byId('result').hidden = true;
    byId('summary-content').replaceChildren();
    byId('configuration').disabled = true;
    byId('cancel').hidden = false;
    setIconLabel(byId('generate'), 'Generating…', 'spinner-gap');
    setIconLabel(byId('chronicle-title'), `The chronicle of ${config.kingdomName}`, 'scroll');
    byId('run-status').textContent = 'Generation in progress. New events appear below; you can browse or cancel at any time.';
    byId('progress-region').hidden = false;
    byId('progress').max = config.years;
    byId('progress').value = 0;
    byId('progress-label').textContent = 'Preparing the kingdom…';
    byId('progress-percent').textContent = '0%';
    renderHistory();
    worker.onmessage = ({ data }) => {
        if (data.runId !== activeRun) { return; }
        if (data.type === 'events') { history.push(...data.events); }
        if (data.type === 'progress') {
            currentYear = data.year;
            frame = requestAnimationFrame(() => {
                frame = null;
                if (runId !== activeRun) { return; }
                renderHistory();
                byId('progress').value = data.year;
                byId('progress-label').textContent = `Year ${format(data.year)} of ${format(data.totalYears)}`;
                byId('progress-percent').textContent = `${Math.floor(data.year / data.totalYears * 100)}%`;
                worker.postMessage({ type: 'ack', runId });
            });
        }
        if (data.type === 'completed') {
            result = data.summary;
            stopWorker();
            renderSummary(result);
            byId('run-status').textContent = `${format(result.year)} ${result.year === 1 ? 'year' : 'years'} complete. ${format(history.length)} events recorded. The kingdom summary is ready below.`;
        }
        if (data.type === 'error') {
            stopWorker();
            renderHistory();
            showError(data.message);
            byId('run-status').textContent = 'Generation stopped. Check the error above and try again.';
        }
    };
    worker.onerror = () => {
        if (runId !== activeRun) { return; }
        stopWorker();
        renderHistory();
        showError('The generation worker could not finish. Reload the page and try again; ensure the app is served over HTTP.');
        byId('run-status').textContent = 'Generation stopped before completion.';
    };
    worker.postMessage({ type: 'generate', runId, config });
});

byId('cancel').addEventListener('click', () => {
    stopWorker();
    renderHistory();
    byId('run-status').textContent = `Cancelled after year ${format(currentYear)}. The partial chronicle is available; generate again to start a new history.`;
    byId('generate').focus();
});
byId('older').addEventListener('click', () => {
    byId('follow').checked = false;
    historyEnd = Math.max(0, historyEnd - PAGE_SIZE);
    renderHistory();
    byId('timeline-scroll').scrollTop = 0;
});
byId('newer').addEventListener('click', () => {
    historyEnd = Math.min(history.length, historyEnd + PAGE_SIZE);
    renderHistory();
    byId('timeline-scroll').scrollTop = 0;
});
byId('follow').addEventListener('change', renderHistory);

function statList(entries) {
    const list = element('dl', undefined, 'stat-list');
    for (const [label, value] of entries) {
        const row = element('div');
        row.append(element('dt', label), element('dd', String(value)));
        list.append(row);
    }
    return list;
}

function table(headers, rows, label) {
    const container = element('div', undefined, 'table-scroll');
    container.tabIndex = 0;
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', label);
    const grid = element('table');
    const head = element('thead');
    const header = element('tr');
    for (const text of headers) {
        const cell = element('th', text);
        cell.scope = 'col';
        header.append(cell);
    }
    head.append(header);
    const body = element('tbody');
    for (const values of rows) {
        const row = element('tr');
        for (const value of values) {
            const cell = element('td');
            if (value instanceof Node) { cell.append(value); } else { cell.textContent = String(value); }
            row.append(cell);
        }
        body.append(row);
    }
    grid.append(head, body);
    container.append(grid);
    return container;
}

function details(title, content, iconName) {
    const container = element('details', undefined, 'detail-section');
    container.append(element('summary', title, undefined, iconName), content);
    return container;
}

function textList(items, empty) {
    if (!items.length) { return element('p', empty); }
    const list = element('ul');
    for (const item of items) { list.append(element('li', item)); }
    return list;
}

function characterBrowser(summary) {
    const families = indexFamilies(summary.characters, history);
    const characters = [...summary.characters].sort((a, b) => a.name.localeCompare(b.name) || a.house.localeCompare(b.house) || a.birthYear - b.birthYear || a.id.localeCompare(b.id));
    const pageSize = 20;
    let offset = 0;
    let selectedId = summary.ruler.id;
    const section = element('section', undefined, 'summary-section character-browser');
    section.id = 'characters';
    section.setAttribute('aria-labelledby', 'characters-title');
    const title = element('h3', 'Characters & family trees', undefined, 'tree-structure');
    title.id = 'characters-title';
    section.append(title, element('p', 'Explore every recorded life, living or deceased. Select a relative to follow the family across generations.', 'hint'));
    const layout = element('div', undefined, 'character-layout');
    const directory = element('div', undefined, 'character-directory');
    const searchLabel = element('label', 'Find a character', undefined, 'magnifying-glass');
    searchLabel.htmlFor = 'character-search';
    const search = element('input');
    Object.assign(search, { id: 'character-search', type: 'search', placeholder: 'Name, house, or ancestry' });
    const statusLabel = element('label', 'Life status');
    statusLabel.htmlFor = 'character-status';
    const status = element('select');
    status.id = 'character-status';
    for (const [value, label] of [['all', 'All characters'], ['living', 'Living'], ['deceased', 'Deceased']]) {
        const option = element('option', label);
        option.value = value;
        status.append(option);
    }
    const count = element('p', undefined, 'hint');
    count.id = 'character-count';
    count.setAttribute('role', 'status');
    const list = element('ul', undefined, 'character-list');
    list.id = 'character-list';
    list.setAttribute('aria-label', 'Recorded characters');
    const paging = element('div', undefined, 'character-paging');
    const previous = element('button', 'Previous', 'quiet', 'caret-left');
    const next = element('button', 'Next', 'quiet');
    const nextIcon = icon('caret-right');
    nextIcon.classList.add('icon-trailing');
    next.append(nextIcon);
    previous.type = next.type = 'button';
    previous.setAttribute('aria-label', 'Previous characters');
    next.setAttribute('aria-label', 'Next characters');
    paging.append(previous, next);
    directory.append(searchLabel, search, statusLabel, status, count, list, paging);
    const profile = element('div', undefined, 'family-tree');
    profile.id = 'character-profile';
    profile.setAttribute('role', 'region');
    profile.setAttribute('aria-labelledby', 'character-name');
    layout.append(directory, profile);
    section.append(layout);

    function matches() {
        const query = search.value.trim().toLocaleLowerCase();
        return characters.filter(person => (status.value === 'all' || person.alive === (status.value === 'living')) && `${person.name} ${person.house} ${ANCESTRIES[person.ancestry].name}`.toLocaleLowerCase().includes(query));
    }

    function lifeDates(person) {
        return `Born year ${format(person.birthYear)} · ${person.alive ? `Living, age ${person.age}` : `Died year ${format(person.deathYear)}, age ${person.age}`}`;
    }

    function personButton(person, detail) {
        const button = element('button', undefined, 'person-button');
        button.type = 'button';
        button.dataset.characterId = person.id;
        button.append(element('span', person.name, 'person-name', person.alive ? 'user' : 'skull'), element('span', `House ${person.house} · ${ANCESTRIES[person.ancestry].name}`, 'hint'), element('span', lifeDates(person), 'hint'));
        if (detail) { button.append(element('span', detail, 'hint')); }
        button.addEventListener('click', () => selectCharacter(person.id));
        return button;
    }

    function renderDirectory() {
        const filtered = matches();
        const fragment = document.createDocumentFragment();
        for (const person of filtered.slice(offset, offset + pageSize)) {
            const item = element('li');
            const button = personButton(person);
            if (person.id === selectedId) { button.setAttribute('aria-current', 'true'); }
            item.append(button);
            fragment.append(item);
        }
        if (!filtered.length) { fragment.append(element('li', 'No matching characters. Try a different name or life status.', 'hint')); }
        list.replaceChildren(fragment);
        count.textContent = filtered.length ? `${format(offset + 1)}–${format(Math.min(offset + pageSize, filtered.length))} of ${format(filtered.length)} characters` : '0 characters';
        previous.disabled = offset === 0;
        next.disabled = offset + pageSize >= filtered.length;
    }

    function familyGroup(label, iconName, relatives, empty, detail) {
        const group = element('section', undefined, 'family-group');
        group.append(element('h4', label, undefined, iconName));
        const relativesList = element('ul', undefined, 'family-relatives');
        for (const person of relatives) {
            const item = element('li');
            item.append(personButton(person, detail?.(person)));
            relativesList.append(item);
        }
        group.append(relatives.length ? relativesList : element('p', empty, 'hint'));
        return group;
    }

    function selectCharacter(id, focus = true) {
        selectedId = id;
        const family = families.get(id);
        const person = family.person;
        const index = matches().findIndex(candidate => candidate.id === id);
        if (index !== -1) { offset = Math.floor(index / pageSize) * pageSize; }
        renderDirectory();
        const selected = element('section', undefined, 'family-selected');
        selected.dataset.characterId = id;
        const name = element('h4', `${person.title} ${person.name}`, undefined, person.id === summary.ruler.id ? 'crown' : person.alive ? 'user' : 'skull');
        name.id = 'character-name';
        name.tabIndex = -1;
        selected.append(name, element('p', `House ${person.house} · ${ANCESTRIES[person.ancestry].name} · Level ${person.level} ${PROFESSIONS[person.profession].name}`, 'ruler-facts'));
        selected.append(element('p', lifeDates(person)));
        if (!person.alive) { selected.append(element('p', `Cause of death: ${person.deathCause}.`)); }
        selected.append(statList(ATTRIBUTES.map(attribute => [capitalize(attribute), person.attributes[attribute]])));
        selected.append(element('p', `Personal power ${person.personalPower} · Political influence ${person.politicalInfluence} · HP ${person.hitPoints}`, 'hint'));
        selected.append(element('p', `Experience ${person.experience} · Prestige ${person.prestige} · Legitimacy ${person.legitimacy}`, 'hint'));
        selected.append(element('p', `Conditions: ${person.conditions.join(', ') || 'none'}.`, 'hint'));
        const middle = element('div', undefined, 'family-middle');
        middle.append(selected, familyGroup('Partners', 'heart', family.partners.map(partner => partner.person), 'No recorded partnerships.', partner => {
            const relationship = family.partners.find(entry => entry.person.id === partner.id);
            return relationship.current ? `Current partner · since year ${format(relationship.startYear)}` : `Former partner · years ${format(relationship.startYear)}–${format(relationship.endYear)}`;
        }));
        profile.replaceChildren(
            familyGroup('Parents', 'users', family.parents, 'Parents are not recorded for this character.'),
            middle,
            familyGroup(`Children (${family.children.length})`, 'baby', family.children, 'No recorded children.', child => {
                const others = families.get(child.id).parents.filter(parent => parent.id !== id);
                return others.length ? `Other parent: ${others.map(parent => parent.name).join(', ')}` : 'Other parent unrecorded';
            })
        );
        if (focus) { name.focus(); }
    }

    for (const control of [search, status]) {
        control.addEventListener('input', () => { offset = 0; renderDirectory(); });
    }
    previous.addEventListener('click', () => { offset = Math.max(0, offset - pageSize); renderDirectory(); list.scrollTop = 0; });
    next.addEventListener('click', () => { offset += pageSize; renderDirectory(); list.scrollTop = 0; });
    selectCharacter(selectedId, false);
    return section;
}

function renderSummary(summary) {
    const people = new Map(summary.characters.map(person => [person.id, person]));
    const content = document.createDocumentFragment();
    setIconLabel(byId('result-title'), `${summary.config.kingdomName}, year ${format(summary.year)}`, 'castle-turret');
    byId('result-subtitle').textContent = `${format(summary.characters.length)} notable lives · ${format(summary.totals.births)} births · ${format(summary.totals.deaths)} deaths · ${format(summary.reigns.length)} ${summary.reigns.length === 1 ? 'reign' : 'reigns'}`;
    const overview = element('div', undefined, 'overview');
    const throne = element('section');
    const ruler = summary.ruler;
    throne.append(element('h3', `${ruler.title} ${ruler.name}`, 'ruler-name', 'crown'));
    throne.append(element('p', `House ${ruler.house} · ${ANCESTRIES[ruler.ancestry].name} · Age ${ruler.age} · Level ${ruler.level} ${PROFESSIONS[ruler.profession].name}`, 'ruler-facts'));
    throne.append(statList([['Personal power', ruler.personalPower], ['Political influence', ruler.politicalInfluence], ['Hit points', ruler.hitPoints]]));
    throne.append(element('p', summary.heir ? `Heir by descent: ${personName(summary.heir)}.` : summary.successionFallback ? `No living descendant. Leading house candidate: ${personName(summary.successionFallback)}.` : 'No living descendant or house candidate; a new noble will be elevated if needed.'));
    if (summary.regent) { throne.append(element('p', `Regent: ${personName(summary.regent)}.`)); }
    const kingdom = element('section');
    kingdom.append(element('h3', 'The realm at a glance'));
    kingdom.append(statList([['Population', format(summary.population)], ['Prosperity', `${summary.prosperity} / 100`], ['Stability', `${summary.stability} / 100`]]));
    kingdom.append(element('p', `${summary.livingCount} living notable characters: ${Object.entries(summary.ancestries).filter(([, count]) => count).map(([key, count]) => `${count} ${ANCESTRIES[key].name}`).join(', ')}.`));
    const activeWars = summary.wars.filter(war => war.endYear === null);
    kingdom.append(element('p', activeWars.length ? `At war with ${activeWars.map(war => war.opponent).join(', ')}.` : 'The kingdom is at peace with its neighbors.'));
    overview.append(throne, kingdom);
    content.append(overview);

    const houses = element('section', undefined, 'summary-section');
    houses.append(element('h3', 'Noble houses', undefined, 'flag'));
    houses.append(element('p', 'Scroll tables sideways to see every column.', 'hint table-hint'));
    houses.append(table(['House', 'Leader', 'Influence', 'Wealth / 100', 'Living members', 'Allied houses'], summary.houses.map(house => [house.name, people.get(house.leaderId).name, house.influence, house.wealth, house.livingCount, house.allies.join(', ') || 'None']), 'Noble houses'));
    content.append(houses);
    content.append(characterBrowser(summary));
    const reignContent = element('div');
    reignContent.append(element('p', `Longest reign: ${summary.longestReign.name}, ${summary.longestReign.duration} years. Shortest reign: ${summary.shortestReign.name}, ${summary.shortestReign.duration} years. Current reigns are counted through year ${summary.year}.`));
    reignContent.append(table(['Ruler', 'House', 'Reign', 'Duration', 'Ending'], summary.reigns.map(reign => [reign.name, reign.house, `${reign.startYear}–${reign.endYear ?? 'present'}`, `${reign.duration} years`, reign.endReason || 'Still reigning']), 'Ruler chronology'));
    content.append(details(`Ruler chronology (${summary.reigns.length} ${summary.reigns.length === 1 ? 'reign' : 'reigns'})`, reignContent, 'crown'));
    content.append(details(`Wars (${summary.wars.length})`, textList(summary.wars.map(war => `${war.opponent}: years ${war.startYear}–${war.endYear ?? 'present'} · ${war.outcome || 'ongoing'}.`), 'No wars were recorded.'), 'sword'));
    content.append(details(`Monuments & ruins (${summary.monuments.length})`, textList(summary.monuments.map(monument => `${monument.name}, built in year ${monument.builtYear}. ${monument.destroyedYear === null ? 'Still standing.' : `Lost to ${monument.cause} in year ${monument.destroyedYear}.`}`), 'No monuments were built.'), 'castle-turret'));
    byId('summary-content').replaceChildren(content);
    byId('seed-display').textContent = `Seed: ${summary.config.seed} · Engine ${summary.engineVersion}`;
    byId('resolved-settings').textContent = JSON.stringify(summary.config, null, 2);
    byId('result').hidden = false;
}

byId('download').addEventListener('click', () => {
    if (!result) { return; }
    const blob = new Blob([JSON.stringify({ summary: result, events: history }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = element('a');
    link.href = url;
    link.download = `kingdom-history-year-${result.year}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
});

byId('reuse').addEventListener('click', () => {
    if (!result) { return; }
    const config = result.config;
    for (const key of ['years', 'seed', 'kingdomName']) { field(key).value = config[key]; }
    for (const key of ['houseNames', 'neighborNames', 'characterNames']) { field(key).value = config[key].join(', '); }
    field('allowUsurping').checked = config.allowUsurping;
    for (const key of Object.keys(ANCESTRIES)) { field(`weight-${key}`).value = config.ancestryWeights[key]; }
    const monarch = config.startingMonarch;
    for (const [input, key] of Object.entries({ monarchName: 'name', monarchTitle: 'title', monarchHouse: 'houseName', monarchAncestry: 'ancestry', monarchAge: 'age', monarchProfession: 'profession', monarchLevel: 'level' })) {
        field(input).value = monarch[key] ?? '';
    }
    for (const attribute of ATTRIBUTES) { field(`attribute-${attribute}`).value = monarch.attributes[attribute] ?? ''; }
    byId('settings').open = true;
    byId('error').hidden = true;
    byId('run-status').textContent = 'Settings restored. Generate again to recreate this history, or adjust the settings for a different outcome.';
    byId('generate').focus();
});
