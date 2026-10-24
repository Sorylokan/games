// Vue à envoyer à un joueur : cartes cachées et pioche masquées.

export function viewFor(state, pid) {
  const v = structuredClone(state);
  v.players.forEach((p) => p.grid.forEach((col) => col && col.forEach((c) => { if (!c.up) c.v = null; })));
  v.drawCount = v.draw.length;
  delete v.draw;
  return v;
}
