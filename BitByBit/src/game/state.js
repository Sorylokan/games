// Shared app state, one object imported where needed.
//   st    current game (game/session.js)
//   geo   board size in screen pixels (render/canvas.js)
//   pal   theme colors read from CSS (ui/skin.js)
//   speed ×1 or ×2
//   skin  active theme

export const app = {
  st: null,
  geo: {},
  pal: {},
  speed: 1,
  skin: 'night',
};

let idSeq = 0;
export const nextId = () => ++idSeq;
