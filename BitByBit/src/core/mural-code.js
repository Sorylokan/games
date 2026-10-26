// Custom murals: short share codes, and export for data/maps.js.
// Only needs btoa/atob/TextEncoder (also in Node 18+).
import { COLORS } from '../data/colors.js';

export const MIN_SIZE = 4;
export const MAX_SIZE = 50; // beyond this, boxes and level generation get heavy (see packetFor)
export const MIN_SLOTS = 2;
export const MAX_SLOTS = 5;
export const DEFAULT_SLOTS = 4;
// "Bit by Bit", format version 2 (adds the slot count). Version 1 codes still read, with 4 slots.
const PREFIX = 'BB2-';
const PREFIX_V1 = 'BB1-';

export const cleanName = (s) => String(s ?? '').replace(/[<>|]/g, '').trim().slice(0, 30);
export const pixelCount = (map) => map.join('').replace(/\./g, '').length;

// Run-length encoding: "BBBBKK" → "4B2K".
export function rle(str) {
  let out = '';
  for (let i = 0; i < str.length;) {
    let j = i;
    while (j < str.length && str[j] === str[i]) j++;
    out += (j - i) + str[i];
    i = j;
  }
  return out;
}

export function unrle(s, maxLen = MAX_SIZE * MAX_SIZE) {
  let out = '', pos = 0;
  const re = /(\d+)([A-Z.])/y;
  while (pos < s.length) {
    re.lastIndex = pos;
    const m = re.exec(s);
    if (!m) return null; // unreadable chunk
    const n = Number(m[1]);
    if (!n || out.length + n > maxLen) return null;
    out += m[2].repeat(n);
    pos = re.lastIndex;
  }
  return out;
}

const toB64 = (str) => {
  let bin = '';
  new TextEncoder().encode(str).forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64 = (s) => {
  let b = s.replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  return new TextDecoder().decode(Uint8Array.from(atob(b), (c) => c.charCodeAt(0)));
};

// { name, map, slots } → "BB2-…" (text inside: "size|slots|name|pixels")
export function encodeMural({ name, map, slots = DEFAULT_SLOTS }) {
  return PREFIX + toB64(`${map.length}|${slots}|${cleanName(name)}|${rle(map.join(''))}`);
}

// "BB2-…" or "BB1-…" → { name, map, slots }, or null if the code is broken or invalid.
export function decodeMural(code) {
  try {
    const c = String(code ?? '').trim();
    const v1 = c.startsWith(PREFIX_V1);
    if (!v1 && !c.startsWith(PREFIX)) return null;
    let txt = fromB64(c.slice(PREFIX.length));
    let slots = DEFAULT_SLOTS;
    const a = txt.indexOf('|');
    if (a < 0) return null;
    const N = Number(txt.slice(0, a));
    if (!v1) { // "size|slots|…" → keep "size|…" for the shared parsing below
      const s = txt.indexOf('|', a + 1);
      slots = Number(txt.slice(a + 1, s));
      if (s < 0 || !Number.isInteger(slots) || slots < MIN_SLOTS || slots > MAX_SLOTS) return null;
      txt = txt.slice(0, a) + txt.slice(s);
    }
    const b = txt.lastIndexOf('|');
    if (b <= a) return null;
    if (!Number.isInteger(N) || N < MIN_SIZE || N > MAX_SIZE) return null;
    const flat = unrle(txt.slice(b + 1));
    if (flat === null || flat.length !== N * N) return null;
    if (![...flat].every((ch) => ch === '.' || COLORS[ch])) return null;
    const map = Array.from({ length: N }, (_, r) => flat.slice(r * N, (r + 1) * N));
    return { name: cleanName(txt.slice(a + 1, b)), map, slots };
  } catch {
    return null;
  }
}

// Readable id for data/maps.js: "Mon Chat !" → "mon-chat".
export const slugify = (name) => cleanName(name).replace(/œ/gi, 'oe').replace(/æ/gi, 'ae').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mural';

// Entry to paste into data/maps.js, plus its translation line.
export function toMapsSnippet({ name, map }) {
  const id = slugify(name);
  const rows = map.map((r) => `    '${r}',`).join('\n');
  const label = cleanName(name) || id;
  return `  { id: '${id}', map: [\n${rows}\n  ] },\n\n// locales/fr.json and locales/en.json:\n// "map.${id}": "${label}",`;
}
