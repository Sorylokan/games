// A boss takes up to ~1.5 s to generate (×3–4 on a phone): a worker builds levels off the main thread, the next one while the current one is played.
import { generate } from '../core/generator.js';
import { nextId } from './state.js';

let worker = null;
try { worker = new Worker(new URL('../core/gen-worker.js', import.meta.url), { type: 'module' }); } catch {}

const pending = new Map();
let jobSeq = 0;

worker?.addEventListener('message', ({ data }) => {
  pending.get(data.job)?.resolve(data);
  pending.delete(data.job);
});
// Browsers without module workers fail here instead of in the constructor: generate the old way.
worker?.addEventListener('error', () => {
  worker = null;
  for (const { resolve, lvl } of pending.values()) resolve(generate(lvl, nextId));
  pending.clear();
});

function build(lvl) {
  if (!worker) return Promise.resolve(generate(lvl, nextId));
  const job = ++jobSeq;
  return new Promise((resolve) => {
    pending.set(job, { resolve, lvl });
    worker.postMessage({ job, lvl });
  });
}

// The worker counts its own ids from 1, so they could clash with the game's.
function withIds(g) {
  g.queues.forEach((q) => q.forEach((b) => { b.id = nextId(); }));
  return g;
}

const ahead = new Map();

export function prepare(li, lvl) {
  if (ahead.has(li)) return;
  ahead.clear();
  ahead.set(li, build(lvl));
}

export function levelData(lvl, li = null) {
  const p = (li !== null && ahead.get(li)) || build(lvl);
  ahead.delete(li);
  return p.then(withIds);
}
