// Fabrication des files de boîtes d'un niveau : faisable pour un joueur attentif,
// mais piégeuse pour qui pose les boîtes au hasard.
import { clone, remaining, reachable, collect, settle, rand, pick, parseMap } from './grid.js';

const QUEUES = 3;

// Démonte la fresque dans un ordre possible, en paquets de 4 à 12 pixels d'une même couleur.
export function buildSequence(target, N, rnd = Math.random) {
  const g = clone(target), seq = [];
  let guard = 0;
  while (remaining(g) && guard++ < 500) {
    const colors = [...new Set(reachable(g, N).map(([r, c]) => g[r][c]))];
    const color = pick(colors, rnd);
    const n = collect(g, N, color, rand(4, 12, rnd));
    if (n) seq.push({ color, count: n });
  }
  return seq;
}

// Joueur prudent simulé : pose toujours la boîte qui débloque le plus. S'il gagne, le niveau est faisable.
export function solvable(target, N, queues, cap) {
  const g = clone(target), qs = queues.map((q) => q.slice());
  let line = [];
  for (let step = 0; step < 500; step++) {
    line = settle(g, N, line);
    if (!remaining(g)) return true;
    if (line.length >= cap) return false;
    let best = null;
    qs.forEach((q, qi) => {
      if (!q.length) return;
      const gg = clone(g);
      const l2 = line.map((b) => ({ ...b })).concat({ color: q[0].color, rem: q[0].count });
      const before = remaining(gg), after = settle(gg, N, l2);
      const score = (before - remaining(gg)) * 10 - after.length * 25;
      if (!best || score > best.score) best = { qi, score };
    });
    if (!best) return false;
    const a = qs[best.qi].shift();
    line.push({ color: a.color, rem: a.count });
  }
  return false;
}

// Joueur qui pose les boîtes au hasard : part des parties gagnées sur `runs` essais.
// Sert à mesurer la difficulté (plus c'est bas, plus le niveau demande de réfléchir).
export function randomWins(target, N, queues, cap, runs, rnd = Math.random) {
  let wins = 0;
  for (let k = 0; k < runs; k++) {
    const g = clone(target), qs = queues.map((q) => q.slice());
    let line = [];
    for (let step = 0; step < 500; step++) {
      line = settle(g, N, line);
      if (!remaining(g)) { wins++; break; }
      const open = qs.filter((q) => q.length);
      if (line.length >= cap || !open.length) break;
      const a = pick(open, rnd).shift();
      line.push({ color: a.color, rem: a.count });
    }
  }
  return wins / runs;
}

// Aucune file ne doit démarrer vide : on y déplace la dernière boîte de la file la plus longue.
function fillEmptyQueues(qs) {
  for (const q of qs) {
    if (q.length) continue;
    const longest = qs.reduce((a, b) => (b.length > a.length ? b : a));
    if (longest.length > 1) q.push(longest.pop());
  }
}

// Une proposition de files : l'ordre de démontage, un peu mélangé, réparti au hasard entre les files.
function candidate(target, N, lvl, nextId, rnd) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const seq = buildSequence(target, N, rnd);
    const mixed = seq
      .map((a, i) => ({ a, k: i + rnd() * lvl.mix }))
      .sort((x, y) => x.k - y.k)
      .map((x) => x.a);
    const qs = Array.from({ length: QUEUES }, () => []);
    mixed.forEach((a) => qs[rand(0, QUEUES - 1, rnd)].push({ id: nextId(), ...a }));
    fillEmptyQueues(qs);
    if (solvable(target, N, qs, lvl.cap)) return qs;
  }
  return null;
}

// Génère un niveau complet : la grille de départ et les files de boîtes.
// lvl vient de data/levels.js ; nextId fournit des identifiants uniques aux boîtes.
export function generate(lvl, nextId, rnd = Math.random) {
  const N = lvl.map.length;
  const target = parseMap(lvl.map);
  let queues = null, easiest = 2;
  for (let t = 0; t < lvl.tries; t++) {
    const qs = candidate(target, N, lvl, nextId, rnd);
    if (!qs) continue;
    const r = randomWins(target, N, qs, lvl.cap, 12, rnd);
    if (r < easiest) { easiest = r; queues = qs; }
  }
  if (!queues) { // filet de sécurité : l'ordre exact de démontage, toujours faisable
    queues = Array.from({ length: QUEUES }, () => []);
    buildSequence(target, N, rnd).forEach((a, i) => queues[i % QUEUES].push({ id: nextId(), ...a }));
  }
  return { N, target, queues };
}
