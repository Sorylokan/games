// Rendu de la table (DOM) depuis une vue masquée. Aucune règle ici (brief §7) :
// les actions partent vers l'hôte, la vue qui revient redessine tout.
// Mise en page et cartes reprises de la maquette Dev_Files/grid-of-greed-table.html.
import { layoutFor } from "../board-layout.js";
import { playerDot } from "./sidebar.js";

const range = (v) => (v < 0 ? "n" : v === 0 ? "z" : v < 5 ? "l" : v < 9 ? "m" : "h");

// Adapte la taille des cartes à la zone de jeu : chaque siège doit tenir dans sa zone 3x3.
// --k : réduction des grilles adverses (70/60/50 %), --u : taille de ta carte.
// 4,8 × 4,35 = largeur et hauteur d'un siège (grille + nom + marges), en unités de carte.
export function fitBoard(playerCount) {
  const k = playerCount <= 4 ? 0.7 : playerCount <= 6 ? 0.6 : 0.5;
  const board = document.getElementById("board");
  if (!board) return;
  const u = Math.max(14, Math.min(110,
    (board.clientWidth / 3 - 8) / 4.8,
    (board.clientHeight / 3 - 8) / 4.35));
  const style = document.documentElement.style;
  style.setProperty("--k", k);
  style.setProperty("--u", u + "px");
}

// uid stable par case de grille, pour que le flip CSS persiste entre deux rendus.
const uid = (pi, c, r) => `p${pi}-${c}${r}`;
// Mémoire des cartes entre deux rendus, pour rejouer le retournement.
let prevUp = new Map();
let nextUp = new Map();

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)");

const FLY_MS = 450;     // durée d'un vol de carte
const FLIP_MS = 500;    // durée d'un retournement (même valeur que .in dans le CSS)
const COL_DELAY = 500;  // pause avant que la colonne identique parte
const COL_STEP = 130;   // décalage entre les 3 cartes de la colonne

// Photographie (avant le rendu) la position et l'état de chaque élément à uid.
function snapshot(boardEl) {
  const m = new Map();
  boardEl.querySelectorAll("[data-uid]").forEach((el) => {
    m.set(el.dataset.uid, { rect: el.getBoundingClientRect(), up: el.classList.contains("up"), face: faceOf(el) });
  });
  return m;
}

// Lit la face d'une carte déjà dessinée (valeur visible ou carte cachée).
function faceOf(el) {
  const txt = el?.querySelector(".f")?.textContent;
  return txt ? { up: true, v: Number(txt) } : { up: false, v: null };
}

// Carte fantôme qui suit un parcours : points = [{ rect, at }] (at en ms, le premier à 0).
// Elle est posée à la dernière position et reste affichée jusqu'au nettoyage final.
// flipAt : instant (ms) où elle se retourne (elle démarre alors face cachée).
function ghostPath(card, points, { bag, flipAt = null }) {
  if (points.some((p) => !p.rect || !p.rect.width)) return null;
  const fin = points[points.length - 1].rect;
  const total = points[points.length - 1].at || 1;
  const g = cardEl(card);
  g.classList.add("flying");
  g.style.cssText = `--su:${fin.width}px;left:${fin.left}px;top:${fin.top}px`;
  if (flipAt !== null) {
    g.classList.remove("up");
    setTimeout(() => g.classList.add("up"), flipAt);
  }
  document.body.append(g);
  bag.push(g);
  const tf = (r) => `translate(${r.left - fin.left}px, ${r.top - fin.top}px) scale(${r.width / fin.width})`;
  g.animate(
    points.map((p) => ({ transform: tf(p.rect), offset: p.at / total, easing: "ease-in-out" })),
    { duration: total, fill: "both" }
  );
  return g;
}

