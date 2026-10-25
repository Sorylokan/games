// Table rendering (DOM) from a masked view. No rules here: actions go to the host,
// the view that comes back redraws everything.
import { layoutFor } from "../board-layout.js";
import { playerDot, dotFor } from "./sidebar.js";

const range = (v) => (v < 0 ? "n" : v === 0 ? "z" : v < 5 ? "l" : v < 9 ? "m" : "h");

// Fits card size to the play area so each seat fits its 3×3 cell.
// --k: opponent grid scale (70/60/50%), --u: your card size.
// 4.8 × 4.35 = seat width and height (grid + name + margins), in card units.
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

// Stable uid per grid slot, so the CSS flip survives re-renders.
const uid = (pi, c, r) => `p${pi}-${c}${r}`;
// Card state between renders, to replay flips.
let prevUp = new Map();
let nextUp = new Map();

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)");

const FLY_MS = 450;     // card flight duration
const FLIP_MS = 500;    // flip duration (same as .in in the CSS)
const COL_DELAY = 500;  // pause before a matching column leaves
const COL_STEP = 130;   // delay between the column's 3 cards

// Records position and state of every uid element before rendering.
function snapshot(boardEl) {
  const m = new Map();
  boardEl.querySelectorAll("[data-uid]").forEach((el) => {
    m.set(el.dataset.uid, { rect: el.getBoundingClientRect(), up: el.classList.contains("up"), face: faceOf(el) });
  });
  return m;
}

// Reads the face of a drawn card (value or hidden).
function faceOf(el) {
  const txt = el?.querySelector(".f")?.textContent;
  return txt ? { up: true, v: Number(txt) } : { up: false, v: null };
}

// Ghost card following a path: points = [{ rect, at }] (at in ms, first at 0). It stays at the last
// position until cleanup. flipAt: when it flips (it then starts face down).
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

// Plays the animations for engine events. Returns when (ms) neighbor columns may slide in.
function playEvents(events, prev, boardEl) {
  if (!events?.length || REDUCED.matches) return 0;
  const el = (id) => boardEl.querySelector(`[data-uid="${id}"]`);
  const was = (id) => prev.get(id)?.rect;
  const bag = [];            // ghosts to remove at the end
  const hidden = new Set();  // real cards hidden during the animation
  const hide = (node) => { node.style.visibility = "hidden"; hidden.add(node); };

  const removed = events.filter((e) => e.type === "columnRemoved");
  const hasPlay = events.some((e) => e.type === "swap" || e.type === "discardFlip");
  const top = el("discard-top");
  const topRect = top?.getBoundingClientRect();

  // Removed-column timeline: starts COL_DELAY after the first discarded card.
  const colStart = new Map();
  let colClock = hasPlay ? FLY_MS + COL_DELAY : COL_DELAY;
  let slideAt = 0;
  for (const r of removed) {
    colStart.set(`${r.player}-${r.col}`, colClock);
    slideAt = colClock + 2 * COL_STEP;
    colClock += 2 * COL_STEP + FLY_MS + 150;
  }
  let total = removed.length ? colClock : 0;
  const handled = new Set(); // column slots already animated by a move

  // Discard hidden until the end; the old top card stays visible as a ghost.
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
      // 1) the drawn card flies to the slot; if it completes a column, it waits there…
      if (slotRect && was("drawn-card")) {
        const pts = [{ rect: was("drawn-card"), at: 0 }, { rect: slotRect, at: FLY_MS }];
        if (start !== undefined && topRect) {
          const s = start + e.row * COL_STEP;
          pts.push({ rect: slotRect, at: s }, { rect: topRect, at: s + FLY_MS });
          handled.add(`${e.player}-${e.col}-${e.row}`);
        }
        ghostPath({ up: true, v: e.placed }, pts, { bag });
      }
      // 2) …while the replaced card goes to the discard pile.
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
      // A flipped card that completes a column is gone from the DOM: animate a flipping ghost.
      if (start !== undefined && topRect && was(id)) {
        const s = start + e.row * COL_STEP;
        ghostPath({ up: true, v: e.flipped }, [{ rect: was(id), at: 0 }, { rect: was(id), at: s }, { rect: topRect, at: s + FLY_MS }], { bag, flipAt: 150 });
        handled.add(`${e.player}-${e.col}-${e.row}`);
      }
      total = Math.max(total, FLY_MS);
    }
  }

  // Removed columns: cards stay, then leave one by one to the discard pile.
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

  // Cleanup: remove ghosts and show the real cards at the same time.
  setTimeout(() => {
    bag.forEach((g) => g.remove());
    hidden.forEach((n) => { n.style.visibility = ""; });
  }, total + 30);
  return slideAt;
}

