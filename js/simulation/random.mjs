// Mulberry32 with an FNV-1a string seed. All simulation randomness goes through this object.
export function createRandom(seed) {
    let state = 2166136261;
    for (const character of String(seed)) {
        state = Math.imul(state ^ character.codePointAt(0), 16777619) >>> 0;
    }
    const random = {
        next() {
            state = (state + 0x6D2B79F5) >>> 0;
            let value = Math.imul(state ^ (state >>> 15), 1 | state);
            value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        },
        int(min, max) { return min + Math.floor(random.next() * (max - min + 1)); },
        pick(items) { return items[random.int(0, items.length - 1)]; },
        chance(probability) { return random.next() < probability; },
        weighted(weights) {
            const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
            let remaining = random.next() * entries.reduce((sum, [, weight]) => sum + weight, 0);
            for (const [key, weight] of entries) {
                remaining -= weight;
                if (remaining < 0) { return key; }
            }
            return entries[entries.length - 1][0];
        },
        shuffle(items) {
            const result = [...items];
            for (let index = result.length - 1; index > 0; index--) {
                const other = random.int(0, index);
                [result[index], result[other]] = [result[other], result[index]];
            }
            return result;
        }
    };
    return random;
}
