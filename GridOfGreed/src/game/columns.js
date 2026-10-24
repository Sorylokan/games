// Colonne de 3 cartes visibles identiques : elle part sur la défausse.

export function removeIfMatch(s, pi, col, ev) {
  const column = s.players[pi].grid[col];
  if (column && column.every((c) => c.up) &&
      column[0].v === column[1].v && column[1].v === column[2].v) {
    const v = column[0].v;
    s.discard.push(v, v, v);
    s.players[pi].grid[col] = null;
    ev.push({ type: 'columnRemoved', player: pi, col, value: v });
  }
}
