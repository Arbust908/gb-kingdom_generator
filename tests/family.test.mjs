import test from 'node:test';
import assert from 'node:assert/strict';
import { indexFamilies } from '../js/family.mjs';

test('keeps reciprocal links to deceased partners after remarriage', () => {
    const characters = [
        { id: 'a', name: 'Aster', birthYear: -50, deathYear: null, parents: [], children: ['child'], partnerId: 'c' },
        { id: 'b', name: 'Rowan', birthYear: -45, deathYear: 20, parents: [], children: ['child'], partnerId: null },
        { id: 'c', name: 'Rowan', birthYear: -30, deathYear: null, parents: [], children: [], partnerId: 'a' },
        { id: 'child', name: 'Aster', birthYear: 10, deathYear: null, parents: ['a', 'b'], children: [], partnerId: null }
    ];
    const events = [
        { type: 'union', year: 1, characterIds: ['a', 'b'] },
        { type: 'death', year: 20, characterIds: ['b'] },
        { type: 'union', year: 25, characterIds: ['a', 'c'] }
    ];
    const families = indexFamilies(characters, events);
    assert.deepEqual(families.get('a').partners.map(({ person, startYear, endYear, current }) => ({ id: person.id, startYear, endYear, current })), [
        { id: 'b', startYear: 1, endYear: 20, current: false },
        { id: 'c', startYear: 25, endYear: null, current: true }
    ]);
    assert.equal(families.get('b').partners[0].person.id, 'a');
    assert.equal(families.get('b').partners[0].current, false);
    assert.equal(families.get('c').partners[0].person.id, 'a');
    assert.deepEqual(families.get('child').parents.map(person => person.id), ['a', 'b']);
    assert.equal(families.get('a').children[0].id, 'child');
    assert.equal(families.get('b').children[0].id, 'child');
});

test('orders children by birth and leaves unrecorded families empty', () => {
    const characters = [
        { id: 'parent', birthYear: -30, deathYear: null, parents: [], children: ['younger', 'older'], partnerId: null },
        { id: 'younger', birthYear: 20, deathYear: null, parents: ['parent'], children: [], partnerId: null },
        { id: 'older', birthYear: 10, deathYear: 30, parents: ['parent'], children: [], partnerId: null }
    ];
    const family = indexFamilies(characters, []).get('parent');
    assert.deepEqual(family.children.map(person => person.id), ['older', 'younger']);
    assert.deepEqual(family.parents, []);
    assert.deepEqual(family.partners, []);
});

test('ends a historical partnership at the first death even when both partners are deceased', () => {
    const characters = [
        { id: 'first', birthYear: -30, deathYear: 20, parents: [], children: [], partnerId: null },
        { id: 'second', birthYear: -25, deathYear: 50, parents: [], children: [], partnerId: null }
    ];
    const families = indexFamilies(characters, [{ type: 'union', year: 0, characterIds: ['first', 'second'] }]);
    for (const family of families.values()) {
        assert.equal(family.partners[0].startYear, 0);
        assert.equal(family.partners[0].endYear, 20);
        assert.equal(family.partners[0].current, false);
    }
});