// Remaining columns slide to fill a removed column's gap.
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
  // Starts in its previous state; renderTable flips it once in the page so the CSS transition plays.
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

// A player's grid: 4 columns of 3; removed columns (null) are skipped.
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

// Center: draw pile, discard, drawn card. renderTable adds the hint (panelEl) below.
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

  // Empty discard: show an empty slot.
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

  // Drawn card: clickable after drawing from the pile (discard it and flip a hidden card).
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

// Hint panel under the cards: current instruction, choices, end of round.
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
      // Took the discard: must swap.
      p.textContent = t("table.swapHint");
    } else if (ui.discardFlipMode) {
      // Discard-and-flip mode: click a hidden card to flip it.
      p.textContent = t("table.flipHint");
      const cancel = document.createElement("button");
      cancel.className = "ghost";
      cancel.textContent = t("table.cancel");
      cancel.addEventListener("click", () => { ui.discardFlipMode = false; refresh(); });
      p.append(" ", cancel);
    } else {
      // Drew from the pile: swap (click a card) or discard (click the drawn card).
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
    h.textContent = t("table.gameOver", { names: winnerNames(view) });
    p.append(h);
    // End screen closed to look at the table: a button reopens it.
    if (ui.endHidden) {
      const reopen = document.createElement("button");
      reopen.className = "ghost";
      reopen.textContent = t("end.results");
      reopen.addEventListener("click", () => { ui.endHidden = false; refresh(); });
      p.append(reopen);
    }
  }
  return p;
}

const winnerNames = (view) =>
  view.winners.map((id) => view.players.find((pl) => pl.id === id)?.name ?? id).join(" & ");

// Game-over screen over the table: ranking, rematch (host), view table, leave.
function endScreenEl(view, myId, ui, t, isHost, onRematch, refresh) {
  const wrap = document.createElement("div");
  wrap.className = "endscreen";
  const card = document.createElement("section");
  card.className = "end-card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-label", t("end.title"));

  const kicker = document.createElement("p");
  kicker.className = "end-kicker";
  kicker.textContent = `${t("end.title")} · ${t("end.rounds", { n: view.round })}`;
  const title = document.createElement("h2");
  title.textContent = t("table.gameOver", { names: winnerNames(view) });

  // Ranking: fewer points is better; ties share a rank.
  const ranked = view.players.map((pl, i) => ({ pl, i })).sort((a, b) => a.pl.total - b.pl.total);
  const list = document.createElement("ol");
  list.className = "end-rank";
  ranked.forEach(({ pl, i }) => {
    const li = document.createElement("li");
    if (view.winners.includes(pl.id)) li.classList.add("win");
    if (pl.id === myId) li.classList.add("me");
    const rank = document.createElement("span");
    rank.className = "pos";
    rank.textContent = 1 + ranked.findIndex((x) => x.pl.total === pl.total);
    const name = document.createElement("span");
    name.className = "pn";
    name.textContent = pl.name;
    const total = document.createElement("b");
    total.textContent = t("end.points", { n: pl.total });
    li.append(rank, dotFor(i, t), name, total);
    list.append(li);
  });

  const actions = document.createElement("div");
  actions.className = "end-actions";
  if (isHost) {
    const again = document.createElement("button");
    again.textContent = t("end.rematch");
    again.addEventListener("click", onRematch);
    actions.append(again);
  } else {
    const wait = document.createElement("p");
    wait.className = "muted";
    wait.textContent = t("end.waitHost");
    actions.append(wait);
  }
  const look = document.createElement("button");
  look.className = "ghost";
  look.textContent = t("end.showTable");
  look.addEventListener("click", () => { ui.endHidden = true; refresh(); });
  // Leave: back home (URL without #salle=…, so a clean reload).
  const quit = document.createElement("button");
  quit.className = "ghost";
  quit.textContent = t("end.quit");
  quit.addEventListener("click", () => { location.href = location.pathname; });
  actions.append(look, quit);

  card.append(kicker, title, list, actions);
  wrap.append(card);
  return wrap;
}

