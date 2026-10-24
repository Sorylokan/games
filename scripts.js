// Moteur générique du catalogue de jeux (chargé en type="module", DOM prêt).
//
// Ce script ne connaît AUCUN jeu individuellement :
//   1. cards.json liste les fiches disponibles (GitHub Pages ne permet pas
//      de lister un dossier, d'où ce fichier technique) ;
//   2. chaque card_*.json fournit le contenu, le style et l'aperçu de sa carte ;
//   3. les cartes sont générées puis injectées dans #catalog.
//
// Pour ajouter un jeu : créer card_MONJEU.json + l'ajouter à cards.json,
// sans toucher à index.html, scripts.js ni styles.css.
//
// Langues : les textes de la page sont dans locales/<langue>.json. Dans les fiches,
// tout texte peut être une simple chaîne (identique dans toutes les langues)
// ou un objet par langue : { "fr": "Jouer →", "en": "Play →" }.

const $ = (id) => document.getElementById(id);
const catalog = $("catalog");

// Langues proposées. Pour en ajouter une : locales/xx.json + une ligne ici
// (+ les traductions "xx" dans les fiches ; à défaut, le français s'affiche).
const LANGS = { fr: "Français", en: "English" };
const DEFAULT_LANG = "fr";
const LANG_KEY = "games-lang";

let lang = DEFAULT_LANG;
let messages = {};
let fallback = {};
let entries = [];     // [[classe, fiche], ...]
let filter = "all";   // "all" | "solo" | "multi" (champ "mode" des fiches)
let featuredClass = null; // classe de la fiche du « jeu du moment » (choisie dans cards.json)

// localStorage sans jamais planter (navigation privée, stockage bloqué...).
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* tant pis */ } },
};

// --- Traduction ------------------------------------------------------------------

const t = (key, vars = {}) =>
  (messages[key] ?? fallback[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);

// Texte d'une fiche dans la langue active : chaîne telle quelle, ou objet { fr, en }.
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
    .map(([code, label]) => `<option value="${code}">${label}</option>`) // chaque langue écrite dans sa propre langue
    .join("");
  select.addEventListener("change", (e) => setLang(e.target.value));
}

// --- Injection des styles -----------------------------------------------------

// Objet JS (camelCase) -> déclarations CSS. Les custom properties (--x) restent telles quelles.
const toDeclarations = (style) =>
  Object.entries(style ?? {})
    .map(([k, v]) => `${k.startsWith("--") ? k : k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}: ${v};`)
    .join(" ");

// Injecte une règle par carte : .tile.card-xxx { <style> <css> }
// Le champ "css" des JSON utilise le nesting CSS natif (&, sélecteurs descendants),
// ce qui permet :hover, ::before, etc. sans rien dédier dans styles.css.
const injectStyles = (list) => {
  const el = document.createElement("style");
  el.textContent = list
    .map(([cls, card]) => `.tile.${cls} { ${toDeclarations(card.style)} ${[].concat(card.css ?? []).join("\n")} }`)
    .join("\n");
  document.head.appendChild(el);
};

// card_FTM.json -> "card-ftm" : classe unique dérivée du nom de fichier.
const cardClass = (file) => "card-" + file.replace(/^card_?|\.json$/gi, "").toLowerCase();

// Polices Google Fonts propres à chaque fiche (champ "fonts", valeurs au format
// family=... : ["Fredoka:wght@600", "Nunito:wght@400;700"]). Dédupliquées et
// injectées en un seul <link> : un nouveau jeu n'a jamais à toucher index.html.
const injectFonts = (list) => {
  const families = [...new Set(list.flatMap(([, card]) => card.fonts ?? []))];
  if (!families.length) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
  document.head.appendChild(link);
};

// --- Aperçus (registre extensible, aucun n'est lié à un jeu précis) ------------

