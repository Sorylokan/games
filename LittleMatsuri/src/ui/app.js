// Little Matsuri UI: draws the grid and asks the rules (src/game/) for everything else.
import { SIZES, EMPTY, LANTERN, CROSS, tap, rightClick, conflicts, isSolved, autoCrosses } from "../game/rules.js";
import { generate } from "../game/generator.js";
import { HINTS_PER_GRID, HINT_COOLDOWN_MS, possibleCells, hint, applyHint } from "../game/hints.js";
import { loadTranslator, initialLocale, saveLocale, applyTexts, fillLangSelect } from "../i18n.js";

const $ = (id) => document.getElementById(id);
const boardEl = $("board");

let t = (key) => key;
let locale = initialLocale();

// game = { n, regions, marks, possible, wrong: Set of red lanterns, hintsLeft, hintReadyAt, won }
let game = null;

// Same lantern as assets/icon.svg (same coordinates), cropped to the lantern.
const PETAL = "M0 -0.1C-0.42 -0.35 -0.4 -0.9 -0.12 -0.98L0 -0.82L0.12 -0.98C0.4 -0.9 0.42 -0.35 0 -0.1z";
const LANTERN_SVG =
  '<svg viewBox="128 48 256 424" aria-hidden="true">' +
  '<path class="string" d="M256 52v52M256 430v18"/>' +
  '<ellipse class="body" cx="256" cy="265" rx="118" ry="148"/>' +
  '<path class="ribs" d="M165 170h182M144 218h224M145 314h222M167 362h178"/>' +
  `<g class="flower" transform="translate(256 265) scale(62)">${[0, 72, 144, 216, 288].map((a) => `<path d="${PETAL}" transform="rotate(${a})"/>`).join("")}<circle class="heart" r="0.14"/></g>` +
  '<rect class="cap" x="188" y="100" width="136" height="30" rx="10"/><rect class="cap" x="188" y="400" width="136" height="30" rx="10"/>' +
  '<path class="cap" d="M244 448h24l-4 20h-16z"/>' +
  "</svg>";

// ---- Games ----

function start(n) {
  const g = generate(n);
  game = {
    n, regions: g.regions, marks: new Array(n * n).fill(EMPTY), possible: possibleCells(n, g.regions),
    wrong: new Set(), hintsLeft: HINTS_PER_GRID, hintReadyAt: 0, won: false,
  };
  $("win").hidden = true;
  buildBoard();
  render();
}

function play(i, next) {
  if (game.won) return;
  game.marks[i] = next(game.marks[i]);
  game.wrong.delete(i);
  if (isSolved(game.n, game.regions, game.marks)) {
    game.won = true;
    setTimeout(showWin, 900); // time for the lanterns to light up
  }
  render();
}

function useHint() {
  if (game.won || game.hintsLeft === 0 || Date.now() < game.hintReadyAt) return;
  // Lines already crossed on screen (automatic crosses included) aren't worth a hint.
  const h = hint(game.n, game.regions, shownMarks().marks, Math.random, game.possible);
  if (!h) return;
  game.marks = applyHint(game.marks, h);
  h.wrong.forEach((i) => game.wrong.add(i));
  game.hintsLeft--;
  game.hintReadyAt = Date.now() + HINT_COOLDOWN_MS;
  render();
  boardEl.querySelectorAll(h.crosses.map((i) => `[data-i="${i}"]`).join(",")).forEach((b) => {
    b.classList.remove("hinted");
    void b.offsetWidth; // restarts the flash animation
    b.classList.add("hinted");
  });
}

function showWin() {
  const { n } = game;
  const next = SIZES.find((s) => s > n);
  $("win-next").hidden = !next;
  if (next) $("win-next").textContent = t("win.next", { size: `${next}×${next}` });
  $("win-again").textContent = t("win.again", { size: `${n}×${n}` });
  $("win").hidden = false;
}

// ---- Drawing ----

