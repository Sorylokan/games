// Custom murals: short share codes, and export for data/maps.js.
// Only needs btoa/atob/TextEncoder (also in Node 18+).
import { COLORS } from '../data/colors.js';

export const MIN_SIZE = 4;
export const MAX_SIZE = 50; // beyond this, boxes and level generation get heavy (see packetFor)
const PREFIX = 'BB1-'; // "Bit by Bit", format version 1

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

// { name, map } → "BB1-…"
export function encodeMural({ name, map }) {
  return PREFIX + toB64(`${map.length}|${cleanName(name)}|${rle(map.join(''))}`);
}

// "BB1-…" → { name, map }, or null if the code is broken or invalid.
export function decodeMural(code) {
  try {
    const c = String(code ?? '').trim();
    if (!c.startsWith(PREFIX)) return null;
    const txt = fromB64(c.slice(PREFIX.length));
    const a = txt.indexOf('|'), b = txt.lastIndexOf('|');
    if (a < 0 || b <= a) return null;
    const N = Number(txt.slice(0, a));
    if (!Number.isInteger(N) || N < MIN_SIZE || N > MAX_SIZE) return null;
    const flat = unrle(txt.slice(b + 1));
    if (flat === null || flat.length !== N * N) return null;
    if (![...flat].every((ch) => ch === '.' || COLORS[ch])) return null;
    const map = Array.from({ length: N }, (_, r) => flat.slice(r * N, (r + 1) * N));
    return { name: cleanName(txt.slice(a + 1, b)), map };
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