// Joue les animations correspondant aux événements du moteur.
// Renvoie l'instant (ms) où les colonnes voisines peuvent se rapprocher.
function playEvents(events, prev, boardEl) {
  if (!events?.length || REDUCED.matches) return 0;
  const el = (id) => boardEl.querySelector(`[data-uid="${id}"]`);
  const was = (id) => prev.get(id)?.rect;
  const bag = [];            // cartes fantômes à retirer à la fin
  const hidden = new Set();  // vraies cartes masquées pendant l'animation
  const hide = (node) => { node.style.visibility = "hidden"; hidden.add(node); };

  const removed = events.filter((e) => e.type === "columnRemoved");
  const hasPlay = events.some((e) => e.type === "swap" || e.type === "discardFlip");
  const top = el("discard-top");
  const topRect = top?.getBoundingClientRect();

  // Calendrier des colonnes retirées : COL_DELAY après la carte défaussée en premier.
  const colStart = new Map();
  let colClock = hasPlay ? FLY_MS + COL_DELAY : COL_DELAY;
  let slideAt = 0;
  for (const r of removed) {
    colStart.set(`${r.player}-${r.col}`, colClock);
    slideAt = colClock + 2 * COL_STEP;
    colClock += 2 * COL_STEP + FLY_MS + 150;
  }
  let total = removed.length ? colClock : 0;
  const handled = new Set(); // cases de colonne déjà prises en charge par un coup

  // Défausse masquée jusqu'à la fin : l'ancienne carte du dessus reste visible en fantôme.
  if (removed.length && top) {
    hide(top);
    const old = prev.get("discard-top");
    if (old?.face.up) ghostPath(old.face, [{ rect: topRect, at: 0 }, { rect: topRect, at: 1 }], { bag });
  }

  for (const e of events) {
    if (e.type === "drawPile") {
      const target = el("drawn-card");
      if (!target || !was("draw-pile")) continue;
      const face = faceOf(target);
      const fin = target.getBoundingClientRect();
      target.style.visibility = "hidden";
      const g = ghostPath({ up: false, v: null }, [{ rect: was("draw-pile"), at: 0 }, { rect: fin, at: FLY_MS }], { bag });
      setTimeout(() => {
        g?.remove();
        if (face.up) {
          const inner = target.querySelector(".in");
          inner.style.transition = "none";
          target.classList.remove("up");
          void inner.offsetWidth;
          inner.style.transition = "";
          target.style.visibility = "";
          requestAnimationFrame(() => target.classList.add("up"));
        } else {
          target.style.visibility = "";
        }
      }, FLY_MS);
      total = Math.max(total, FLY_MS + FLIP_MS);
    } else if (e.type === "drawDiscard") {
      const target = el("drawn-card");
      if (target && was("discard-top")) {
        hide(target);
        ghostPath({ up: true, v: e.value }, [{ rect: was("discard-top"), at: 0 }, { rect: target.getBoundingClientRect(), at: FLY_MS }], { bag });
      }
      total = Math.max(total, FLY_MS);
    } else if (e.type === "swap") {
      const id = uid(e.player, e.col, e.row);
      const start = colStart.get(`${e.player}-${e.col}`);
      const slot = el(id);
      const slotRect = slot ? slot.getBoundingClientRect() : was(id);
      if (slot) hide(slot);
      // 1) la carte piochée vole vers la case ; si elle complète une colonne, elle y attend...
      if (slotRect && was("drawn-card")) {
        const pts = [{ rect: was("drawn-card"), at: 0 }, { rect: slotRect, at: FLY_MS }];
        if (start !== undefined && topRect) {
          const s = start + e.row * COL_STEP;
          pts.push({ rect: slotRect, at: s }, { rect: topRect, at: s + FLY_MS });
          handled.add(`${e.player}-${e.col}-${e.row}`);
        }
        ghostPath({ up: true, v: e.placed }, pts, { bag });
      }
      // 2) ...pendant que la carte remplacée part à la défausse.
      if (topRect && was(id)) {
        ghostPath({ up: true, v: e.replaced }, [{ rect: was(id), at: 0 }, { rect: topRect, at: FLY_MS }], { bag });
      }
      if (top && !removed.length) hide(top);
      total = Math.max(total, FLY_MS);
    } else if (e.type === "discardFlip") {
      const id = uid(e.player, e.col, e.row);
      const start = colStart.get(`${e.player}-${e.col}`);
      if (topRect && was("drawn-card")) {
        ghostPath({ up: true, v: e.discarded }, [{ rect: was("drawn-card"), at: 0 }, { rect: topRect, at: FLY_MS }], { bag });
      }
      if (top && !removed.length) hide(top);
      // Si la carte retournée complète une colonne, elle n'existe plus à l'écran : fantôme qui se retourne.
      if (start !== undefined && topRect && was(id)) {
        const s = start + e.row * COL_STEP;
        ghostPath({ up: true, v: e.flipped }, [{ rect: was(id), at: 0 }, { rect: was(id), at: s }, { rect: topRect, at: s + FLY_MS }], { bag, flipAt: 150 });
        handled.add(`${e.player}-${e.col}-${e.row}`);
      }
      total = Math.max(total, FLY_MS);
    }
  }

  // Colonnes retirées : les cartes restent en place, puis partent une à une vers la défausse.
  for (const r of removed) {
    const start = colStart.get(`${r.player}-${r.col}`);
    for (let row = 0; row < 3; row++) {
      if (handled.has(`${r.player}-${r.col}-${row}`)) continue;
      const rect = was(uid(r.player, r.col, row));
      if (!rect || !topRect) continue;
      const s = start + row * COL_STEP;
      ghostPath({ up: true, v: r.value }, [{ rect, at: 0 }, { rect, at: s }, { rect: topRect, at: s + FLY_MS }], { bag });
    }
  }

  // Nettoyage : on retire les fantômes et on réaffiche les vraies cartes en même temps.
  setTimeout(() => {
    bag.forEach((g) => g.remove());
    hidden.forEach((n) => { n.style.visibility = ""; });
  }, total + 30);
  return slideAt;
}

