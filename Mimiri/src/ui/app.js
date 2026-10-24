// Interface de Mimiri : branche le moteur (src/game/engine.js) sur la page
// et applique le thème actif (src/themes/*.js + src/ui/theme-*.css).
import { SIZES, DAILY_SIZE, applyPress, isSolved, countOn, scramble, dailyGrid, dayKey, touchedBy } from "../game/engine.js";
import { THEMES } from "../themes/index.js";
import { getPref, setPref, getJSON, setJSON } from "./prefs.js";
import { createTranslator, loadLocale, getLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from "../i18n.js";

const $ = (id) => document.getElementById(id);
const boardEl = $("board");
const themeSelect = $("opt-theme");
const langSelect = $("opt-lang");

let game = null; // { mode, n, cells, initial, moves, won, newRecord, key }
let T = null;    // module du thème actif (render + texts par langue)
let TT = null;   // textes du thème dans la langue active
let t = (key) => key; // traducteur UI (remplacé par loadMessages)
let locale = SUPPORTED_LOCALES.includes(getPref("lang")) ? getPref("lang") : getLocale();

// ---- Langue ----

// Charge les messages de la langue active (+ le repli par défaut), sans faire
// échouer l'init si un fichier manque.
async function loadMessages() {
  const read = (l) => loadLocale(l).catch(() => ({}));
  const [active, fallback] = await Promise.all([read(locale), read(DEFAULT_LOCALE)]);
  t = createTranslator({ locale, messages: { [locale]: active, [DEFAULT_LOCALE]: fallback } });
}

// Textes du thème actif dans la langue active (repli : champs FR du module).
function applyThemeTexts() {
  TT = T.texts?.[locale] ?? T;
  document.title = `Mimiri – ${TT.title}`;
  $("title").textContent = TT.title;
  $("goal").textContent = TT.goal;
  $("hint").textContent = TT.hint;
  $("left-label").textContent = TT.leftLabel;
}

// Textes d'interface (hors thème) dans la langue active.
function applyI18n() {
  document.documentElement.lang = locale;
  $("sizes-label").textContent = t("ui.gridSize");
  $("btn-daily").textContent = t("ui.daily");
  $("btn-new").textContent = t("ui.new");
  $("btn-reset").textContent = t("ui.restart");
  $("moves-label").textContent = t("ui.moves");
  $("best-label").textContent = t("ui.best");
  themeSelect.setAttribute("aria-label", t("ui.themeLabel"));
  // Labels des thèmes dans la langue active (clés theme.<id> dans les locales).
  themeSelect.querySelectorAll("option[value]").forEach((opt) => {
    opt.textContent = opt.value === "chaos" ? t("ui.chaos") : t(`theme.${opt.value}`);
  });
  langSelect.setAttribute("aria-label", t("ui.langLabel"));
  boardEl.setAttribute("aria-label", t("ui.boardLabel"));
}

// ---- Records (meilleur nombre de coups par taille de grille et par jour) ----
const bestFor = (key) => getJSON("best", {})[key] ?? "–";
function saveBest(key, moves) {
  const all = getJSON("best", {});
  if (all[key] !== undefined && all[key] <= moves) return false;
  all[key] = moves;
  setJSON("best", all);
  return true;
}

// ---- Parties ----
const persist = () => setJSON("save", game); // reprise de la partie après la pause

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
  if (g.mode === "daily" && g.key !== "daily-" + dayKey()) return null; // le défi d'hier n'est plus valable
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
  // Mode chaos : un autre thème à chaque coup. Pure déco — la grille et les
  // records ne changent pas, seul l'habillage bascule. Figé une fois gagné.
  if (chaosActive && !game.won) applyTheme("chaos");
}

// ---- Affichage ----
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

// `pressed` : case cliquée (pour l'animation des cases touchées), absent en cas de simple redessin.
function render(pressed) {
  const touched = new Set(pressed === undefined ? [] : touchedBy(game.n, pressed));
  game.cells.forEach((v, i) => {
    const b = boardEl.children[i];
    const state = v ? "on" : "off"; // on = à corriger, off = gagné
    if (b.dataset.state === state) return;
    b.dataset.state = state;
    b.className = "cell " + state;
    b.innerHTML = T.render(!!v, i);
    b.setAttribute("aria-label", v ? TT.ariaOn : TT.ariaOff);
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
    msg.textContent = `${TT.win}${game.newRecord ? " " + t("ui.newRecord") : ""} (${t("ui.movesCount", { n: game.moves })})`;
  } else {
    msg.className = "";
    msg.textContent = game.mode === "daily" ? t("ui.dailyNote") : "";
  }

  document.querySelectorAll("#sizes .pill").forEach((p) => {
    p.classList.toggle("active", game.mode === "free" && Number(p.dataset.n) === game.n);
  });
  $("btn-daily").classList.toggle("active", game.mode === "daily");
}

// ---- Thème (même mécanique que Free the Memes : classe sur <body> + feuille CSS dédiée) ----
const themeLink = document.createElement("link");
themeLink.rel = "stylesheet";
document.head.append(themeLink);

// Anciens identifiants français → nouveaux (renommage 2026-10) : on convertit la
// préférence sauvegardée pour ne pas perdre le choix des joueurs existants.
const LEGACY_THEME_IDS = { chatons: "kittens", chiots: "puppies", grincheux: "grumpy", jardin: "garden" };
const savedTheme = LEGACY_THEME_IDS[getPref("theme")] ?? getPref("theme", THEMES[0].id);

let themeSeq = 0; // évite qu'un changement de thème rapide écrase le suivant
let chaosActive = false;   // mode « chaos » : un nouveau thème à chaque coup
let currentThemeId = null; // thème réellement affiché (en chaos, il change tout le temps)

// id === "chaos" : pseudo-thème (absent du registre THEMES) qui habille la grille
// d'un thème tiré au hasard, différent du précédent, à chaque appel.
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
  setPref("theme", chaosActive ? "chaos" : def.id); // le choix « chaos » survit au rechargement

  document.body.classList.remove(...[...document.body.classList].filter((c) => c.startsWith("theme-")));
  document.body.classList.add(`theme-${def.id}`);
  themeLink.href = def.css;
  themeSelect.value = chaosActive ? "chaos" : def.id;

  applyThemeTexts();

  if (game) { // on force le redessin de toutes les cases avec le nouveau thème
    for (const b of boardEl.children) b.dataset.state = "";
    render();
  }
}

// ---- Initialisation ----
async function init() {
  await loadMessages();
  applyI18n();

  themeSelect.innerHTML = THEMES.map((th) => `<option value="${th.id}">${t(`theme.${th.id}`)}</option>`).join("");
  themeSelect.insertAdjacentHTML("beforeend", `<option value="chaos">${t("ui.chaos")}</option>`);
  themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));

  langSelect.innerHTML = SUPPORTED_LOCALES.map((l) => `<option value="${l}">${l.toUpperCase()}</option>`).join("");
  langSelect.value = locale;
  langSelect.addEventListener("change", async () => {
    locale = langSelect.value;
    setPref("lang", locale);
    await loadMessages();
    applyI18n();
    if (T) {
      applyThemeTexts();
      if (game) { // redessine tout : aria-labels et message dans la nouvelle langue
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
