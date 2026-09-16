// Historical partnerships live in union events; partnerId only records a current living partner.
export function indexFamilies(characters, events) {
    const people = new Map(characters.map(person => [person.id, person]));
    const byBirth = (a, b) => a.birthYear - b.birthYear || a.id.localeCompare(b.id);
    const families = new Map(characters.map(person => [person.id, {
        person,
        parents: person.parents.map(id => people.get(id)).sort(byBirth),
        children: person.children.map(id => people.get(id)).sort(byBirth),
        partners: []
    }]));
    for (const event of events) {
        if (event.type !== 'union') { continue; }
        const [first, second] = event.characterIds.map(id => people.get(id));
        const endYear = Math.min(first.deathYear ?? Infinity, second.deathYear ?? Infinity);
        for (const [person, partner] of [[first, second], [second, first]]) {
            families.get(person.id).partners.push({
                person: partner,
                startYear: event.year,
                endYear: Number.isFinite(endYear) ? endYear : null,
                current: person.partnerId === partner.id && partner.partnerId === person.id
            });
        }
    }
    return families;
}