// Les colonnes restantes glissent pour combler le vide d'une colonne retirée.
function slideColumns(events, prev, boardEl, delay = 0) {
  if (REDUCED.matches || !events.some((e) => e.type === "columnRemoved")) return;
  boardEl.querySelectorAll(".card[data-uid^='p']").forEach((el) => {
    const before = prev.get(el.dataset.uid)?.rect;
    if (!before) return;
    const after = el.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    el.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
      { duration: 350, delay, easing: "ease-in-out", fill: "backwards" }
    );
  });
}

function cardEl(card, { uid: id, clickable = false, picked = false, onClick = null } = {}) {
  const b = document.createElement("button");
  b.type = "button";
  // La carte démarre dans son état du rendu précédent ; renderTable la bascule
  // ensuite, une fois insérée dans la page, pour que la transition CSS joue.
  const startUp = id ? (prevUp.get(id) ?? (id === "drawn-card" ? false : card.up)) : card.up;
  if (id) nextUp.set(id, card.up);
  b.className = "card" + (startUp ? " up" : "") + (picked ? " pick" : "");
  b.dataset.up = card.up ? "1" : "0";
  b.dataset.r = range(card.v ?? 0);
  if (id) b.dataset.uid = id;
  const known = card.up && card.v !== null;
  b.setAttribute("aria-label", known ? `Carte ${card.v}` : "Carte cachée");
  b.innerHTML = `<span class="in"><span class="b"></span><span class="f">${known ? card.v : ""}</span></span>`;
  if (clickable && onClick) {
    b.classList.add("can");
    b.addEventListener("click", onClick);
  } else {
    b.tabIndex = -1;
  }
  return b;
}

// Grille d'un joueur : 4 colonnes de 3 ; colonne retirée (null) = ignorée.
function gridEl(player, pi, cardOpts = () => ({})) {
  const g = document.createElement("div");
  g.className = "grid";
  player.grid.forEach((col, c) => {
    if (!col) return;
    col.forEach((card, r) => g.append(cardEl(card, { uid: uid(pi, c, r), ...cardOpts(c, r, card) })));
  });
  return g;
}

function seatEl(player, pi, { me = false, active = false, ready = false, isHost = false, cardOpts, t }) {
  const s = document.createElement("div");
  s.className = "seat" + (me ? " me" : "") + (active ? " active" : "");
  const meta = document.createElement("div");
  meta.className = "meta";
  const name = document.createElement("b");
  name.textContent = player.name;
  const score = document.createElement("span");
  score.textContent = player.total;
  meta.append(playerDot(pi, isHost ? t("lobby.hostTip") : null), name, score);
  if (ready) {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = t("table.ready");
    meta.append(tag);
  }
  s.append(meta, gridEl(player, pi, cardOpts));
  return s;
}

