// Background thread for level generation, so the carriers keep moving while a level is built.
import { generate } from './generator.js';

let id = 0;
onmessage = ({ data: { job, lvl } }) => postMessage({ job, ...generate(lvl, () => ++id) });