const PREVIEWS = {
  // Dés affichés sur la carte (animation au survol : voir initDice).
  dice: (p) =>
    `<div class="preview preview-dice" aria-hidden="true">` +
    p.dice.map((d) => `<div class="die" data-sides="${d.sides}">${d.value}</div>`).join("") +
    (p.label ? `<span class="dice-label">${tr(p.label)}</span>` : "") +
    `</div>`,

  // Grille de cartes retournables. colors : la première entrée dont "max" >= valeur
  // l'emporte ; la dernière peut omettre "max" pour servir de couleur par défaut.
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

  // Fresque en pixels : au survol, les pixels disparaissent du bord vers le centre
  // (anneau par anneau, avec un peu de hasard). map : lignes de lettres,
  // colors : lettre -> couleur, "." = case vide.
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

  // Démo d'une grille d'interrupteurs (voir initToggle) : la configuration complète est
  // transmise à initToggle via data-config, le HTML ne contient que les cases vides.
  toggle: (p) =>
    `<div class="preview preview-toggle" aria-hidden="true" data-config="${encodeURIComponent(JSON.stringify(p))}">` +
    `<div class="tg-grid" style="grid-template-columns: repeat(${p.columns}, 1fr)">` +
    Array.from({ length: p.columns * (p.rows ?? p.columns) }, () => `<span class="tg off"></span>`).join("") +
    `</div>${p.themes?.length ? `<span class="tg-label"></span>` : ""}</div>`,
};

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)");

// Animation des aperçus "dice" : les dés se brouillent au survol/focus,
// puis s'arrêtent sur un nouveau tirage. Désactivée si prefers-reduced-motion.
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

// Démo des aperçus "toggle" : la grille rejoue en boucle une vraie partie (un clic bascule la case
// et ses 4 voisines), se résout, puis passe au thème suivant. Config : columns, rows, presses (les
// clics qui résolvent la grille), themes [{ on, off, onBg, offBg, boardBg, label }].
// Sans animation (prefers-reduced-motion), on affiche juste la grille de départ.
// La boucle s'arrête d'elle-même quand la carte est redessinée (changement de langue, filtre).
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
        await wait(1800);                    // grille résolue : tout le monde est content
        ti = (ti + 1) % themes.length;       // thème suivant, nouvelle grille
        scramble(); paint();
      }
    })();
  });
};

// --- Génération des cartes -----------------------------------------------------

// Une carte de jeu. Seuls les champs présents dans le JSON sont rendus (ribbon, tagline, tags...).
// featured = vrai pour le « jeu du moment » : même fiche, mais mise en page large
// (texte à gauche, aperçu à droite) et classe .featured sur la carte. Une fiche peut
// donc adapter son style à ce cas avec "&.featured ..." dans son champ "css".
const renderTile = ([cls, card], featured = false) => {
  const text = [`<h2>${tr(card.title)}</h2>`];
  const tagline = tr(card.tagline);
  const tags = (tr(card.tags) ?? []).map(tr);
  const preview = card.preview && PREVIEWS[card.preview.type] ? PREVIEWS[card.preview.type](card.preview) : "";
  if (tagline) text.push(`<p class="tagline">${tagline}</p>`);
  if (preview && !featured) text.push(preview); // carte normale : l'aperçu reste dans le texte
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

// --- Filtres (Tous / Solo / Entre amis) -------------------------------------------

// Un bouton par mode présent dans la liste, avec le nombre de jeux concernés.
// Un mode inconnu (sans traduction "filter.<mode>") est simplement ignoré.
function renderFilters(list) {
  const modes = ["all", "solo", "multi"].filter((m) => m === "all" || list.some(([, c]) => c.mode === m));
  const count = (m) => (m === "all" ? list.length : list.filter(([, c]) => c.mode === m).length);
  $("filters").innerHTML = modes.length > 2
    ? modes
        .map((m) => `<button type="button" data-filter="${m}" aria-pressed="${m === filter}">` +
          `${t(`filter.${m}`)} <span class="n">${count(m)}</span></button>`)
        .join("")
    : ""; // un seul type de jeu : pas besoin de filtre
}

// Le jeu du moment est mis en avant au-dessus de la liste ; la liste montre les autres.
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

// --- Démarrage ---------------------------------------------------------------------

async function main() {
  initLangSelect();
  // cards.json : { "featured": "card_X.json", "cards": [...] }.
  // L'ancien format (un simple tableau, sans jeu du moment) marche toujours.
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
  await setLang(initialLang()); // traduit la page et dessine les cartes
}

main().catch(async (err) => {
  console.error("Impossible de charger le catalogue des jeux :", err);
  if (!Object.keys(messages).length) [messages, fallback] = await Promise.all([loadLocale(lang), loadLocale(DEFAULT_LANG)]);
  catalog.innerHTML = `<li class="error">${t("error.load")}</li>`;
});