// Centre : pioche/défausse/carte piochée. La consigne (panelEl) est ajoutée
// sous les cartes par renderTable, dans la même case de la grille.
function midEl(view, myTurn, ui, t, onAction, refresh) {
  const m = document.createElement("div");
  m.className = "mid";

  const cardsWrap = document.createElement("div");
  cardsWrap.className = "cards";

  const pile = cardEl({ up: false, v: null }, {
    uid: "draw-pile",
    clickable: myTurn && view.turn?.step === "draw" && (view.drawCount > 0 || view.discard.length > 1),
    onClick: () => onAction({ type: "drawPile" }),
  });
  const pileWrap = document.createElement("div");
  pileWrap.className = "pile";
  const count = document.createElement("span");
  count.className = "count";
  count.textContent = view.drawCount;
  pileWrap.append(pile, count);

  // Défausse : case vide si elle est vide (début de partie avant la 1re carte).
  const topDiscard = view.discard.at(-1);
  if (topDiscard === undefined) {
    const empty = document.createElement("div");
    empty.className = "hole";
    cardsWrap.append(pileWrap, empty);
  } else {
    cardsWrap.append(pileWrap, cardEl({ up: true, v: topDiscard }, {
      uid: "discard-top",
      clickable: myTurn && view.turn?.step === "draw",
      onClick: () => onAction({ type: "drawDiscard" }),
    }));
  }

  // Carte piochée : visible pour moi. Cliquable si j'ai pioché dans la pioche
  // (défausser + retourner une carte cachée). Sinon juste indicative.
  if (view.turn?.step === "place") {
    const canDiscardFlip = myTurn && view.turn.source === "pile" && view.turn.drawn !== null;
    const drawn = cardEl({ up: view.turn.drawn !== null, v: view.turn.drawn }, {
      uid: "drawn-card",
      clickable: canDiscardFlip,
      onClick: canDiscardFlip ? () => { ui.discardFlipMode = true; refresh(); } : null,
    });
    drawn.classList.add("drawn");
    cardsWrap.append(drawn);
  }
  m.append(cardsWrap);
  return m;
}

// Panneau contextuel sous la table : consigne du moment, choix, fins de manche.
function panelEl(view, myIndex, ui, t, onAction, onNextRound, isHost, refresh) {
  const p = document.createElement("div");
  p.className = "tpanel";
  const me = view.players[myIndex];
  const myTurn = view.current === myIndex;

  if (view.phase === "reveal") {
    if (me.ready) {
      p.textContent = t("table.waitingReveal");
    } else {
      p.textContent = t("table.revealHint", { count: ui.revealPicks.length });
      if (ui.revealPicks.length === 2) {
        const ok = document.createElement("button");
        ok.textContent = t("table.confirm");
        ok.addEventListener("click", () => {
          const slots = ui.revealPicks.map(([col, row]) => ({ col, row }));
          ui.revealPicks = [];
          onAction({ type: "initialReveal", slots });
        });
        p.append(" ", ok);
      }
    }
    return p;
  }

  if (view.phase === "playing") {
    if (!myTurn) {
      p.textContent = t("table.turnOf", { name: view.players[view.current].name });
    } else if (view.turn.step === "draw") {
      p.textContent = t("table.drawHint");
    } else if (view.turn.source === "discard") {
      // Pioche de la défausse : obligatoirement échanger avec une carte visible.
      p.textContent = t("table.swapHint");
    } else if (ui.discardFlipMode) {
      // Mode défausser+retourner actif : cliquer une carte cachée pour l'envoyer
      // à la défausse et retourner celle-ci.
      p.textContent = t("table.flipHint");
      const cancel = document.createElement("button");
      cancel.className = "ghost";
      cancel.textContent = t("table.cancel");
      cancel.addEventListener("click", () => { ui.discardFlipMode = false; refresh(); });
      p.append(" ", cancel);
    } else {
      // Pioche normale : échanger (clic carte) ou défausser (clic carte piochée).
      p.textContent = t("table.placeHint");
    }
    return p;
  }

  if (view.phase === "roundOver") {
    p.append(t("table.roundOver"));
    if (isHost) {
      const next = document.createElement("button");
      next.textContent = t("table.nextRound");
      next.addEventListener("click", onNextRound);
      p.append(next);
    }
    return p;
  }

  if (view.phase === "gameOver") {
    const h = document.createElement("h3");
    const names = view.winners.map((id) => view.players.find((pl) => pl.id === id)?.name ?? id);
    h.textContent = t("table.gameOver", { names: names.join(" & ") });
    p.append(h);
  }
  return p;
}

