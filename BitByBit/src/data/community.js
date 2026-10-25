// Community murals, accepted by hand from "suggest a mural" GitHub issues
// (or added by the workflow in .github/workflows/fresque.yml). Newest first.
// The mural name is inside the code.
import { decodeMural } from '../core/mural-code.js';

export const COMMUNITY = [
  // { author: 'Name', code: 'BB1-…' },
];

// Playable murals: { name, map, author }. Broken codes are skipped (and caught by the tests).
export const communityMurals = () => COMMUNITY
  .map((e) => ({ ...decodeMural(e.code), author: e.author }))
  .filter((m) => m.map);
