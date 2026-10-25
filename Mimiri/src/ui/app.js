// Mimiri UI: wires the engine to the page and applies the active theme.
import { SIZES, DAILY_SIZE, applyPress, isSolved, countOn, scramble, dailyGrid, dayKey, touchedBy } from "../game/engine.js";
import { THEMES } from "../themes/index.js";
import { getPref, setPref, getJSON, setJSON } from "./prefs.js";
import { loadTranslator, initialLocale, saveLocale, applyTexts, fillLangSelect } from "../i18n.js";

const $ = (id) => document.getElementById(id);
const boardEl = $("board");
const themeSelect = $("opt-theme");
const langSelect = $("opt-lang");

let game = null; // { mode, n, cells, initial, moves, won, newRecord, key }
let T = null;    // active theme module (render)
let t = (key) => key; // UI translator (set by loadMessages)
let locale = initialLocale();

// ---- Language ----

async function loadMessages() {
  t = await loadTranslator(locale);
}

const tt = (field) => t(`theme.${currentThemeId}.${field}`);

function applyThemeTexts() {
  const title = t(`theme.${currentThemeId}`);
  document.title = `Mimiri – ${title}`;
  $("title").textContent = title;
  $("goal").textContent = tt("goal");
  $("hint").textContent = tt("hint");
  $("left-label").textContent = tt("leftLabel");
}

// UI texts (not theme-specific): data-i18n* attributes, plus theme names in the select.
function applyI18n() {
  document.documentElement.lang = locale;
  applyTexts(t);
  themeSelect.querySelectorAll("option[value]").forEach((opt) => {
    opt.textContent = opt.value === "chaos" ? t("ui.chaos") : t(`theme.${opt.value}`);
  });
}

// ---- Records (fewest moves per grid size and per day) ----
const bestFor = (key) => getJSON("best", {})[key] ?? "–";
function saveBest(key, moves) {
  const all = getJSON("best", {});
  if (all[key] !== undefined && all[key] <= moves) return false;
  all[key] = moves;
  setJSON("best", all);
  return true;
}

// ---- Games ----
const persist = () => setJSON("save", game); // resume after leaving

function newGame(mode, n, cells, key) {
  game = { mode, n, cells, initial: [...cells], moves: 0, won: false, newRecord: false, key };
  buildBoard(); render(); persist();
}
const startFree = (n) => newGame("free", n, scramble(n).cells, "size-" + n);
const startDaily = () => { const day = dayKey(); newGame("daily", DAILY_SIZE, dailyGrid(day), "daily-" + day); };

function resetGame() {
  game.cells = [...game.initial];
  game.moves = 0;
  game.won = false;
  game.newRecord = false;
  render(); persist();
}

function restore() {
  const g = getJSON("save", null);
  if (!g || !Array.isArray(g.cells) || !SIZES.includes(g.n) || g.cells.length !== g.n * g.n) return null;
  if (g.mode === "daily" && g.key !== "daily-" + dayKey()) return null; // yesterday's challenge has expired
  return g;
}

function press(i) {
  if (game.won) return;
  applyPress(game.cells, game.n, i);
  game.moves++;
  if (isSolved(game.cells)) {
    game.won = true;
    game.newRecord = saveBest(game.key, game.moves);
  }
  render(i); persist();
  // Chaos mode: a new theme on every move (looks only). Frozen once won.
  if (chaosActive && !game.won) applyTheme("chaos");
}

