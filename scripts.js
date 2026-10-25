// Generic game catalog. Knows no game in particular:
//   - cards.json lists the cards (GitHub Pages can't list a folder);
//   - each card_*.json gives its content, style and preview.
// Adding a game = a card_MYGAME.json + a line in cards.json; nothing else changes.
// Page text is in locales/<lang>.json. Card text is a string, or { "fr": "…", "en": "…" }.

const $ = (id) => document.getElementById(id);
const catalog = $("catalog");

// Available languages: locales/xx.json + a line here (cards fall back to French).
const LANGS = { fr: "Français", en: "English" };
const DEFAULT_LANG = "fr";
const LANG_KEY = "games-lang";

let lang = DEFAULT_LANG;
let messages = {};
let fallback = {};
let entries = [];     // [[class, card], ...]
let filter = "all";   // "all" | "solo" | "multi" (card "mode" field)
let featuredClass = null; // class of the featured card (set in cards.json)

// localStorage that never throws (private browsing, blocked storage…).
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

// --- Translation ---

const t = (key, vars = {}) =>
  (messages[key] ?? fallback[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);

// Card text in the active language: plain string, or { fr, en } object.
const tr = (v) =>
  v && typeof v === "object" && !Array.isArray(v) ? v[lang] ?? v[DEFAULT_LANG] ?? Object.values(v)[0] : v;

const loadLocale = (code) =>
  fetch(`locales/${code}.json`).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));

function initialLang() {
  const saved = store.get(LANG_KEY);
  if (LANGS[saved]) return saved;
  const nav = (navigator.language || "").split("-")[0];
  return LANGS[nav] ? nav : DEFAULT_LANG;
}

function applyTexts() {
  document.documentElement.lang = lang;
  document.title = t("page.title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
}

async function setLang(code) {
  lang = LANGS[code] ? code : DEFAULT_LANG;
  store.set(LANG_KEY, lang);
  [messages, fallback] = await Promise.all([loadLocale(lang), loadLocale(DEFAULT_LANG)]);
  $("lang").value = lang;
  applyTexts();
  render();
}

function initLangSelect() {
  const select = $("lang");
  select.innerHTML = Object.entries(LANGS)
    .map(([code, label]) => `<option value="${code}">${label}</option>`) // each language named in itself
    .join("");
  select.addEventListener("change", (e) => setLang(e.target.value));
}

// --- Styles ---

// JS object (camelCase) → CSS declarations. Custom properties (--x) are kept as-is.
const toDeclarations = (style) =>
  Object.entries(style ?? {})
    .map(([k, v]) => `${k.startsWith("--") ? k : k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}: ${v};`)
    .join(" ");

// One rule per card: .tile.card-xxx { <style> <css> }. The "css" field uses native CSS nesting
// (&, descendant selectors), so :hover, ::before etc. need nothing in styles.css.
const injectStyles = (list) => {
  const el = document.createElement("style");
  el.textContent = list
    .map(([cls, card]) => `.tile.${cls} { ${toDeclarations(card.style)} ${[].concat(card.css ?? []).join("\n")} }`)
    .join("\n");
  document.head.appendChild(el);
};

// card_FTM.json → "card-ftm": unique class from the file name.
const cardClass = (file) => "card-" + file.replace(/^card_?|\.json$/gi, "").toLowerCase();

// Google Fonts per card ("fonts" field, e.g. ["Fredoka:wght@600"]), deduplicated into one <link>.
const injectFonts = (list) => {
  const families = [...new Set(list.flatMap(([, card]) => card.fonts ?? []))];
  if (!families.length) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
  document.head.appendChild(link);
};

// --- Previews (generic, not tied to a game) ---

const PREVIEWS = {
  // Dice (hover animation: initDice).
  dice: (p) =>
    `<div class="preview preview-dice" aria-hidden="true">` +
    p.dice.map((d) => `<div class="die" data-sides="${d.sides}">${d.value}</div>`).join("") +
    (p.label ? `<span class="dice-label">${tr(p.label)}</span>` : "") +
    `</div>`,

  // Flippable cards. colors: the first entry with "max" >= value wins; the last may omit "max" (default).
  grid: (p) => {
    const colour = (v) => (p.colors.find((c) => c.max === undefined || v <= c.max) ?? {}).color;
    const cells = p.values
      .map(
        (v, i) =>
          `<span class="cell${(p.revealed ?? []).includes(i) ? " up" : ""}" style="--i:${i}">` +
          `<span class="cell-in"><span class="cell-back"></span>` +
          `<span class="cell-face" style="--c:${colour(v)}">${v}</span></span></span>`
      )
      .join("");
    return (
      `<div class="preview preview-grid" aria-hidden="true" style="grid-template-columns: repeat(${p.columns}, 1fr);` +
      ` grid-template-rows: repeat(${Math.ceil(p.values.length / p.columns)}, 1fr)">${cells}</div>`
    );
  },

  // Pixel mural: on hover, pixels vanish ring by ring from the edge (with some randomness).
  // map: rows of letters, colors: letter → color, "." = empty.
  mural: (p) => {
    const n = p.map.length;
    const px = p.map
      .flatMap((row, r) =>
        [...row].map((ch, c) => {
          if (ch === ".") return "<i></i>";
          const ring = Math.min(r, c, n - 1 - r, n - 1 - c);
          const delay = ring * 110 + Math.floor(Math.random() * 90);
          return `<i class="px" style="--c:${p.colors[ch]};--d:${delay}ms"></i>`;
        })
      )
      .join("");
    return (
      `<div class="preview preview-mural" aria-hidden="true">` +
      `<div class="mural-grid" style="grid-template-columns: repeat(${p.map[0].length}, 1fr)">${px}</div>` +
      (p.label ? `<span class="mural-label">${tr(p.label)}</span>` : "") +
      `</div>`
    );
  },

  // Switch-grid demo (initToggle). Full config passed via data-config; the HTML only has empty cells.
  toggle: (p) =>
    `<div class="preview preview-toggle" aria-hidden="true" data-config="${encodeURIComponent(JSON.stringify(p))}">` +
    `<div class="tg-grid" style="grid-template-columns: repeat(${p.columns}, 1fr)">` +
    Array.from({ length: p.columns * (p.rows ?? p.columns) }, () => `<span class="tg off"></span>`).join("") +
    `</div>${p.themes?.length ? `<span class="tg-label"></span>` : ""}</div>`,
};

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)");

