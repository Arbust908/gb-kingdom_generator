import { runGeneration } from './simulation/run.mjs';

let acknowledge;
let running = false;
self.onmessage = async ({ data }) => {
    if (data.type === 'ack') {
        acknowledge?.();
        return;
    }
    if (data.type !== 'generate' || running) { return; }
    running = true;
    try {
        await runGeneration(data.config, data.runId, message => self.postMessage(message), () => new Promise(resolve => { acknowledge = resolve; }));
    } catch (error) {
        self.postMessage({ type: 'error', runId: data.runId, message: error.message });
    } finally {
        running = false;
        acknowledge = null;
    }
};