// Redessine toute la table. ui = { revealPicks: [[col,row]...], discardFlipMode: bool }.
export function renderTable(boardEl, panelSlot, view, myId, { t, isHost, ui, onAction, onNextRound, events = [] }) {
  prevUp = nextUp;
  nextUp = new Map();
  const myIndex = view.players.findIndex((p) => p.id === myId);
  const myTurn = view.current === myIndex;
  const refresh = () => renderTable(boardEl, panelSlot, view, myId, { t, isHost, ui, onAction, onNextRound });

  // Réinitialise le mode défausser+retourner quand ce n'est plus pertinent.
  if (view.phase !== "playing" || !myTurn || view.turn?.step !== "place" || view.turn.source !== "pile") {
    ui.discardFlipMode = false;
  }

  const prev = snapshot(boardEl);

  boardEl.innerHTML = "";
  for (const { index, cell } of layoutFor(view.players.length, myIndex)) {
    const player = view.players[index];
    const me = index === myIndex;
    // Quelles cartes de MA grille sont cliquables, selon la phase.
    const cardOpts = (c, r, card) => {
      if (!me) return {};
      if (view.phase === "reveal" && !player.ready && !card.up) {
        const picked = ui.revealPicks.some(([pc, pr]) => pc === c && pr === r);
        return {
          picked,
          clickable: picked || ui.revealPicks.length < 2,
          onClick: () => {
            ui.revealPicks = picked
              ? ui.revealPicks.filter(([pc, pr]) => !(pc === c && pr === r))
              : [...ui.revealPicks, [c, r]];
            refresh();
          },
        };
      }
      if (view.phase === "playing" && myTurn && view.turn?.step === "place") {
        // Mode défausser+retourner : cliquer une carte cachée pour la retourner.
        if (ui.discardFlipMode) {
          return card.up ? {} : {
            clickable: true,
            onClick: () => {
              ui.discardFlipMode = false;
              onAction({ type: "discardFlip", col: c, row: r });
            },
          };
        }
        // Par défaut (pioche normale) : échanger avec n'importe quelle carte.
        return { clickable: true, onClick: () => onAction({ type: "swap", col: c, row: r }) };
      }
      return {};
    };
    const seat = seatEl(player, index, {
      me,
      active: view.current === index,
      ready: view.phase === "reveal" && player.ready,
      isHost: index === 0, // p1 = toujours l'hôte
      cardOpts,
      t,
    });
    seat.style.gridArea = `${cell[0]} / ${cell[1]}`;
    // Alignement dans la zone : colonne gauche collée à gauche, droite collée à droite.
    // Colonne centrale : haut en haut, bas en bas. Les autres sont centrés verticalement.
    const [row, col] = cell;
    seat.style.justifySelf = col === 1 ? "start" : col === 3 ? "end" : "center";
    seat.style.alignSelf = col !== 2 ? "center" : row === 1 ? "start" : row === 3 ? "end" : "center";
    boardEl.append(seat);
  }
  const mid = midEl(view, myTurn, ui, t, onAction, refresh);
  mid.append(panelEl(view, myIndex, ui, t, onAction, onNextRound, isHost, refresh)); // consigne sous les cartes
  boardEl.append(mid);
  void boardEl.offsetWidth; // force le navigateur à calculer l'état de départ
  boardEl.querySelectorAll(".card").forEach((b) => b.classList.toggle("up", b.dataset.up === "1"));
  fitBoard(view.players.length);

  // Une case échangée reçoit une autre carte : pas de flip, elle arrive en vol.
  const swapped = new Set(events.filter((e) => e.type === "swap").map((e) => uid(e.player, e.col, e.row)));
  const flips = [...boardEl.querySelectorAll(".card.up[data-uid]")]
    .filter((el) => prev.get(el.dataset.uid)?.up === false && !swapped.has(el.dataset.uid));
  flips.forEach((el) => el.classList.remove("up"));
  if (flips.length) {
    void boardEl.offsetWidth; // force le calcul du style de départ
    requestAnimationFrame(() => requestAnimationFrame(() =>
      flips.forEach((el) => el.classList.add("up"))));
  }

  const slideAt = playEvents(events, prev, boardEl);
  slideColumns(events, prev, boardEl, slideAt);
}
