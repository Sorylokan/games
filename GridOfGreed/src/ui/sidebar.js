// Colonne de droite : scores, historique, joueurs (ordre du tour), infos de partie.
// Lecture seule : tout vient de la vue masquée, aucune règle ici.
export const PLAYER_COLORS = ["#e0556b", "#e8963f", "#e9d24c", "#5fcf80", "#4fb7d9", "#4a8cff", "#a97bf0", "#e077c7"];

const make = (tag, cls = "", text = null) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== null) n.textContent = text;
  return n;
};

// Pastille de couleur d'un joueur. Pour l'hôte, la pastille devient un ◆ de la même couleur.
export function playerDot(i, hostTip = null) {
  const d = make("span", hostTip ? "pdot host" : "pdot");
  d.style.setProperty("--pc", PLAYER_COLORS[i % PLAYER_COLORS.length]);
  if (hostTip) {
    d.textContent = "◆";
    d.title = hostTip;
  }
  return d;
}

// L'hôte est toujours le siège 0.
export const dotFor = (i, t) => playerDot(i, i === 0 ? t("lobby.hostTip") : null);

const visibleSum = (p) =>
  p.grid.reduce((t, col) => t + (col ? col.reduce((x, c) => x + (c.up && c.v !== null ? c.v : 0), 0) : 0), 0);

// Marqueurs du tableau des scores (SVG inline, currentColor suit la ligne).
// Couronne : svgrepo.com (CC Attribution) ; crâne : path maison.
const CROWN_SVG = "<svg class='rank' viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path d='M12.8306 3.443C12.6449 3.16613 12.3334 3 12.0001 3C11.6667 3 11.3553 3.16613 11.1696 3.443L7.38953 9.07917L2.74781 3.85213C2.44865 3.51525 1.96117 3.42002 1.55723 3.61953C1.15329 3.81904 0.932635 4.26404 1.01833 4.70634L3.70454 18.5706C3.97784 19.9812 5.21293 21 6.64977 21H17.3504C18.7872 21 20.0223 19.9812 20.2956 18.5706L22.9818 4.70634C23.0675 4.26404 22.8469 3.81904 22.4429 3.61953C22.039 3.42002 21.5515 3.51525 21.2523 3.85213L16.6106 9.07917L12.8306 3.443Z'/></svg>";
const SKULL_SVG = "<svg class='rank' viewBox='0 0 600 600' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='m50 290c0-138.25 111.75-250 250-250 138.25 0 250 111.75 250 250 0 92.69-50.23 124.02-125 134.61v85.39c0 27.61-22.39 50-50 50h-150c-27.61 0-50-22.39-50-50v-85.39c-74.77-10.59-125-41.92-125-134.61zm225.49-22.04c14.31-53.42-6.5-105.27-46.56-116.01-40.07-10.73-84.02 23.77-98.33 77.18-14.31 53.42 6.5 105.27 46.56 116.01 40.06 10.73 84.02-23.77 98.33-77.18zm49.02 0c14.31 53.41 58.27 87.91 98.33 77.18 40.06-10.74 60.87-62.59 46.56-116.01-14.31-53.41-58.26-87.91-98.33-77.18-40.06 10.74-60.87 62.59-46.56 116.01z'/></svg>";

export function renderSidebar(view, myId, t) {
  const $ = (id) => document.getElementById(id);

  // Scores : somme visible de la manche + total.
  // Leader (total le plus bas) en gras/or + couronne, dernier marqué d'un crâne.
  // Pas de marqueur tant que tout le monde est à égalité.
  const scores = make("table", "stbl");
  const head = make("tr");
  head.append(make("th"), make("th", "", t("table.scoreRaw")), make("th", "", t("table.scoreTotal")));
  scores.append(head);
  const totals = view.players.map((p) => p.total);
  const min = Math.min(...totals), max = Math.max(...totals);
  const allEqual = totals.every((x) => x === totals[0]);
  view.players.forEach((p, i) => {
    const tr = make("tr");
    const name = make("td");
    name.append(dotFor(i, t), " ", p.name);
    if (!allEqual) {
      if (p.total === min) { tr.classList.add("best"); name.insertAdjacentHTML("beforeend", CROWN_SVG); }
      if (p.total === max) { tr.classList.add("worst"); name.insertAdjacentHTML("beforeend", SKULL_SVG); }
    }
    tr.append(name, make("td", "", visibleSum(p)), make("td", "", p.total));
    scores.append(tr);
  });
  $("side-scores").replaceChildren(scores);

  // Historique : une ligne par manche terminée (score compté, doublé en rouge).
  const hist = make("table", "stbl");
  const hh = make("tr");
  hh.append(make("th"));
  view.players.forEach((p, i) => {
    const th = make("th");
    th.append(dotFor(i, t));
    th.title = p.name;
    hh.append(th);
  });
  hist.append(hh);
  for (const h of view.history ?? []) {
    const tr = make("tr");
    tr.append(make("td", "", t("side.roundShort", { n: h.round })));
    h.final.forEach((v, i) => {
      const doubled = h.doubled && h.finisher === i;
      const td = make("td");
      if (doubled) {
        // Greedy puni : score de base (v/2, impair arrondi au sup.) + badge ×2,
        // plutôt que le total doublé en gras rouge peu explicite.
        td.append(`${v / 2 + (Math.abs(v) % 2) / 2} `, make("span", "dbl", t("side.doubled")));
      } else {
        td.textContent = v;
      }
      tr.append(td);
    });
    hist.append(tr);
  }
  $("side-history").replaceChildren(hist);

  // Joueurs dans l'ordre du tour, pastille de couleur, ▸ devant le joueur actif.
  $("side-players").replaceChildren(...view.players.map((p, i) => {
    const li = make("li", [view.current === i ? "active" : "", p.id === myId ? "me" : ""].join(" ").trim());
    li.append(make("span", "arrow", view.current === i ? "▸" : ""), dotFor(i, t), make("span", "pn", p.name));
    if (p.id === myId) li.append(make("span", "tag", t("lobby.you")));
    return li;
  }));

  // Infos de partie.
  let info = t("side.info", { round: view.round, score: view.targetScore });
  if (view.phase === "playing" && view.finisher !== null) {
    info += " " + t("side.lastRound", { name: view.players[view.finisher].name });
  }
  $("side-info").textContent = info;
}
