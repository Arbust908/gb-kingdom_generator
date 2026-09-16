import { generateKingdom } from './engine.mjs';

// Yield the worker event loop between batches so cancellation and acknowledgements can arrive.
export async function runGeneration(input, runId, send, checkpoint = () => new Promise(resolve => setTimeout(resolve, 0))) {
    const generator = generateKingdom(input);
    let step = generator.next();
    send({ type: 'started', runId, totalYears: step.value.totalYears });
    while (!step.done) {
        const events = [];
        let year;
        const totalYears = step.value.totalYears;
        const started = performance.now();
        let turns = 0;
        do {
            year = step.value.year;
            events.push(...step.value.events);
            step = generator.next();
            turns++;
        } while (!step.done && turns < 5 && performance.now() - started < 12);
        send({ type: 'events', runId, events });
        send({ type: 'progress', runId, year, totalYears });
        await checkpoint();
    }
    send({ type: 'completed', runId, summary: step.value });
}