// ---- Rendering ----
function buildBoard() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${game.n}, 1fr)`;
  for (let i = 0; i < game.n * game.n; i++) {
    const b = document.createElement("button");
    b.className = "cell";
    b.dataset.state = "";
    b.addEventListener("click", () => press(i));
    boardEl.appendChild(b);
  }
}

// `pressed`: clicked cell (animates the affected cells); omitted for a plain redraw.
function render(pressed) {
  const touched = new Set(pressed === undefined ? [] : touchedBy(game.n, pressed));
  game.cells.forEach((v, i) => {
    const b = boardEl.children[i];
    const state = v ? "on" : "off"; // on = to fix, off = solved
    if (b.dataset.state === state) return;
    b.dataset.state = state;
    b.className = "cell " + state;
    b.innerHTML = T.render(!!v, i);
    b.setAttribute("aria-label", tt(v ? "ariaOn" : "ariaOff"));
    if (touched.has(i)) {
      b.classList.add("pop");
      setTimeout(() => b.classList.remove("pop"), 320);
    }
  });

  boardEl.classList.toggle("locked", game.won);
  $("moves").textContent = game.moves;
  $("left").textContent = countOn(game.cells);
  $("best").textContent = bestFor(game.key);

  const msg = $("message");
  if (game.won) {
    msg.className = "win";
    msg.textContent = `${tt("win")}${game.newRecord ? " " + t("ui.newRecord") : ""} (${t("ui.movesCount", { n: game.moves })})`;
  } else {
    msg.className = "";
    msg.textContent = game.mode === "daily" ? t("ui.dailyNote") : "";
  }

  document.querySelectorAll("#sizes .pill").forEach((p) => {
    p.classList.toggle("active", game.mode === "free" && Number(p.dataset.n) === game.n);
  });
  $("btn-daily").classList.toggle("active", game.mode === "daily");
}

// ---- Theme (class on <body> + its own stylesheet) ----
const themeLink = document.createElement("link");
themeLink.rel = "stylesheet";
document.head.append(themeLink);

// Old French theme ids → new ones (renamed 2026-10), so saved choices still work.
const LEGACY_THEME_IDS = { chatons: "kittens", chiots: "puppies", grincheux: "grumpy", jardin: "garden" };
const savedTheme = LEGACY_THEME_IDS[getPref("theme")] ?? getPref("theme", THEMES[0].id);

let themeSeq = 0; // a fast theme switch must not be overwritten by a slower one
let chaosActive = false;   // chaos mode: new theme on every move
let currentThemeId = null; // theme actually shown (changes all the time in chaos mode)

// id === "chaos": pseudo-theme (not in THEMES) picking a random theme, different from the last one.
async function applyTheme(id) {
  chaosActive = id === "chaos";
  const pool = THEMES.filter((th) => th.id !== currentThemeId);
  const def = chaosActive
    ? pool[Math.floor(Math.random() * pool.length)]
    : THEMES.find((th) => th.id === id) ?? THEMES[0];
  const seq = ++themeSeq;
  const mod = await def.load();
  if (seq !== themeSeq) return;
  T = mod.default;
  currentThemeId = def.id;
  setPref("theme", chaosActive ? "chaos" : def.id); // "chaos" survives a reload

  document.body.classList.remove(...[...document.body.classList].filter((c) => c.startsWith("theme-")));
  document.body.classList.add(`theme-${def.id}`);
  themeLink.href = def.css;
  themeSelect.value = chaosActive ? "chaos" : def.id;

  applyThemeTexts();

  if (game) { // force a redraw of every cell
    for (const b of boardEl.children) b.dataset.state = "";
    render();
  }
}

// ---- Startup ----
async function init() {
  await loadMessages();
  applyI18n();

  themeSelect.innerHTML = THEMES.map((th) => `<option value="${th.id}">${t(`theme.${th.id}`)}</option>`).join("");
  themeSelect.insertAdjacentHTML("beforeend", `<option value="chaos">${t("ui.chaos")}</option>`);
  themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));

  fillLangSelect(langSelect, locale);
  langSelect.addEventListener("change", async () => {
    locale = langSelect.value;
    saveLocale(locale);
    await loadMessages();
    applyI18n();
    if (T) {
      applyThemeTexts();
      if (game) { // redraw everything: aria-labels and message in the new language
        for (const b of boardEl.children) b.dataset.state = "";
        render();
      }
    }
  });

  $("sizes").innerHTML = SIZES.map((n) => `<button type="button" class="pill" data-n="${n}">${n}×${n}</button>`).join("");
  $("sizes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-n]");
    if (b) startFree(Number(b.dataset.n));
  });

  $("btn-new").addEventListener("click", () => startFree(game.mode === "daily" ? DAILY_SIZE : game.n));
  $("btn-reset").addEventListener("click", resetGame);
  $("btn-daily").addEventListener("click", startDaily);

  await applyTheme(savedTheme);

  const saved = restore();
  if (saved) { game = saved; buildBoard(); render(); }
  else startFree(4);
}

init().catch((err) => {
  console.error("Impossible de démarrer Mimiri :", err);
  $("message").textContent = t("ui.loadError");
});