// "dice" previews scramble on hover/focus, then land on a new roll. Off with reduced motion.
const initDice = () => {
  if (REDUCED.matches) return;
  document.querySelectorAll(".preview-dice").forEach((preview) => {
    const tile = preview.closest(".tile");
    const dice = [...preview.querySelectorAll(".die")];
    const roll = () => {
      let n = 0;
      const timer = setInterval(() => {
        dice.forEach((d) => (d.textContent = 1 + Math.floor(Math.random() * Number(d.dataset.sides))));
        if (++n > 8) clearInterval(timer);
      }, 70);
    };
    tile.addEventListener("mouseenter", roll);
    tile.addEventListener("focus", roll);
  });
};

// "toggle" previews loop a real game (a click flips a cell and its 4 neighbors), solve it, then
// switch theme. Config: columns, rows, presses (clicks that solve the grid),
// themes [{ on, off, onBg, offBg, boardBg, label }]. Reduced motion: static start grid.
// The loop stops by itself when the card is redrawn.
const initToggle = () => {
  const still = REDUCED.matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  document.querySelectorAll(".preview-toggle").forEach((preview) => {
    const cfg = JSON.parse(decodeURIComponent(preview.dataset.config));
    const cols = cfg.columns, rows = cfg.rows ?? cols;
    const cells = [...preview.querySelectorAll(".tg")];
    const label = preview.querySelector(".tg-label");
    const themes = cfg.themes ?? [{}];
    const state = new Array(cells.length).fill(0);
    let ti = 0;

    const press = (i) => {
      const r = Math.floor(i / cols), c = i % cols;
      [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) state[rr * cols + cc] ^= 1;
      });
    };
    const paint = () => {
      const th = themes[ti];
      preview.style.setProperty("--tg-on", th.onBg ?? "");
      preview.style.setProperty("--tg-off", th.offBg ?? "");
      preview.style.setProperty("--tg-board", th.boardBg ?? "");
      if (label) label.textContent = tr(th.label) ?? "";
      cells.forEach((el, i) => {
        const on = !!state[i], glyph = (on ? th.on : th.off) ?? "";
        if (el.classList.contains("on") !== on || el.textContent !== glyph) {
          el.classList.toggle("on", on);
          el.classList.toggle("off", !on);
          el.textContent = glyph;
          if (!still) el.animate([{ transform: "scale(.8)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }], { duration: 320 });
        }
      });
    };
    const scramble = () => { state.fill(0); cfg.presses.forEach(press); };
    const alive = () => preview.isConnected;

    scramble(); paint();
    if (still) return;
    (async () => {
      while (alive()) {
        await wait(1300);
        for (const i of cfg.presses) {
          while (document.hidden && alive()) await wait(500);
          if (!alive()) return;
          press(i); paint();
          await wait(700);
        }
        await wait(1800);                    // solved: everyone is happy
        ti = (ti + 1) % themes.length;       // next theme, new grid
        scramble(); paint();
      }
    })();
  });
};

// --- Cards ---

// One game card; only fields present in the JSON are rendered. featured: same card, wide layout
// and a .featured class (cards can style it with "&.featured …" in their "css").
const renderTile = ([cls, card], featured = false) => {
  const text = [`<h2>${tr(card.title)}</h2>`];
  const tagline = tr(card.tagline);
  const tags = (tr(card.tags) ?? []).map(tr);
  const preview = card.preview && PREVIEWS[card.preview.type] ? PREVIEWS[card.preview.type](card.preview) : "";
  if (tagline) text.push(`<p class="tagline">${tagline}</p>`);
  if (preview && !featured) text.push(preview); // regular card: preview stays in the text column
  if (card.description) text.push(`<p>${tr(card.description)}</p>`);
  if (tags.length) text.push(`<div class="tags">${tags.map((tag) => `<span>${tag}</span>`).join("")}</div>`);
  if (card.warning) text.push(`<p class="warning"><span>⚠ ${tr(card.warning)}</span></p>`);
  if (card.meta) text.push(`<p class="meta">${tr(card.meta)}</p>`);
  text.push(`<span class="go">${tr(card.button) ?? "→"}</span>`);
  const body = featured ? `<div class="main">${text.join("")}</div>${preview}` : text.join("");
  return (
    `<a class="tile ${cls}${featured ? " featured" : ""}" href="${card.path}">` +
    (card.badge ? `<span class="badge"><span>${tr(card.badge)}</span></span>` : "") +
    (card.ribbon ? `<div class="ribbon">${tr(card.ribbon)}</div>` : "") +
    `<div class="body">${body}</div></a>`
  );
};

const renderCard = (entry, index) => `<li style="--n:${index}">${renderTile(entry)}</li>`;

// --- Filters (All / Solo / With friends) ---

// One button per mode present, with its game count.
function renderFilters(list) {
  const modes = ["all", "solo", "multi"].filter((m) => m === "all" || list.some(([, c]) => c.mode === m));
  const count = (m) => (m === "all" ? list.length : list.filter(([, c]) => c.mode === m).length);
  $("filters").innerHTML = modes.length > 2
    ? modes
        .map((m) => `<button type="button" data-filter="${m}" aria-pressed="${m === filter}">` +
          `${t(`filter.${m}`)} <span class="n">${count(m)}</span></button>`)
        .join("")
    : ""; // a single kind of game: no filter needed
}

// The featured game sits above the list; the list shows the others.
function render() {
  $("eyebrow").textContent = t("hero.eyebrow", { n: entries.length });
  const star = entries.find(([cls]) => cls === featuredClass);
  const others = entries.filter((e) => e !== star);
  $("featured").hidden = !star;
  $("featured-slot").innerHTML = star ? renderTile(star, true) : "";
  $("list-title").textContent = t(star ? "list.others" : "list.all");
  renderFilters(others);
  const shown = others.filter(([, c]) => filter === "all" || c.mode === filter);
  catalog.innerHTML = shown.map(renderCard).join("");
  initDice();
  initToggle();
}

$("filters").addEventListener("click", (e) => {
  const button = e.target.closest("[data-filter]");
  if (!button || button.dataset.filter === filter) return;
  filter = button.dataset.filter;
  render();
});

// --- Startup ---

async function main() {
  initLangSelect();
  // cards.json: { "featured": "card_X.json", "cards": [...] } (a plain array still works).
  const list = await fetch("cards.json").then((r) => r.json());
  const files = Array.isArray(list) ? list : list.cards ?? [];
  featuredClass = !Array.isArray(list) && list.featured ? cardClass(list.featured) : null;
  const results = await Promise.all(files.map(async (file) => {
    try {
      const r = await fetch(encodeURI(file));
      if (!r.ok) throw new Error(r.status);
      return [cardClass(file), await r.json()];
    } catch (err) {
      console.error(`Fiche ignorée (${file}) :`, err);
      return null;
    }
  }));
  entries = results.filter(Boolean);
  injectFonts(entries);
  injectStyles(entries);
  await setLang(initialLang()); // translates the page and draws the cards
}

main().catch(async (err) => {
  console.error("Impossible de charger le catalogue des jeux :", err);
  if (!Object.keys(messages).length) [messages, fallback] = await Promise.all([loadLocale(lang), loadLocale(DEFAULT_LANG)]);
  catalog.innerHTML = `<li class="error">${t("error.load")}</li>`;
});
