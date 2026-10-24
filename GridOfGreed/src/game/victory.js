// Après le décompte : manche suivante ou fin de partie.

export function resolveRoundEnd(s, ev) {
  if (s.players.some((p) => p.total >= s.targetScore)) {
    s.phase = 'gameOver';
    const min = Math.min(...s.players.map((p) => p.total));
    s.winners = s.players.filter((p) => p.total === min).map((p) => p.id); // égalité = victoire partagée
    ev.push({ type: 'gameOver', winners: s.winners });
  } else {
    s.phase = 'roundOver';
  }
}