// Redraws the whole table. ui = { revealPicks: [[col,row]…], discardFlipMode, endHidden }.
export function renderTable(boardEl, panelSlot, view, myId, { t, isHost, ui, onAction, onNextRound, onRematch, events = [] }) {
  prevUp = nextUp;
  nextUp = new Map();
  const myIndex = view.players.findIndex((p) => p.id === myId);
  const myTurn = view.current === myIndex;
  const refresh = () => renderTable(boardEl, panelSlot, view, myId, { t, isHost, ui, onAction, onNextRound, onRematch });

  // Reset discard-and-flip mode when it no longer applies.
  if (view.phase !== "playing" || !myTurn || view.turn?.step !== "place" || view.turn.source !== "pile") {
    ui.discardFlipMode = false;
  }
  // The end screen reopens on every new game over.
  if (view.phase !== "gameOver") ui.endHidden = false;

  const prev = snapshot(boardEl);

  boardEl.innerHTML = "";
  for (const { index, cell } of layoutFor(view.players.length, myIndex)) {
    const player = view.players[index];
    const me = index === myIndex;
    // Which cards of MY grid are clickable, by phase.
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
        // Discard-and-flip: click a hidden card to flip it.
        if (ui.discardFlipMode) {
          return card.up ? {} : {
            clickable: true,
            onClick: () => {
              ui.discardFlipMode = false;
              onAction({ type: "discardFlip", col: c, row: r });
            },
          };
        }
        // Default: swap with any card.
        return { clickable: true, onClick: () => onAction({ type: "swap", col: c, row: r }) };
      }
      return {};
    };
    const seat = seatEl(player, index, {
      me,
      active: view.current === index,
      ready: view.phase === "reveal" && player.ready,
      isHost: index === 0, // p1 is always the host
      cardOpts,
      t,
    });
    seat.style.gridArea = `${cell[0]} / ${cell[1]}`;
    // Align left/right columns to their edge; the middle column to top/bottom; others centered.
    const [row, col] = cell;
    seat.style.justifySelf = col === 1 ? "start" : col === 3 ? "end" : "center";
    seat.style.alignSelf = col !== 2 ? "center" : row === 1 ? "start" : row === 3 ? "end" : "center";
    boardEl.append(seat);
  }
  const mid = midEl(view, myTurn, ui, t, onAction, refresh);
  mid.append(panelEl(view, myIndex, ui, t, onAction, onNextRound, isHost, refresh)); // hint under the cards
  boardEl.append(mid);
  if (view.phase === "gameOver" && !ui.endHidden) {
    const end = endScreenEl(view, myId, ui, t, isHost, onRematch, refresh);
    // Right after the last move: let the final flips play before the end screen.
    if (events.some((e) => e.type === "gameOver")) end.classList.add("late");
    boardEl.append(end);
  }
  void boardEl.offsetWidth; // force the start state to be computed
  boardEl.querySelectorAll(".card").forEach((b) => b.classList.toggle("up", b.dataset.up === "1"));
  fitBoard(view.players.length);

  // A swapped slot gets another card: no flip, it flies in.
  const swapped = new Set(events.filter((e) => e.type === "swap").map((e) => uid(e.player, e.col, e.row)));
  const flips = [...boardEl.querySelectorAll(".card.up[data-uid]")]
    .filter((el) => prev.get(el.dataset.uid)?.up === false && !swapped.has(el.dataset.uid));
  flips.forEach((el) => el.classList.remove("up"));
  if (flips.length) {
    void boardEl.offsetWidth; // force the start style
    requestAnimationFrame(() => requestAnimationFrame(() =>
      flips.forEach((el) => el.classList.add("up"))));
  }

  const slideAt = playEvents(events, prev, boardEl);
  slideColumns(events, prev, boardEl, slideAt);
}
