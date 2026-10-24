// État partagé de l'application. Un seul objet, importé par les modules qui en ont besoin.
//   st    : la partie en cours (créée par game/session.js)
//   geo   : dimensions du plateau en pixels écran (render/canvas.js)
//   pal   : couleurs du thème lues dans le CSS (ui/skin.js)
//   speed : ×1 ou ×2
//   skin  : nom du thème actif

export const app = {
  st: null,
  geo: {},
  pal: {},
  speed: 1,
  skin: 'night',
};

let idSeq = 0;
export const nextId = () => ++idSeq;
