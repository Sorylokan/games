export const BASE_SPEED = 6.5;   // carrier speed in cells/s (before the species multiplier)
export const SPAWN_MS = 130;     // delay between two carriers leaving the same box
export const MAX_OUT = 5;        // carriers out at once per box
export const BOX_OPEN_MS = 280;  // delay before a placed box sends its first carrier
export const BOX_CLOSE_MS = 300; // fade-out time of an emptied box
export const QUEUE_COUNT = 3;

// localStorage keys (old "pc-" keys are renamed in storage.js).
export const STORAGE = {
  level: 'bbb-level',
  best: 'bbb-best',
  skin: 'bbb-skin',     // the language key ('bbb-lang') lives in src/i18n.js
  music: 'bbb-music',
  sfx: 'bbb-sfx',
  awake: 'bbb-awake',
  murals: 'bbb-murals', // editor: saved murals and the current draft
  draft: 'bbb-draft',
};
