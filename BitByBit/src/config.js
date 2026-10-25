// Game tuning, in one place.

export const BASE_SPEED = 6.5;   // carrier speed in cells/s (before the species multiplier)
export const SPAWN_MS = 130;     // delay between two carriers leaving the same box
export const MAX_OUT = 5;        // carriers out at once per box
export const BOX_OPEN_MS = 280;  // delay before a placed box sends its first carrier
export const BOX_CLOSE_MS = 500; // fade-out time of an emptied box
export const QUEUE_COUNT = 3;    // number of box queues

// localStorage keys. The "pc-" prefix comes from the old name ("Petite Colonie"):
// kept so players don't lose their progress.
export const STORAGE = {
  level: 'pc-level',
  best: 'pc-best',
  skin: 'pc-skin',
  lang: 'pc-lang',
  murals: 'pc-murals', // saved custom murals (editor)
  draft: 'pc-draft',   // mural being edited
};
