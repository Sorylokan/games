// Shared app state, one object imported where needed.

export const app = {
  st: null,      // current game (game/session.js)
  geo: {},       // board size in screen pixels (render/canvas.js)
  pal: {},       // theme colors read from CSS (ui/skin.js)
  speed: 1,
  skin: 'night',
};

let idSeq = 0;
export const nextId = () => ++idSeq;