// Thick borders only where the district changes, so each district reads as one shape.
function buildBoard() {
  const { n, regions } = game;
  boardEl.style.setProperty("--n", n);
  boardEl.innerHTML = "";
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n, b = document.createElement("button");
    b.type = "button";
    b.className = "cell";
    b.dataset.i = i;
    b.style.setProperty("--region", `var(--r${regions[i]})`);
    if (r === 0 || regions[i - n] !== regions[i]) b.classList.add("edge-t");
    if (r === n - 1 || regions[i + n] !== regions[i]) b.classList.add("edge-b");
    if (c === 0 || regions[i - 1] !== regions[i]) b.classList.add("edge-l");
    if (c === n - 1 || regions[i + 1] !== regions[i]) b.classList.add("edge-r");
    boardEl.append(b);
  }
  $("sizes").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.n) === n)));
}

// What the player sees: their marks, plus the crosses their lanterns imply.
function shownMarks() {
  const auto = autoCrosses(game.n, game.regions, game.marks);
  return { auto, marks: game.marks.map((m, i) => (auto.has(i) ? CROSS : m)) };
}

function render() {
  const { n } = game;
  const { auto, marks } = shownMarks();
  const bad = conflicts(n, game.regions, marks);
  boardEl.classList.toggle("won", game.won);
  for (const b of boardEl.children) {
    const i = Number(b.dataset.i), m = marks[i];
    if (b.dataset.mark !== String(m)) {
      b.dataset.mark = m;
      b.innerHTML = m === LANTERN ? LANTERN_SVG : m === CROSS ? '<span class="x" aria-hidden="true">✕</span>' : "";
    }
    b.classList.toggle("auto", auto.has(i));
    b.classList.toggle("bad", bad.has(i));
    b.classList.toggle("wrong", game.wrong.has(i));
    const what = m === LANTERN ? `, ${t("ui.cellLantern")}` : m === CROSS ? `, ${t("ui.cellCross")}` : "";
    b.setAttribute("aria-label", t("ui.cell", { row: Math.floor(i / n) + 1, col: (i % n) + 1 }) + what);
  }
  renderHint(marks);
}

// Called every second too, for the countdown.
function renderHint(marks = shownMarks().marks) {
  const btn = $("hint"), wait = game.hintReadyAt - Date.now();
  const nothingLeft = marks.every((m, i) => game.possible.has(i) || m === CROSS);
  btn.disabled = game.won || game.hintsLeft === 0 || wait > 0 || nothingLeft;
  if (game.hintsLeft === 0) btn.textContent = t("ui.hintNone");
  else if (wait > 0) {
    const s = Math.ceil(wait / 1000);
    btn.textContent = t("ui.hintWait", { time: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` });
  } else if (nothingLeft) btn.textContent = t("ui.hintUseless");
  else btn.textContent = t("ui.hint", { n: game.hintsLeft });
}

// ---- Setup ----

async function init() {
  t = await loadTranslator(locale);
  document.documentElement.lang = locale;
  applyTexts(t);

  fillLangSelect($("lang"), locale);
  $("lang").addEventListener("change", async () => {
    locale = $("lang").value;
    saveLocale(locale);
    t = await loadTranslator(locale);
    document.documentElement.lang = locale;
    applyTexts(t);
    render();
    if (!$("win").hidden) showWin();
  });

  $("sizes").innerHTML = SIZES.map((n) => `<button type="button" class="ghost" data-n="${n}">${n}×${n}</button>`).join("");
  $("sizes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-n]");
    if (b) start(Number(b.dataset.n));
  });

  boardEl.addEventListener("click", (e) => {
    const b = e.target.closest(".cell");
    if (b) play(Number(b.dataset.i), tap);
  });
  boardEl.addEventListener("contextmenu", (e) => {
    const b = e.target.closest(".cell");
    if (!b) return;
    e.preventDefault();
    play(Number(b.dataset.i), rightClick);
  });

  $("hint").addEventListener("click", useHint);
  $("new").addEventListener("click", () => start(game.n));
  $("restart").addEventListener("click", () => {
    if (game.won) return;
    game.marks.fill(EMPTY);
    game.wrong.clear();
    render();
  });
  $("win-again").addEventListener("click", () => start(game.n));
  $("win-next").addEventListener("click", () => start(SIZES.find((s) => s > game.n)));
  setInterval(() => { if (game) renderHint(); }, 1000);

  start(SIZES[0]);
}

init().catch((err) => console.error("Little Matsuri failed to start:", err));
