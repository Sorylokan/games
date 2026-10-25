// Shared DOM shortcuts.

export const $ = (id) => document.getElementById(id);

export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
